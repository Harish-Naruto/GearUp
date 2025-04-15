import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';
import './GarageListPage.css'; // Import the external CSS file

const GarageListPage = () => {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { token, user } = useContext(AuthContext);
  const { theme } = useTheme();

  useEffect(() => {
    // Set the theme attribute on the container to apply theme-specific CSS variables
    document.documentElement.setAttribute('data-theme', theme);
    fetchGarages();
  }, [search, sortBy, theme]);

  const fetchGarages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/v1/garages`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          search,
          sort: sortBy
        }
      });
      setGarages(response.data.data.garages);
    } catch (error) {
      console.error('Error fetching garages:', error);
      toast.error('Failed to load garages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="garage-page">
      <div className="container">
        <div className="header">
          <h1 className="page-title">Auto Service Garages</h1>
          {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
            <Link to="/garages/new" className="btn-primary">
              Add New Garage
            </Link>
          )}
        </div>

        <div className="filters-container">
          <input
            type="text"
            placeholder="Search garages..."
            value={search}
            onChange={handleSearch}
            className="search-input"
          />
          <select
            value={sortBy}
            onChange={handleSort}
            className="sort-select"
          >
            <option value="name">Sort by Name (A-Z)</option>
            <option value="-name">Sort by Name (Z-A)</option>
            <option value="-ratings">Sort by Rating (High to Low)</option>
            <option value="ratings">Sort by Rating (Low to High)</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : garages.length === 0 ? (
          <div className="empty-state">
            <p className="empty-message">No garages found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="garage-grid">
            {garages.map((garage) => (
              <Link
                to={`/garages/${garage.id}`}
                key={garage.id}
                className="garage-card"
              >
                <div className="garage-image">
                  <div className="garage-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <div className="garage-content">
                  <h2 className="garage-title">{garage.name}</h2>
                  <p className="garage-address">
                    {garage.location?.address || 'Address not available'}
                  </p>
                  <div className="garage-footer">
                    <div className="rating-container">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`star ${i < Math.round(garage.ratings || 0) ? 'star-filled' : 'star-empty'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="rating-value">
                        {garage.ratings ? garage.ratings.toFixed(1) : 'No ratings'}
                      </span>
                    </div>
                    <div className="service-count">
                      {garage.services?.length || 0} services
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GarageListPage;