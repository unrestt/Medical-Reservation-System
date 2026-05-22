import { Routes, Route } from 'react-router-dom'
import './App.css'
import { Toaster } from 'react-hot-toast'
import MainLayout from './layout/MainLayout'

function App() {

  return (
    <>
      <Toaster position='top-center' />
      <Routes>
        <Route path='/' element={<MainLayout/>} />
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
