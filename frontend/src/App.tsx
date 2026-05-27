import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Toaster } from 'react-hot-toast'
import MainLayout from './layout/MainLayout'
import LoginPage from './pages/common/LoginPage'
import RegisterPage from './pages/common/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import PatientDashboard from './pages/patient/PatientDashboard'
import BookAppointment from './pages/patient/BookAppointment'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorSchedule from './pages/doctor/DoctorSchedule'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageDoctors from './pages/admin/ManageDoctors'
import NotFoundPage from './pages/common/NotFoundPage'
import RootRedirect from './components/RootRedirect'

function App() {

  return (
    <>
      <Toaster position='top-center' />
      <Routes>
        {/* Przekierowanie głównego adresu '/' dla zalogowanych */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<RootRedirect />} />
        </Route>

        {/* ======================================================== */}
        {/* TRASY DLA PACJENTA (tylko zalogowany pacjent) */}
        {/* ======================================================== */}
        <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
          <Route element={<MainLayout />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/book" element={<BookAppointment />} />
          </Route>
        </Route>
        {/* ======================================================== */}
        {/* TRASY DLA DOKTORA (tylko zalogowany lekarz) */}
        {/* ======================================================== */}
        <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
          <Route element={<MainLayout />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/schedule" element={<DoctorSchedule />} />
          </Route>
        </Route>
        {/* ======================================================== */}
        {/* TRASY DLA ADMINA (tylko zalogowany administrator) */}
        {/* ======================================================== */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<MainLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<ManageDoctors />} />
          </Route>
        </Route>
        {/* ======================================================== */}
        {/* TRASY PUBLICZNE */}
        {/* ======================================================== */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default App


