import { Routes, Route } from 'react-router-dom'
import './App.css'
import { Toaster } from 'react-hot-toast'
import MainLayout from './layout/MainLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {

  return (
    <>
      <Toaster position='top-center' />
      <Routes>
        {/* Trasy Chronione (Wymagają logowania) */}
        <Route element={<ProtectedRoute />}>
          <Route path='/' element={<MainLayout />} />
        </Route>

        {/* Trasy Publiczne */}
        <Route path='/login' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        
        <Route path="*" element={
          <div className="bg-neutral-950 min-h-screen text-white flex items-center justify-center text-sm uppercase tracking-widest font-bold">
            Strona nie istnieje
          </div>
        } />
      </Routes>
    </>
  )
}

export default App


