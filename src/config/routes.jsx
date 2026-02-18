import Hero from '../components/Hero';
import QuienesSomos from '../components/QuienesSomos';
import Servicios from '../components/Servicios';
import CatalogoAbogados from '../components/CatalogoAbogados';
import RegistroAbogado from '../components/RegistroAbogado';
import Login from '../components/Login';
import MiPerfil from '../components/MiPerfil';
import PanelAdmin from '../components/PanelAdmin';
import Consultas from '../components/Consultas';
import DashboardSuscripcion from '../components/DashboardSuscripcion';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import RegistroExito from '../components/RegistroExito';
import RegistroError from '../components/RegistroError';
import RegistroPending from '../components/RegistroPending';

export const homeRoute = {
  path: '/',
  element: (
    <>
      <Hero />
      <QuienesSomos />
      <Servicios />
      <CatalogoAbogados />
    </>
  ),
};

export const publicRoutes = [
  { path: '/registro', element: <RegistroAbogado /> },
  { path: '/login', element: <Login /> },
];

export const registroRoutes = [
  { path: '/registro/exito', element: <RegistroExito /> },
  { path: '/registro/error', element: <RegistroError /> },
  { path: '/registro/pending', element: <RegistroPending /> },
];

export const protectedRoutes = [
  {
    path: '/mi-perfil',
    element: <ProtectedRoute><MiPerfil /></ProtectedRoute>,
  },
  {
    path: '/suscripcion',
    element: <ProtectedRoute><DashboardSuscripcion /></ProtectedRoute>,
  },
  {
    path: '/consultas',
    element: <ProtectedRoute><Consultas /></ProtectedRoute>,
  },
];

export const adminRoutes = [
  {
    path: '/admin',
    element: <AdminRoute><PanelAdmin /></AdminRoute>,
  },
];

export const allRoutes = [
  homeRoute,
  ...publicRoutes,
  ...registroRoutes,
  ...protectedRoutes,
  ...adminRoutes,
];
