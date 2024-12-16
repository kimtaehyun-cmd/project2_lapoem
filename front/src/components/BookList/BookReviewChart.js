import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { GET_BOOK_REVIEW_DISTRIBUTION_API_URL } from '../../util/apiUrl';
import heartImage from '../../assets/images/heart-rating.png';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BookReviewDistributionChart = () => {
  const { bookId } = useParams();
  const [reviewData, setReviewData] = useState({
    ratingDistribution: Array(5).fill(0),
    genderAgeDistribution: {
      female: Array(6).fill(0),
      male: Array(6).fill(0),
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviewDistributionData();
  }, [bookId]);

  const fetchReviewDistributionData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        GET_BOOK_REVIEW_DISTRIBUTION_API_URL(bookId),
        {
          withCredentials: true,
        }
      );

      console.log('API Response Data:', response.data);

      const ratingDistribution = response.data.rating_distribution.map(Number);
      const genderAgeDistribution = {
        female: response.data.gender_age_distribution.female.map(Number),
        male: response.data.gender_age_distribution.male.map(Number),
      };

      setReviewData({
        ratingDistribution: ratingDistribution || Array(5).fill(0),
        genderAgeDistribution: genderAgeDistribution || {
          female: Array(6).fill(0),
          male: Array(6).fill(0),
        },
      });
    } catch (err) {
      console.error('Error fetching review distribution data:', err);
      setError('리뷰 데이터를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const totalRatings = reviewData.ratingDistribution.reduce((a, b) => a + b, 0);

  const averageRating =
    totalRatings > 0
      ? (
          reviewData.ratingDistribution.reduce(
            (sum, count, index) => sum + count * (index * 2 + 2),
            0
          ) / totalRatings
        ).toFixed(1)
      : 'N/A';

  const heartsArray = [
    Array(5).fill(0),
    Array(4).fill(0),
    Array(3).fill(0),
    Array(2).fill(0),
    Array(1).fill(0),
  ];

  const ratingDistributionData = {
    labels: ['', '', '', '', ''],
    datasets: [
      {
        label: '평점 분포',
        data: [...reviewData.ratingDistribution].reverse(),
        backgroundColor: 'rgba(203, 157, 240, 0.5)',
        borderColor: 'rgba(139, 93, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const genderAgeDistributionData = {
    labels: ['10대', '20대', '30대', '40대', '50대', '60대 이상'],
    datasets: [
      {
        label: '여성',
        data: reviewData.genderAgeDistribution.female,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: '남성',
        data: reviewData.genderAgeDistribution.male,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
    ],
  };

  const ratingDistributionOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const percentage = ((context.raw / totalRatings) * 100).toFixed(1);
            return `${context.raw}명 (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        reverse: false,
        ticks: {
          display: false,
        },
      },
      x: {
        beginAtZero: true,
        max: Math.max(...reviewData.ratingDistribution) + 5,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
    },
  };

  const genderAgeDistributionOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => {
            const totalForGender =
              context.dataset.label === '여성'
                ? reviewData.genderAgeDistribution.female.reduce(
                    (a, b) => a + b,
                    0
                  )
                : reviewData.genderAgeDistribution.male.reduce(
                    (a, b) => a + b,
                    0
                  );
            const percentage = ((context.raw / totalForGender) * 100).toFixed(
              1
            );
            return `${context.raw}명 (${percentage}%)`;
          },
        },
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        display: false,
      },
    },
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div
        style={{
          borderBottom: '1px solid var(--text-gray-light)',
          margin: '40px auto 80px auto',
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '1255px',
        }}
      ></div>
      <h2
        style={{
          textAlign: 'center',
          fontSize: '30px',
          fontFamily: 'var(--font-en)',
          fontWeight: 'bold',
          color: 'var(--text-point)',
          marginBottom: '100px',
        }}
      >
        REVIEW GRAPH
      </h2>
      <div style={{ display: 'flex', gap: '50px' }}>
        <div style={{ width: '45%' }}>
          <h3
            style={{
              textAlign: 'center',
              fontSize: '1.3em',
              marginBottom: '20px',
              color: 'var(--text-gray-medium)',
              fontFamily: 'var(--font-kr)',
            }}
          >
            리뷰 작성자 분포
          </h3>
          <Bar
            data={genderAgeDistributionData}
            options={genderAgeDistributionOptions}
          />
        </div>
        <div style={{ width: '45%' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', marginTop: '90px' }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                marginRight: '10px',
                gap: '34px',
              }}
            >
              {heartsArray.map((hearts, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {hearts.map((_, i) => (
                    <img
                      key={i}
                      src={heartImage}
                      alt="Heart"
                      style={{
                        width: '19px',

                        marginRight: '2px',
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <div style={{ height: '270px' }}>
                <Bar
                  data={ratingDistributionData}
                  options={ratingDistributionOptions}
                />
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: -90,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: 'var(--text-gray-medium)',
                  fontFamily: 'var(--font-kr)',
                  fontSize: '1.3em',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span>
                    점수별 평점 분포 <br />
                    <span
                      style={{
                        fontSize: '18px',
                      }}
                    >
                      ({averageRating} 점 / 10점)
                    </span>
                  </span>
                </div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: '-40px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  height: '100%',
                }}
              >
                {reviewData.ratingDistribution
                  .slice()
                  .reverse()
                  .map((count, index) => {
                    const percentage = totalRatings
                      ? ((count / totalRatings) * 100).toFixed(1)
                      : 0;
                    return (
                      <span
                        key={index}
                        style={{ color: 'var(--text-gray-medium)' }}
                      >
                        {percentage}%
                      </span>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookReviewDistributionChart;
