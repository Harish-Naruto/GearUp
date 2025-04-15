"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FaPlus, FaSearch, FaFilter, FaExclamationCircle } from "react-icons/fa"
import { toast } from "react-toastify"
import "./VehiclePages.css"

const VehicleListPage = () => {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    // In a real app, you would fetch from your API
    // For now, we'll use mock data
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        // Simulate API call
        setTimeout(() => {
          const mockVehicles = [
            {
              id: "1",
              make: "Toyota",
              model: "Camry",
              year: 2019,
              license_plate: "ABC123",
              vin: "1HGCM82633A123456",
              color: "Silver",
              status: "active",
              last_service: "2023-01-15",
              next_service_due: "2023-07-15",
              mileage: 35000,
              image: "/image.png",
            },
            {
              id: "2",
              make: "Honda",
              model: "Civic",
              year: 2020,
              license_plate: "XYZ789",
              vin: "2HGFC2F52LH123456",
              color: "Blue",
              status: "active",
              last_service: "2023-03-22",
              next_service_due: "2023-09-22",
              mileage: 28000,
              image: "/image1.jpg",
            },
            {
              id: "3",
              make: "Ford",
              model: "F-150",
              year: 2018,
              license_plate: "DEF456",
              vin: "1FTEW1EP7JFA12345",
              color: "Red",
              status: "maintenance",
              last_service: "2023-05-10",
              next_service_due: "2023-11-10",
              mileage: 45000,
              image: "/image3.jpg",
            },
            {
              id: "4",
              make: "Chevrolet",
              model: "Malibu",
              year: 2021,
              license_plate: "GHI789",
              vin: "1G1ZD5ST1LF123456",
              color: "Black",
              status: "inactive",
              last_service: "2023-02-05",
              next_service_due: "2023-08-05",
              mileage: 15000,
              image: "/image4.jpg",
            },
          ]
          setVehicles(mockVehicles)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Error fetching vehicles:", error)
        toast.error("Failed to load vehicles")
        setLoading(false)
      }
    }

    fetchVehicles()
  }, [])

  // Filter and search vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.license_plate.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || vehicle.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "active":
        return "status-badge status-active"
      case "maintenance":
        return "status-badge status-maintenance"
      case "inactive":
        return "status-badge status-inactive"
      default:
        return "status-badge"
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="vehicle-list-page">
      <div className="page-header">
        <div className="header-content">
          <h1>My Vehicles</h1>
          <p>Manage your vehicles and track their maintenance history</p>
        </div>
        <Link to="/vehicles/new" className="add-vehicle-btn">
          <FaPlus /> Add Vehicle
        </Link>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-dropdown">
          <FaFilter className="filter-icon" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading vehicles...</p>
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className="vehicles-grid">
          {filteredVehicles.map((vehicle) => (
            <Link to={`/vehicles/${vehicle.id}`} key={vehicle.id} className="vehicle-card">
              <div className="vehicle-image">
                <img src={vehicle.image || "/images/car-placeholder.jpg"} alt={`${vehicle.make} ${vehicle.model}`} />
                <div className={getStatusBadgeClass(vehicle.status)}>
                  {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
                </div>
              </div>
              <div className="vehicle-info">
                <h3 className="vehicle-name">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                <div className="vehicle-details">
                  <div className="detail-item">
                    <span className="detail-label">License:</span>
                    <span className="detail-value">{vehicle.license_plate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Service:</span>
                    <span className="detail-value">{formatDate(vehicle.last_service)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Mileage:</span>
                    <span className="detail-value">{vehicle.mileage.toLocaleString()} mi</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FaExclamationCircle className="empty-icon" />
          <h3>No vehicles found</h3>
          {searchTerm || filterStatus !== "all" ? (
            <p>No vehicles match your search criteria. Try adjusting your filters.</p>
          ) : (
            <p>You haven't added any vehicles yet.</p>
          )}
          <Link to="/vehicles/new" className="btn btn-primary">
            Add Your First Vehicle
          </Link>
        </div>
      )}
    </div>
  )
}

export default VehicleListPage
