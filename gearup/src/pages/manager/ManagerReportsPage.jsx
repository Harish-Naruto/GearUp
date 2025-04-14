import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import { ThemeContext } from '../../contexts/ThemeContext';
import Spinner from '../../components/ui/Spinner';
import ErrorAlert from '../../components/common/ErrorAlert';
import { LineChart, BarChart, XAxis, YAxis, Tooltip, Legend, Line, Bar, CartesianGrid, ResponsiveContainer } from 'recharts';

const ManagerReportsPage = () => {
  const { user, token } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportPeriod, setReportPeriod] = useState('weekly');
  const [revenueData, setRevenueData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [serviceStats, setServiceStats] = useState([]);
  const [workerStats, setWorkerStats] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    avgServiceRating: 0
  });
  
  useEffect(() => {
    // Verify user is a manager
    if (!user || user.role !== 'MANAGER') {
      navigate('/dashboard');
      return;
    }
    
    fetchReportData();
  }, [user, token, navigate, reportPeriod]);
  
  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch all bookings for the manager's garage
      const bookingsResponse = await axios.get('http://localhost:3000/api/v1/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const bookings = bookingsResponse.data.data.bookings;
      
      // Process the data for reports
      processBookingsData(bookings);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch report data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const processBookingsData = (bookings) => {
    // Calculate summary statistics
    const total = bookings.length;
    const completed = bookings.filter(b => b.status === 'COMPLETED').length;
    const pending = bookings.filter(b => b.status === 'PENDING').length;
    const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
    
    // Calculate total revenue from completed bookings
    const revenue = bookings
      .filter(b => b.status === 'COMPLETED' && b.payment_status === 'PAID')
      .reduce((sum, booking) => sum + (booking.amount || 0), 0);
    
    // Mock average rating (since we don't have this in the data)
    const avgRating = 4.7;
    
    setSummaryStats({
      totalBookings: total,
      completedBookings: completed,
      pendingBookings: pending,
      cancelledBookings: cancelled,
      totalRevenue: revenue,
      avgServiceRating: avgRating
    });
    
    // Generate time-series data based on the selected period
    generateTimeSeriesData(bookings);
    
    // Generate service type statistics
    generateServiceStats(bookings);
    
    // Generate worker performance statistics
    generateWorkerStats(bookings);
  };
  
  const generateTimeSeriesData = (bookings) => {
    const now = new Date();
    let dateFormat, periods, periodLength;
    
    // Configure date ranges based on selected period
    if (reportPeriod === 'weekly') {
      dateFormat = date => date.toLocaleDateString(undefined, { weekday: 'short' });
      periods = 7; // days
      periodLength = 24 * 60 * 60 * 1000; // one day in ms
    } else if (reportPeriod === 'monthly') {
      dateFormat = date => date.toLocaleDateString(undefined, { day: 'numeric' });
      periods = 30; // days
      periodLength = 24 * 60 * 60 * 1000; // one day in ms
    } else { // yearly
      dateFormat = date => date.toLocaleDateString(undefined, { month: 'short' });
      periods = 12; // months
      periodLength = 30 * 24 * 60 * 60 * 1000; // approx one month in ms
    }
    
    // Initialize empty data arrays
    const revenueArray = [];
    const bookingsArray = [];
    
    // Fill with data points
    for (let i = 0; i < periods; i++) {
      const date = new Date(now - (periods - 1 - i) * periodLength);
      const label = dateFormat(date);
      
      // For revenue chart
      const periodStart = new Date(now - (periods - i) * periodLength);
      const periodEnd = new Date(now - (periods - 1 - i) * periodLength);
      
      // Filter bookings in this period
      const periodBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.scheduled_time);
        return bookingDate >= periodStart && bookingDate <= periodEnd;
      });
      
      // Calculate revenue and count for this period
      const periodRevenue = periodBookings
        .filter(b => b.status === 'COMPLETED' && b.payment_status === 'PAID')
        .reduce((sum, booking) => sum + (booking.amount || 0), 0);
      
      const periodCount = periodBookings.length;
      
      revenueArray.push({ 
        name: label, 
        revenue: periodRevenue
      });
      
      bookingsArray.push({
        name: label,
        total: periodCount,
        completed: periodBookings.filter(b => b.status === 'COMPLETED').length,
        cancelled: periodBookings.filter(b => b.status === 'CANCELLED').length
      });
    }
    
    setRevenueData(revenueArray);
    setBookingsData(bookingsArray);
  };
  
  const generateServiceStats = (bookings) => {
    // Group bookings by service type
    const serviceGroups = {};
    
    bookings.forEach(booking => {
      const serviceType = booking.service_type;
      if (!serviceGroups[serviceType]) {
        serviceGroups[serviceType] = {
          name: serviceType,
          count: 0,
          revenue: 0,
          completed: 0
        };
      }
      
      serviceGroups[serviceType].count++;
      
      if (booking.status === 'COMPLETED') {
        serviceGroups[serviceType].completed++;
        if (booking.payment_status === 'PAID') {
          serviceGroups[serviceType].revenue += (booking.amount || 0);
        }
      }
    });
    
    // Convert to array and sort by count
    const serviceArray = Object.values(serviceGroups).sort((a, b) => b.count - a.count);
    setServiceStats(serviceArray);
  };
  
  const generateWorkerStats = (bookings) => {
    // Group bookings by worker
    const workerGroups = {};
    
    bookings.forEach(booking => {
      if (!booking.worker_id) return;
      
      const workerId = booking.worker_id;
      if (!workerGroups[workerId]) {
        workerGroups[workerId] = {
          id: workerId,
          name: booking.workers?.specialization || `Worker ${workerId.slice(0, 5)}`,
          count: 0,
          completed: 0,
          inProgress: 0,
          efficiency: 0
        };
      }
      
      workerGroups[workerId].count++;
      
      if (booking.status === 'COMPLETED') {
        workerGroups[workerId].completed++;
      } else if (booking.status === 'IN_PROGRESS') {
        workerGroups[workerId].inProgress++;
      }
    });
    
    // Calculate efficiency (completed / total)
    Object.values(workerGroups).forEach(worker => {
      worker.efficiency = worker.count > 0 ? (worker.completed / worker.count) * 100 : 0;
    });
    
    // Convert to array and sort by completion rate
    const workerArray = Object.values(workerGroups).sort((a, b) => b.efficiency - a.efficiency);
    setWorkerStats(workerArray);
  };
  
  const chartColorScheme = theme === 'dark' 
    ? ['#90cdf4', '#63b3ed', '#4299e1', '#3182ce', '#2b6cb0']
    : ['#3182ce', '#4299e1', '#63b3ed', '#90cdf4', '#bee3f8'];
  
  if (loading) return <Spinner />;
  
  return (
    <div className={`container mx-auto p-4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <h1 className="text-2xl font-bold mb-6">Garage Performance Reports</h1>
      
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      
      {/* Report Period Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-lg font-semibold">Report Period:</h2>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setReportPeriod('weekly')}
              className={`px-4 py-2 rounded ${reportPeriod === 'weekly' 
                ? 'bg-blue-600 text-white' 
                : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setReportPeriod('monthly')}
              className={`px-4 py-2 rounded ${reportPeriod === 'monthly' 
                ? 'bg-blue-600 text-white' 
                : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setReportPeriod('yearly')}
              className={`px-4 py-2 rounded ${reportPeriod === 'yearly' 
                ? 'bg-blue-600 text-white' 
                : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              Yearly
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">${summaryStats.totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-green-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Completed Bookings</h3>
          <p className="text-3xl font-bold">{summaryStats.completedBookings} / {summaryStats.totalBookings}</p>
          <p className="text-sm mt-1">
            {summaryStats.totalBookings > 0 
              ? `${((summaryStats.completedBookings / summaryStats.totalBookings) * 100).toFixed(1)}%` 
              : '0%'}
          </p>
        </div>
        
        <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-yellow-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Pending Bookings</h3>
          <p className="text-3xl font-bold">{summaryStats.pendingBookings}</p>
        </div>
        
        <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-red-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Cancelled Bookings</h3>
          <p className="text-3xl font-bold">{summaryStats.cancelledBookings}</p>
          <p className="text-sm mt-1">
            {summaryStats.totalBookings > 0 
              ? `${((summaryStats.cancelledBookings / summaryStats.totalBookings) * 100).toFixed(1)}%` 
              : '0%'}
          </p>
        </div>
        
        <div className={`p-6 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-indigo-50'}`}>
          <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
          <p className="text-3xl font-bold">{summaryStats.avgServiceRating.toFixed(1)}/5.0</p>
          <div className="flex text-yellow-500 mt-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < Math.round(summaryStats.avgServiceRating) ? "text-yellow-500" : "text-gray-300"}>
                ★
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Revenue Chart */}
      <div className={`p-4 mb-8 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
        <h2 className="text-xl font-semibold mb-4">Revenue Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
            <XAxis 
              dataKey="name" 
              stroke={theme === 'dark' ? '#e2e8f0' : '#4a5568'} 
            />
            <YAxis 
              stroke={theme === 'dark' ? '#e2e8f0' : '#4a5568'} 
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: theme === 'dark' ? '#1a202c' : '#ffffff', borderColor: '#e2e8f0' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              name="Revenue ($)" 
              stroke={chartColorScheme[0]} 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Bookings Chart */}
      <div className={`p-4 mb-8 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
        <h2 className="text-xl font-semibold mb-4">Bookings Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bookingsData}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
            <XAxis 
              dataKey="name" 
              stroke={theme === 'dark' ? '#e2e8f0' : '#4a5568'} 
            />
            <YAxis 
              stroke={theme === 'dark' ? '#e2e8f0' : '#4a5568'} 
            />
            <Tooltip
              contentStyle={{ backgroundColor: theme === 'dark' ? '#1a202c' : '#ffffff', borderColor: '#e2e8f0' }}
            />
            <Legend />
            <Bar dataKey="total" name="Total Bookings" fill={chartColorScheme[0]} />
            <Bar dataKey="completed" name="Completed" fill={chartColorScheme[1]} />
            <Bar dataKey="cancelled" name="Cancelled" fill={chartColorScheme[2]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Services Statistics */}
      <div className={`p-4 mb-8 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
        <h2 className="text-xl font-semibold mb-4">Service Breakdown</h2>
        {serviceStats.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className={`min-w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}>
                  <tr>
                    <th className="px-4 py-2 text-left">Service Type</th>
                    <th className="px-4 py-2 text-left">Total Bookings</th>
                    <th className="px-4 py-2 text-left">Completed</th>
                    <th className="px-4 py-2 text-left">Completion Rate</th>
                    <th className="px-4 py-2 text-left">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceStats.map((service, index) => (
                    <tr key={index} className={`${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                      <td className="px-4 py-2">{service.name}</td>
                      <td className="px-4 py-2">{service.count}</td>
                      <td className="px-4 py-2">{service.completed}</td>
                      <td className="px-4 py-2">
                        {service.count > 0 ? `${((service.completed / service.count) * 100).toFixed(1)}%` : '0%'}
                      </td>
                      <td className="px-4 py-2">${service.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Service Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serviceStats.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
                  <XAxis 
                    dataKey="name" 
                    stroke={theme === 'dark' ? '#e2e8f0' : '#4a5568'} 
                  />
                  <YAxis 
                    stroke={theme === 'dark' ? '#e2e8f0' : '#4a5568'} 
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1a202c' : '#ffffff', borderColor: '#e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Total Bookings" fill={chartColorScheme[0]} />
                  <Bar dataKey="completed" name="Completed" fill={chartColorScheme[1]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <p className="text-center py-4">No service data available.</p>
        )}
      </div>
      
      {/* Worker Performance */}
      <div className={`p-4 mb-8 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
        <h2 className="text-xl font-semibold mb-4">Worker Performance</h2>
        {workerStats.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className={`min-w-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-white'}`}>
                <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}>
                  <tr>
                    <th className="px-4 py-2 text-left">Worker</th>
                    <th className="px-4 py-2 text-left">Total Assigned</th>
                    <th className="px-4 py-2 text-left">Completed</th>
                    <th className="px-4 py-2 text-left">In Progress</th>
                    <th className="px-4 py-2 text-left">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {workerStats.map((worker, index) => (
                    <tr key={index} className={`${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                      <td className="px-4 py-2">{worker.name}</td>
                      <td className="px-4 py-2">{worker.count}</td>
                      <td className="px-4 py-2">{worker.completed}</td>
                      <td className="px-4 py-2">{worker.inProgress}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-300 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${worker.efficiency}%` }}
                            ></div>
                          </div>
                          <span>{worker.efficiency.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Worker Efficiency</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workerStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
                  <XAxis 
                    type="number"
                    stroke={theme === 'dark' ? '#e2e8f0' : '#4a5568'} 
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category"
                    stroke={theme === 'dark' ? '#e2e8f0' : '#4a5568'} 
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1a202c' : '#ffffff', borderColor: '#e2e8f0' }}
                  />
                  <Legend />
                  <Bar dataKey="efficiency" name="Efficiency %" fill={chartColorScheme[3]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <p className="text-center py-4">No worker performance data available.</p>
        )}
      </div>
      
      {/* Actions Section */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => window.print()}
          className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} text-white hover:opacity-90`}
        >
          Export Report
        </button>
        
        <button
          onClick={() => navigate('/manager/bookings')}
          className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-500'} text-white hover:opacity-90`}
        >
          Go to Bookings
        </button>
      </div>
    </div>
  );
};

export default ManagerReportsPage;