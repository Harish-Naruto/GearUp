import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  CalendarIcon, 
  ClockIcon, 
  DocumentTextIcon, 
  PhotographIcon, 
  TruckIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/outline';

//import { CalendarIcon,ClockIcon,DocumentTextIcon,PhotographIcon,TruckIcon,CheckCircleIcon,AlertCircleIcon,ArrowLeftIcon,PencilIcon,TrashIcon } from 'lucide-react';

const VehicleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    // Simulating API call to fetch vehicle details
    const fetchVehicleDetails = () => {
      setLoading(true);
      
      // Dummy data - in a real app, this would be an API call
      setTimeout(() => {
        const dummyVehicle = {
          id: id,
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          licensePlate: 'ABC-1234',
          vin: '1HGCM82633A123456',
          color: 'Silver',
          fuelType: 'Gasoline',
          transmission: 'Automatic',
          mileage: 45000,
          lastServiceDate: '2023-11-15',
          purchaseDate: '2020-03-10',
          insurance: {
            provider: 'AllState Insurance',
            policyNumber: 'POL-789456123',
            expiryDate: '2025-03-10',
            coverage: 'Comprehensive'
          },
          maintenanceHistory: [
            {
              id: 'mh1',
              date: '2023-11-15',
              serviceType: 'Regular Maintenance',
              description: 'Oil change, filter replacement, and fluid top-up',
              mileage: 42000,
              cost: 150.75,
              garage: 'QuickFix Auto',
              technician: 'Mike Johnson',
              parts: ['Oil Filter', 'Engine Oil', 'Air Filter']
            },
            {
              id: 'mh2',
              date: '2023-05-22',
              serviceType: 'Brake Service',
              description: 'Front brake pads replacement and rotor resurfacing',
              mileage: 36500,
              cost: 320.50,
              garage: 'Premium Auto Care',
              technician: 'Sarah Miller',
              parts: ['Front Brake Pads', 'Brake Fluid']
            },
            {
              id: 'mh3',
              date: '2022-12-10',
              serviceType: 'Tire Replacement',
              description: 'Replaced all four tires and performed wheel alignment',
              mileage: 30000,
              cost: 575.25,
              garage: 'TireWorld',
              technician: 'Robert Davis',
              parts: ['4x All-Season Tires']
            }
          ],
          upcomingServices: [
            {
              id: 'us1',
              dueDate: '2024-05-20',
              serviceType: 'Regular Maintenance',
              description: 'Oil change and general inspection',
              estimatedCost: 120.00,
              garage: 'QuickFix Auto',
              status: 'Scheduled'
            },
            {
              id: 'us2',
              dueDate: '2024-07-15',
              serviceType: 'Transmission Service',
              description: 'Transmission fluid change',
              estimatedCost: 200.00,
              garage: null,
              status: 'Due Soon'
            }
          ],
          documents: [
            {
              id: 'doc1',
              name: 'Vehicle Registration',
              type: 'PDF',
              uploadDate: '2023-01-05',
              size: '1.2 MB',
              url: '#'
            },
            {
              id: 'doc2',
              name: 'Insurance Policy',
              type: 'PDF',
              uploadDate: '2023-03-15',
              size: '2.5 MB',
              url: '#'
            },
            {
              id: 'doc3',
              name: 'Purchase Invoice',
              type: 'PDF',
              uploadDate: '2020-03-10',
              size: '1.8 MB',
              url: '#'
            }
          ],
          images: [
            {
              id: 'img1',
              title: 'Front View',
              uploadDate: '2020-03-12',
              url: '/image.png'
            },
            {
              id: 'img2',
              title: 'Side View',
              uploadDate: '2020-03-12',
              url: '/api/placeholder/640/400'
            },
            {
              id: 'img3',
              title: 'Interior',
              uploadDate: '2020-03-12',
              url: '/api/placeholder/640/400'
            }
          ]
        };
        
        setVehicle(dummyVehicle);
        setLoading(false);
      }, 800); // Simulate network delay
    };
    
    fetchVehicleDetails();
  }, [id]);

  const handleDelete = () => {
    // In a real app, this would be an API call
    console.log('Deleting vehicle with ID:', id);
    setShowDeleteModal(false);
    
    // Simulate successful deletion
    setTimeout(() => {
      navigate('/vehicles', { 
        state: { 
          notification: {
            type: 'success',
            message: 'Vehicle successfully deleted'
          }
        }
      });
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8 text-center">
          <AlertCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Vehicle Not Found</h1>
          <p className="text-gray-600 mb-6">The vehicle you're looking for doesn't exist or has been removed.</p>
          <Link to="/vehicles" className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800">
            Return to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-blue-700 text-white py-6">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <button 
                onClick={() => navigate('/vehicles')}
                className="mr-4 p-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</h1>
                <p className="text-blue-200">{vehicle.licensePlate}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link 
                to={`/vehicles/edit/${vehicle.id}`}
                className="flex items-center bg-blue-600 hover:bg-blue-800 text-white py-2 px-4 rounded-lg transition-colors"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Edit
              </Link>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 md:px-8 pt-6">
        <div className="flex overflow-x-auto space-x-1 bg-white rounded-t-lg shadow">
          <button
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === 'details'
                ? 'text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === 'maintenance'
                ? 'text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('maintenance')}
          >
            Maintenance History
          </button>
          <button
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === 'upcoming'
                ? 'text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming Services
          </button>
          <button
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === 'documents'
                ? 'text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
          <button
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'text-blue-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('gallery')}
          >
            Gallery
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-8">
        <div className="bg-white rounded-b-lg shadow p-6">
          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold mb-4">Vehicle Information</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-3 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Make</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{vehicle.make}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Model</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{vehicle.model}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Year</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{vehicle.year}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">License Plate</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{vehicle.licensePlate}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">VIN</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{vehicle.vin}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Color</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{vehicle.color}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Fuel Type</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{vehicle.fuelType}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Transmission</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{vehicle.transmission}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Current Mileage</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{vehicle.mileage.toLocaleString()} miles</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Purchase Date</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{new Date(vehicle.purchaseDate).toLocaleDateString()}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Last Service</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{new Date(vehicle.lastServiceDate).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold mb-4">Insurance Information</h2>
                <div className="bg-gray-50 rounded-lg p-4 mb-8">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-3 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Provider</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{vehicle.insurance.provider}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Policy Number</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{vehicle.insurance.policyNumber}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{new Date(vehicle.insurance.expiryDate).toLocaleDateString()}</dd>
                    </div>
                    <div className="py-3 grid grid-cols-3">
                      <dt className="text-sm font-medium text-gray-500">Coverage</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{vehicle.insurance.coverage}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="flex justify-center">
                  <Link 
                    to={`/vehicles/${vehicle.id}/service/schedule`} 
                    className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors text-center"
                  >
                    Schedule Service
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Maintenance History Tab */}
          {activeTab === 'maintenance' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Maintenance History</h2>
                <Link 
                  to={`/vehicles/${vehicle.id}/maintenance/add`}
                  className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
                >
                  Add Record
                </Link>
              </div>
              
              {vehicle.maintenanceHistory.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <TruckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance records</h3>
                  <p className="text-gray-500 mb-4">Add your first maintenance record to keep track of your vehicle's service history.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {vehicle.maintenanceHistory.map((record) => (
                    <div key={record.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{record.serviceType}</h3>
                          <p className="text-gray-500">
                            <span className="flex items-center mt-1">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {new Date(record.date).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0 text-right">
                          <span className="font-medium text-gray-900">${record.cost.toFixed(2)}</span>
                          <p className="text-gray-500">{record.mileage.toLocaleString()} miles</p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{record.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="block text-gray-500">Garage</span>
                          <span>{record.garage}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500">Technician</span>
                          <span>{record.technician}</span>
                        </div>
                      </div>
                      {record.parts && record.parts.length > 0 && (
                        <div className="mt-4">
                          <span className="block text-gray-500 text-sm mb-1">Parts Replaced</span>
                          <div className="flex flex-wrap gap-2">
                            {record.parts.map((part, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                {part}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Upcoming Services Tab */}
          {activeTab === 'upcoming' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Upcoming Services</h2>
                <Link 
                  to={`/vehicles/${vehicle.id}/service/schedule`} 
                  className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors"
                >
                  Schedule New Service
                </Link>
              </div>
              
              {vehicle.upcomingServices.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming services</h3>
                  <p className="text-gray-500 mb-4">Schedule your next service to keep your vehicle in optimal condition.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {vehicle.upcomingServices.map((service) => (
                    <div key={service.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{service.serviceType}</h3>
                          <div className="flex items-center mt-1">
                            <CalendarIcon className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="text-gray-500">{new Date(service.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="mt-2 md:mt-0">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            service.status === 'Scheduled' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-4">{service.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="block text-gray-500">Estimated Cost</span>
                          <span>${service.estimatedCost.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="block text-gray-500">Garage</span>
                          <span>{service.garage || 'Not assigned'}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end space-x-3">
                        {service.status === 'Scheduled' ? (
                          <>
                            <button className="text-gray-700 px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition-colors">
                              Reschedule
                            </button>
                            <button className="text-red-700 px-4 py-2 rounded border border-red-300 hover:bg-red-50 transition-colors">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors">
                            Schedule Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Documents</h2>
                <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors">
                  Upload Document
                </button>
              </div>
              
              {vehicle.documents.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents</h3>
                  <p className="text-gray-500 mb-4">Upload vehicle documents like registration, insurance, and service receipts.</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Document
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uploaded
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vehicle.documents.map((document) => (
                        <tr key={document.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                              <span className="text-sm font-medium text-gray-900">{document.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {document.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(document.uploadDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {document.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <a href={document.url} className="text-blue-600 hover:text-blue-800 mr-3">View</a>
                            <a href="#" className="text-gray-600 hover:text-gray-800 mr-3">Replace</a>
                            <a href="#" className="text-red-600 hover:text-red-800">Delete</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Vehicle Gallery</h2>
                <button className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition-colors">
                  Upload Images
                </button>
              </div>
              
              {vehicle.images.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <PhotographIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No images</h3>
                  <p className="text-gray-500 mb-4">Upload photos of your vehicle to keep a visual record.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicle.images.map((image) => (
                    <div key={image.id} className="bg-gray-50 rounded-lg overflow-hidden">
                      <img 
                        src={image.url} 
                        alt={image.title} 
                        className="w-full h-48 object-cover" 
                      />
                      <div className="p-4">
                        <h3 className="font-medium">{image.title}</h3>
                        <p className="text-sm text-gray-500">Added: {new Date(image.uploadDate).toLocaleDateString()}</p>
                        <div className="mt-2 flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">Replace</button>
                          <button className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
{/* Delete Confirmation Modal */}
{showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Delete Vehicle</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this vehicle? This action cannot be undone and will remove all maintenance records, documents, and upcoming services associated with this vehicle.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete} 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDetailPage;