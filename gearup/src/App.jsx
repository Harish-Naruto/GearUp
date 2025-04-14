import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import ProtectedRoute from "./components/common/ProtectedRoute"
import RoleBasedRoute from "./components/common/RoleBasedRoute"
import 'bootstrap/dist/css/bootstrap.min.css';


// Layouts
import MainLayout from "./layouts/MainLayout"
import DashboardLayout from "./layouts/DashboardLayout"

// Public Pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import GarageListPage from "./pages/garages/GarageListPage"
import GarageDetailPage from "./pages/garages/GrageDetailPage"
import AboutPage from "./pages/AboutPage"
import ContactPage from "./pages/ContactPage"

// User Pages
import UserDashboardPage from "./pages/dashboard/UserDashboardPage"
import BookingListPage from "./pages/bookings/BookingListPage"
import BookingDetailPage from "./pages/bookings/BookingDetailPage"
import CreateBookingPage from "./pages/bookings/CreateBookingPage"
import UserProfilePage from "./pages/profile/UserProfilePage"
import NotificationsPage from "./pages/notifications/NotificationsPage"
import VehicleListPage from "./pages/vehicles/VehicleListPage" 
import VehicleDetailPage from "./pages/vehicles/VehicleDetailPage" 
import AddVehiclePage from "./pages/vehicles/AddVehiclePage" 

// Manager Pages
import ManagerDashboardPage from "./pages/dashboard/ManagerDashboardPage"
import GarageManagementPage from "./pages/manager/GarageManagementPage"
import WorkerManagementPage from "./pages/manager/WorkerManagementPage"
import ServiceManagementPage from "./pages/manager/ServiceManagementPage"
import BookingManagementPage from "./pages/manager/BookingManagementPage"
import ManagerReportsPage from "./pages/manager/ManagerReportsPage"

// Worker Pages
import WorkerDashboardPage from "./pages/dashboard/WorkerDashboardPage"
import AssignmentsPage from "./pages/worker/AssignmentsPage"
import AvailabilityPage from "./pages/worker/AvailabilityPage"

// // Admin Pages
// import AdminDashboardPage from "./pages/dashboard/AdminDashboardPage"
// import UserManagementPage from "./pages/admin/UserManagementPage"
// import GarageAdminPage from "./pages/admin/GarageAdminPage"
// import SystemSettingsPage from "./pages/admin/SystemSettingsPage"
// import SystemReportsPage from "./pages/admin/SystemReportsPage"

// Error Pages
import NotFoundPage from "./pages/errors/NotFoundPage"

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="garages" element={<GarageListPage />} />
              <Route path="garages/:id" element={<GarageDetailPage />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/auth" element={<MainLayout hideHeader />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard/user" replace />} />
              <Route
                path="user"
                element={
                  <RoleBasedRoute roles={["USER"]}>
                    <UserDashboardPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="manager"
                element={
                  <RoleBasedRoute roles={["MANAGER"]}>
                    <ManagerDashboardPage />
                  </RoleBasedRoute>
                }
              />
              <Route
                path="worker"
                element={
                  <RoleBasedRoute roles={["WORKER"]}>
                    <WorkerDashboardPage />
                  </RoleBasedRoute>
                }
              />
              {/* <Route
                path="admin"
                element={
                  <RoleBasedRoute roles={["ADMIN"]}>
                    <AdminDashboardPage />
                  </RoleBasedRoute>
                }
              /> */}
            </Route>

            {/* Bookings Routes */}
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<BookingListPage />} />
              <Route path=":id" element={<BookingDetailPage />} />
              <Route path="new" element={<CreateBookingPage />} />
            </Route>

            {/* Vehicles Routes */}
            <Route
              path="/vehicles"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<VehicleListPage />} />
              <Route path=":id" element={<VehicleDetailPage />} />
              <Route path="new" element={<AddVehiclePage />} />
            </Route>

            {/* Profile & Notifications */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<UserProfilePage />} />
            </Route>

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<NotificationsPage />} />
            </Route>

            {/* Manager Routes */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["MANAGER", "ADMIN"]}>
                    <DashboardLayout />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            >
              <Route path="garage" element={<GarageManagementPage />} />
              <Route path="workers" element={<WorkerManagementPage />} />
              <Route path="services" element={<ServiceManagementPage />} />
              <Route path="bookings" element={<BookingManagementPage />} />
              <Route path="reports" element={<ManagerReportsPage />} />
            </Route>

            {/* Worker Routes */}
            <Route
              path="/worker"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["WORKER", "ADMIN"]}>
                    <DashboardLayout />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            >
              <Route path="assignments" element={<AssignmentsPage />} />
              <Route path="availability" element={<AvailabilityPage />} />
            </Route>

            {/* Admin Routes */}
            {/* <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute roles={["ADMIN"]}>
                    <DashboardLayout />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            >
              <Route path="users" element={<UserManagementPage />} />
              <Route path="garages" element={<GarageAdminPage />} />
              <Route path="settings" element={<SystemSettingsPage />} />
              <Route path="reports" element={<SystemReportsPage />} />
            </Route> */}

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App
