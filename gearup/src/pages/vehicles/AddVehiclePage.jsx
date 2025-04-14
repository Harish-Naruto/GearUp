import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon,CheckCircleIcon } from 'lucide-react';

const AddVehiclePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
    color: '',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
    mileage: '',
    purchaseDate: '',
    lastServiceDate: '',
    insurance: {
      provider: '',
      policyNumber: '',
      expiryDate: '',
      coverage: 'Comprehensive',
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call to add vehicle
    setTimeout(() => {
      setLoading(false);
      navigate('/vehicles', { 
        state: { 
          notification: {
            type: 'success',
            message: 'Vehicle successfully added'
          }
        }
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-blue-700 text-white py-6">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/vehicles')}
              className="mr-4 p-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold">Add New Vehicle</h1>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold mb-4">Vehicle Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="make" className="block text-sm font-medium text-gray-700 mb-1">Make *</label>
                      <input
                        type="text"
                        id="make"
                        name="make"
                        value={formData.make}
                        onChange={handleChange}
                        placeholder="e.g. Toyota"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                      <input
                        type="text"
                        id="model"
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        placeholder="e.g. Camry"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                      <input
                        type="number"
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        placeholder="e.g. 2020"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <input
                        type="text"
                        id="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="e.g. Silver"
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="licensePlate" className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
                    <input
                      type="text"
                      id="licensePlate"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleChange}
                      placeholder="e.g. ABC-1234"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-1">VIN</label>
                    <input
                      type="text"
                      id="vin"
                      name="vin"
                      value={formData.vin}
                      onChange={handleChange}
                      placeholder="e.g. 1HGCM82633A123456"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                      <select
                        id="fuelType"
                        name="fuelType"
                        value={formData.fuelType}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Gasoline">Gasoline</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
                      <select
                        id="transmission"
                        name="transmission"
                        value={formData.transmission}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                        <option value="CVT">CVT</option>
                        <option value="Semi-Automatic">Semi-Automatic</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">Current Mileage *</label>
                    <input
                      type="number"
                      id="mileage"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleChange}
                      placeholder="e.g. 45000"
                      min="0"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                      <input
                        type="date"
                        id="purchaseDate"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastServiceDate" className="block text-sm font-medium text-gray-700 mb-1">Last Service Date</label>
                      <input
                        type="date"
                        id="lastServiceDate"
                        name="lastServiceDate"
                        value={formData.lastServiceDate}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-4">Insurance Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="insurance.provider" className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                    <input
                      type="text"
                      id="insurance.provider"
                      name="insurance.provider"
                      value={formData.insurance.provider}
                      onChange={handleChange}
                      placeholder="e.g. AllState Insurance"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="insurance.policyNumber" className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                    <input
                      type="text"
                      id="insurance.policyNumber"
                      name="insurance.policyNumber"
                      value={formData.insurance.policyNumber}
                      onChange={handleChange}
                      placeholder="e.g. POL-789456123"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="insurance.expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      id="insurance.expiryDate"
                      name="insurance.expiryDate"
                      value={formData.insurance.expiryDate}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="insurance.coverage" className="block text-sm font-medium text-gray-700 mb-1">Coverage</label>
                    <select
                      id="insurance.coverage"
                      name="insurance.coverage"
                      value={formData.insurance.coverage}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Comprehensive">Comprehensive</option>
                      <option value="Third Party">Third Party</option>
                      <option value="Third Party, Fire & Theft">Third Party, Fire & Theft</option>
                      <option value="Liability Only">Liability Only</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-md font-medium mb-2">Additional Information</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    After creating the vehicle profile, you can add maintenance records, upload documents, and schedule services.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
              <Link 
                to="/vehicles"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-700 border border-transparent rounded-md shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Vehicle...
                  </span>
                ) : 'Add Vehicle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVehiclePage;