const database = require('../database/database');
const jwt = require('jsonwebtoken');

// 책 상세 정보 불러오기=================================================
const getBookDetail = async (req, res) => {
  const { bookId } = req.params;

  try {
    // 책 정보와 리뷰의 평균 평점 및 총 리뷰 개수 조회
    const query = `
        SELECT 
            b.book_id,
            b.book_cover,
            b.book_publisher,
            TO_CHAR(b.publish_date, 'YYYY.MM.DD') AS publish_date, -- 형식을 2018.11.08로 변경
            b.isbn,
            b.book_description,
            b.book_price,
            b.is_book_best,
            b.book_title,
            b.book_author,
            b.genre_tag_name,
            b.book_status,
            b.sent_email,
            TO_CHAR(b.book_create_date, 'YYYY.MM.DD') AS book_create_date,
            TO_CHAR(b.book_update_date, 'YYYY.MM.DD') AS book_update_date,
            TO_CHAR(b.book_delete_date, 'YYYY.MM.DD') AS book_delete_date,
            CASE 
              WHEN AVG(br.rating) IS NULL THEN 0 
              ELSE ROUND(AVG(br.rating), 1) 
            END AS average_rating, -- NULL일 때는 0, 아닐 때는 소수점 1자리로 반올림
            COUNT(br.rating) AS review_count  -- 리뷰 개수
        FROM 
            book AS b
        LEFT JOIN 
            book_review AS br
            ON b.book_id = br.book_id
            AND br.review_status = 'active'
        WHERE 
            b.book_id = $1
        GROUP BY 
            b.book_id
    `;

    const result = await database.query(query, [bookId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.json(result.rows[0]); // 첫 번째 책 정보 반환
  } catch (error) {
    console.error('Error fetching book details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 책 리뷰 불러오기=================================================
const getBookReviews = async (req, res) => {
  try {
    const { bookId } = req.params;
    // bookId가 없을 경우 오류 반환
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required.' });
    }

    // 특정 책에 대한 리뷰와 작성자 정보를 가져오기 위한 쿼리
    const query = `
      SELECT 
        r.review_num,
        r.review_content,
        r.rating,
        to_char(r.review_created_at, 'YY.MM.DD (HH24:MI)') AS review_created_at,
        m.member_num,
        m.member_nickname,
        m.member_gender,
        to_char(m.member_birth_date, 'YY.MM.DD') AS member_birth_date
      FROM 
        book_review r
      JOIN 
        member m ON r.member_num = m.member_num
      WHERE 
        r.book_id = $1 AND r.review_status = 'active'
      ORDER BY 
        r.review_created_at DESC
    `;

    // 쿼리 실행
    const result = await database.query(query, [bookId]);

    // 리뷰 목록 반환
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching book reviews:', error);
    res.status(500).json({ error: 'An error occurred while fetching reviews' });
  }
};

// 책 리뷰 작성=================================================
// JWT를 사용해 로그인 상태를 확인하는 미들웨어
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err)
      return res.status(401).json({ message: 'Token is invalid or expired' });
    req.user = decoded; // 인증된 사용자 정보 저장
    next();
  });
};

// 리뷰 작성 컨트롤러
const postBookReview = async (req, res) => {
  try {
    const { bookId } = req.params; // URL에서 bookId 가져오기
    const { review_content, rating = 0 } = req.body; // 기본 평점은 0
    const member_num = req.user.memberNum; // 인증된 사용자 ID 가져오기

    // 필수 필드 검증
    if (!bookId || !review_content) {
      return res
        .status(400)
        .json({ error: 'Book ID and review content are required.' });
    }

    // 평점 유효성 검사 (1 ~ 10 범위, [2, 4, 6, 8, 10])
    const validRatings = Array.from({ length: 5 }, (_, i) => (i + 1) * 2);

    if (!validRatings.includes(parseFloat(rating))) {
      return res.status(400).json({
        error: 'Rating must be between 0.5 and 10, in 0.5 increments.',
      });
    }

    // 리뷰를 데이터베이스에 삽입
    const result = await database.query(
      `INSERT INTO book_review (book_id, member_num, review_content, rating, review_created_at, review_status)
       VALUES ($1, $2, $3, $4, NOW(), 'active') RETURNING review_num`,
      [bookId, member_num, review_content, rating]
    );

    // 성공 응답 반환
    res.status(201).json({
      message: 'Review created successfully',
      reviewId: result.rows[0].review_num,
    });
  } catch (error) {
    console.error('Error posting review:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while posting the review' });
  }
};

// 책 리뷰 삭제=================================================
const deleteBookReview = async (req, res) => {
  try {
    const { reviewId } = req.params; // URL에서 reviewId 가져오기
    const member_num = req.user.memberNum; // 인증된 사용자 ID 가져오기

    // 리뷰가 존재하고, 사용자 권한이 있는지 확인
    const review = await database.query(
      `SELECT * FROM book_review WHERE review_num = $1 AND member_num = $2 AND review_status = 'active'`,
      [reviewId, member_num]
    );

    if (review.rows.length === 0) {
      return res
        .status(404)
        .json({ error: 'Review not found or access denied' });
    }

    // review_status를 'inactive'로 업데이트하여 리뷰를 숨기기
    await database.query(
      `UPDATE book_review
       SET review_status = 'inactive', review_deleted_at = NOW()
       WHERE review_num = $1`,
      [reviewId]
    );

    // 성공 응답 반환
    res.status(200).json({
      message: 'Review deleted successfully (status set to inactive)',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while deleting the review' });
  }
};

// 백엔드 코드: 리뷰 작성자 및 평점 분포 API ===================================================
const getReviewDistribution = async (req, res) => {
  const { bookId } = req.params;

  try {
    const query = `
      WITH age_groups AS (
        SELECT
          member_num,
          CASE
            WHEN EXTRACT(YEAR FROM AGE(NOW(), member_birth_date)) BETWEEN 10 AND 19 THEN '10대'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), member_birth_date)) BETWEEN 20 AND 29 THEN '20대'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), member_birth_date)) BETWEEN 30 AND 39 THEN '30대'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), member_birth_date)) BETWEEN 40 AND 49 THEN '40대'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), member_birth_date)) BETWEEN 50 AND 59 THEN '50대'
            ELSE '60대 이상'
          END AS age_group,
          member_gender
        FROM member
      ),
      review_info AS (
        SELECT
          r.rating,
          m.age_group,
          m.member_gender
        FROM book_review r
        JOIN age_groups m ON r.member_num = m.member_num
        WHERE r.book_id = $1 AND r.review_status = 'active'
      )
      SELECT
        -- 평점 분포
        ARRAY[
          (SELECT COUNT(*) FROM review_info WHERE rating = 2),
          (SELECT COUNT(*) FROM review_info WHERE rating = 4),
          (SELECT COUNT(*) FROM review_info WHERE rating = 6),
          (SELECT COUNT(*) FROM review_info WHERE rating = 8),
          (SELECT COUNT(*) FROM review_info WHERE rating = 10)
        ] AS rating_distribution,
        -- 나이 및 성별 분포
        JSONB_BUILD_OBJECT(
          'female', ARRAY[
            (SELECT COUNT(*) FROM review_info WHERE member_gender = '여' AND age_group = '10대'),
            (SELECT COUNT(*) FROM review_info WHERE member_gender = '여' AND age_group = '20대'),
            (SELECT COUNT(*) FROM review_info WHERE member_gender = '여' AND age_group = '30대'),
            (SELECT COUNT(*) FROM review_info WHERE member_gender = '여' AND age_group = '40대'),
            (SELECT COUNT(*) FROM review_info WHERE member_gender = '여' AND age_group = '50대'),
            (SELECT COUNT(*) FROM review_info WHERE member_gender = '여' AND age_group = '60대 이상')
          ],
          'male', ARRAY[
            (SELECT COUNT(*) FROM review_info WHERE member_gender = '남' AND age_group = '10대'),
            (SELECT COUNT(*) FROM review_info WHERE member_gender = '남' AND age_group = '20대'),
            (SELECT COUNT(*) FROM review_info WHERE member_gender = '남' AND age_group = '30대'),
            (SELECT COUNT(*) FROM review_info WHERE member_gender = '남' AND age_group = '40대'),
            (SELECT COUNT(*) FROM review_info WHERE member_gender = '남' AND age_group = '50대'),
            (SELECT COUNT(*) FROM review_info WHERE member_gender = '남' AND age_group = '60대 이상')
          ]
        ) AS gender_age_distribution
      FROM review_info
    `;

    const result = await database.query(query, [bookId]);

    if (result.rows.length === 0) {
      return res.status(200).json({
        rating_distribution: [0, 0, 0, 0, 0],
        gender_age_distribution: {
          female: [0, 0, 0, 0, 0, 0],
          male: [0, 0, 0, 0, 0, 0],
        },
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching review distribution:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getBookDetail,
  getBookReviews,
  postBookReview,
  verifyToken,
  deleteBookReview,
  getReviewDistribution,
};
