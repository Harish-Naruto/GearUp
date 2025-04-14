import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../hooks/useToast';
import { PlusCircle, Filter, X, Edit, Trash2, Eye, RotateCcw } from 'lucide-react';
import WorkerForm from '../../components/workers/WorkerForm';
import WorkerDetailModal from '../../components/workers/WorkerDetailModal';
import ConfirmationModal from '../../components/workers/ConfirmationModal';
import Spinner from '../../components/ui/Spinner';



const WorkerManagementPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [filters, setFilters] = useState({
    garage_id: '',
    specialization: '',
    status: ''
  });
  const [sortBy, setSortBy] = useState('-created_at'); // Default: newest first
  const [showFilters, setShowFilters] = useState(false);
  const [garages, setGarages] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  
  const { showToast } = useToast();
  
  // Fetch workers
  useEffect(() => {
    fetchWorkers();
    fetchGarages();
    // This would ideally come from an API, but for now we'll hardcode some common specializations
    setSpecializations(['Oil Change', 'Tire Replacement', 'Engine Repair', 'Electrical', 'Brakes', 'Suspension']);
  }, []);
  
  const fetchWorkers = async (filterParams = filters, sort = sortBy) => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filterParams.garage_id) params.append('garage_id', filterParams.garage_id);
      if (filterParams.specialization) params.append('specialization', filterParams.specialization);
      if (filterParams.status) params.append('status', filterParams.status);
      if (sort) params.append('sort', sort);
      
      const response = await axios.get(`http://localhost:3000/api/v1/workers?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setWorkers(response.data.data.workers);
      setError(null);
    } catch (err) {
      setError('Failed to fetch workers');
      showToast('error', 'Failed to fetch workers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchGarages = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/v1/garages', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setGarages(response.data.data.garages);
    } catch (err) {
      console.error('Failed to fetch garages', err);
    }
  };
  
  const handleAddWorker = async (formData) => {
    try {
      await axios.post('http://localhost:3000/api/v1/workers', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      showToast('success', 'Worker added successfully');
      setShowAddModal(false);
      fetchWorkers();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to add worker');
      console.error(err);
    }
  };
  
  const handleUpdateWorker = async (formData) => {
    try {
      await axios.put(`http://localhost:3000/api/v1/workers/${selectedWorker.id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      showToast('success', 'Worker updated successfully');
      setShowEditModal(false);
      fetchWorkers();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update worker');
      console.error(err);
    }
  };
  
  const handleDeleteWorker = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/v1/workers/${selectedWorker.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      showToast('success', 'Worker deleted successfully');
      setShowDeleteModal(false);
      fetchWorkers();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete worker');
      console.error(err);
    }
  };
  
  const applyFilters = () => {
    fetchWorkers(filters, sortBy);
    setShowFilters(false);
  };
  
  const resetFilters = () => {
    const resetFilters = {
      garage_id: '',
      specialization: '',
      status: ''
    };
    setFilters(resetFilters);
    fetchWorkers(resetFilters, '-created_at');
    setSortBy('-created_at');
    setShowFilters(false);
  };
  
  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    fetchWorkers(filters, newSortBy);
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'ON_LEAVE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const viewWorkerDetails = async (worker) => {
    setSelectedWorker(worker);
    
    try {
      // Fetch more detailed worker info
      const response = await axios.get(`http://localhost:3000/api/v1/workers/${worker.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setSelectedWorker(response.data.data.worker);
      setShowDetailModal(true);
    } catch (err) {
      showToast('error', 'Failed to fetch worker details');
      console.error(err);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Worker Management</h1>
        <div className="flex gap-4">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => setShowAddModal(true)}
          >
            <PlusCircle size={18} />
            Add Worker
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowFilters(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Garage</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.garage_id}
                onChange={(e) => setFilters({...filters, garage_id: e.target.value})}
              >
                <option value="">All Garages</option>
                {garages.map(garage => (
                  <option key={garage.id} value={garage.id}>{garage.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Specialization</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.specialization}
                onChange={(e) => setFilters({...filters, specialization: e.target.value})}
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ON_LEAVE">On Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="-created_at">Newest First</option>
                <option value="created_at">Oldest First</option>
                <option value="users.email">Email (A-Z)</option>
                <option value="-users.email">Email (Z-A)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm flex items-center gap-1"
              onClick={resetFilters}
            >
              <RotateCcw size={16} />
              Reset
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Workers Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-md">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Worker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Garage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specializations</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {workers.length > 0 ? (
                workers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{worker.users?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{worker.garages?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {worker.specialization && worker.specialization.map((spec, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(worker.status)}`}>
                        {worker.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => viewWorkerDetails(worker)}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-800"
                          onClick={() => {
                            setSelectedWorker(worker);
                            setShowEditModal(true);
                          }}
                          title="Edit Worker"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800"
                          onClick={() => {
                            setSelectedWorker(worker);
                            setShowDeleteModal(true);
                          }}
                          title="Delete Worker"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No workers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Worker Modal */}
      {showAddModal && (
        <WorkerForm
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddWorker}
          garages={garages}
          specializations={specializations}
          title="Add New Worker"
          submitButtonText="Add Worker"
        />
      )}

      {/* Edit Worker Modal */}
      {showEditModal && selectedWorker && (
        <WorkerForm
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateWorker}
          garages={garages}
          specializations={specializations}
          initialData={selectedWorker}
          title="Edit Worker"
          submitButtonText="Update Worker"
        />
      )}

      {/* Worker Detail Modal */}
      {showDetailModal && selectedWorker && (
        <WorkerDetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          worker={selectedWorker}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedWorker && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteWorker}
          title="Delete Worker"
          message={`Are you sure you want to delete this worker (${selectedWorker.users?.email})? This action cannot be undone.`}
          confirmButtonText="Delete"
          confirmButtonVariant="danger"
        />
      )}
    </div>
  );
};

export default WorkerManagementPage;