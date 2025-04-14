import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'react-toastify';

const GarageListPage = () => {
  const [garages, setGarages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { token, user, baseUrl } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    fetchGarages();
  }, [search, sortBy]);

  const fetchGarages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/api/v1/garages`, {
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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="container px-4 py-8 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Auto Service Garages</h1>
          {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
            <Link 
              to="/garages/new"
              className={`px-4 py-2 rounded-md ${
                theme === 'dark' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              Add New Garage
            </Link>
          )}
        </div>

        <div className="flex flex-col mb-6 space-y-3 md:space-y-0 md:flex-row md:space-x-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="Search garages..."
              value={search}
              onChange={handleSearch}
              className={`w-full px-4 py-2 rounded-md ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div>
            <select
              value={sortBy}
              onChange={handleSort}
              className={`px-4 py-2 rounded-md ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="name">Sort by Name (A-Z)</option>
              <option value="-name">Sort by Name (Z-A)</option>
              <option value="-ratings">Sort by Rating (High to Low)</option>
              <option value="ratings">Sort by Rating (Low to High)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-t-4 rounded-full border-gray-300 border-t-blue-500 animate-spin"></div>
          </div>
        ) : garages.length === 0 ? (
          <div className={`p-8 text-center rounded-lg ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow`}>
            <p className="text-lg">No garages found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {garages.map((garage) => (
              <Link
                to={`/garages/${garage.id}`}
                key={garage.id}
                className={`block transition-transform transform hover:scale-105 ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                } rounded-lg shadow overflow-hidden`}
              >
                <div className="h-48 bg-blue-500 flex items-center justify-center">
                  <div className="w-16 h-16 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{garage.name}</h2>
                  <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {garage.location?.address || 'Address not available'}
                  </p>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(garage.ratings || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-sm">
                        {garage.ratings ? garage.ratings.toFixed(1) : 'No ratings'}
                      </span>
                    </div>
                    <div className={`ml-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
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