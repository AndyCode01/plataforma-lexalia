import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-blue-400">Lexalia</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="/#inicio" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition">
                Inicio
              </a>
              <a href="/#quienes-somos" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition">
                Quiénes Somos
              </a>
              <a href="/#servicios" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition">
                Servicios
              </a>
              <a href="/#catalogo" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition">
                Abogados
              </a>
              {user ? (
                <>
                  <Link to="/mi-perfil" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition">
                    Mi Perfil
                  </Link>
                  {isAdmin() && (
                    <Link to="/admin" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md text-sm font-medium transition">
                      Panel Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition">
                    Cerrar sesión
                  </button>
                  <span className="text-sm text-gray-300">Hola, {user.nombre}</span>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:bg-slate-700 px-3 py-2 rounded-md text-sm font-medium transition">
                    Iniciar sesión
                  </Link>
                  <Link to="/registro" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition">
                    Regístrate
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-slate-700 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="/#inicio" className="block hover:bg-slate-700 px-3 py-2 rounded-md text-base font-medium">
              Inicio
            </a>
            <a href="/#quienes-somos" className="block hover:bg-slate-700 px-3 py-2 rounded-md text-base font-medium">
              Quiénes Somos
            </a>
            <a href="/#servicios" className="block hover:bg-slate-700 px-3 py-2 rounded-md text-base font-medium">
              Servicios
            </a>
            <a href="/#catalogo" className="block hover:bg-slate-700 px-3 py-2 rounded-md text-base font-medium">
              Abogados
            </a>
            {user ? (
              <>
                <Link to="/mi-perfil" className="block bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium">
                  Mi Perfil
                </Link>
                {isAdmin() && (
                  <Link to="/admin" className="block bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-md text-base font-medium">
                    Panel Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left hover:bg-slate-700 px-3 py-2 rounded-md text-base font-medium">
                  Cerrar sesión
                </button>
                <span className="block text-sm text-gray-300 px-3 py-2">Hola, {user.nombre}</span>
              </>
            ) : (
              <>
                <Link to="/login" className="block hover:bg-slate-700 px-3 py-2 rounded-md text-base font-medium">
                  Iniciar sesión
                </Link>
                <Link to="/registro" className="block bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-md text-base font-medium">
                  Regístrate
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
