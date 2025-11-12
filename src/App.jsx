import Navbar from './components/Navbar'
import Hero from './components/Hero'
import QuienesSomos from './components/QuienesSomos'
import Servicios from './components/Servicios'
import CatalogoAbogados from './components/CatalogoAbogados'
import RegistroAbogado from './components/RegistroAbogado'
import Login from './components/Login'
import MiPerfil from './components/MiPerfil'
import PanelAdmin from './components/PanelAdmin'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Footer from './components/Footer'
import { RegistroExito, RegistroError, RegistroPending } from './components/RegistroResultado'
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <QuienesSomos />
            <Servicios />
            <CatalogoAbogados />
          </>
        } />
        <Route path="/registro" element={<RegistroAbogado />} />
        <Route path="/registro/exito" element={<RegistroExito />} />
        <Route path="/registro/error" element={<RegistroError />} />
        <Route path="/registro/pending" element={<RegistroPending />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mi-perfil" element={
          <ProtectedRoute>
            <MiPerfil />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <PanelAdmin />
          </AdminRoute>
        } />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
