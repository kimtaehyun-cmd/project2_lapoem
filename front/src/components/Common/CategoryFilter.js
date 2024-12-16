import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { GET_BOOK_ALL_CATEGORIES_API_URL } from '../../util/apiUrl';
import './Common.css';

const CategoryFilter = ({ onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 카테고리 목록을 불러오기
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(GET_BOOK_ALL_CATEGORIES_API_URL);
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = (e) => {
    const selectedCategoryId = e.target.value;
    onCategoryChange(selectedCategoryId);
  };

  return (
    <div className="category-filter">
      <label htmlFor="category"></label>
      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <select id="category" onChange={handleCategorySelect}>
          <option value="">전체</option>
          {categories.map((category) => (
            <option key={category.genre_tag_id} value={category.genre_tag_id}>
              {category.genre_tag_name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CategoryFilter;
