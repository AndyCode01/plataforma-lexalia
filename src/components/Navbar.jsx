import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NAV_LINKS, NAV_CLASSES } from '../config/navbarConstants';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const renderNavLinks = (isMobile = false) => (
    <>
      {NAV_LINKS.map(link => (
        <a
          key={link.href}
          href={link.href}
          className={isMobile ? NAV_CLASSES.mobileLink : NAV_CLASSES.desktopLink}
        >
          {link.label}
        </a>
      ))}
    </>
  );

  const renderAuthMenu = (isMobile = false) => (
    user ? (
      <>
        {(user.rol === 'usuario' || user.rol === 'abogado') && (
          <Link to="/consultas" className={isMobile ? NAV_CLASSES.mobileLink : NAV_CLASSES.desktopLink}>
            💬 Consultas
          </Link>
        )}
        <Link to="/mi-perfil" className={isMobile ? NAV_CLASSES.primaryButtonMobile : NAV_CLASSES.primaryButton}>
          Mi Perfil
        </Link>
        {isAdmin() && (
          <Link to="/admin" className={isMobile ? NAV_CLASSES.adminButtonMobile : NAV_CLASSES.adminButton}>
            Panel Admin
          </Link>
        )}
        <button 
          onClick={handleLogout} 
          className={isMobile ? `${NAV_CLASSES.mobileLink} w-full text-left` : NAV_CLASSES.desktopLink}
        >
          Cerrar sesión
        </button>
        <span className={`${isMobile ? 'block px-3 py-2' : ''} text-sm text-gray-300`}>
          Hola, {user.nombre}
        </span>
      </>
    ) : (
      <>
        <Link to="/login" className={isMobile ? NAV_CLASSES.mobileLink : NAV_CLASSES.desktopLink}>
          Iniciar sesión
        </Link>
        <Link to="/registro" className={isMobile ? NAV_CLASSES.primaryButtonMobile : NAV_CLASSES.primaryButton}>
          Regístrate
        </Link>
      </>
    )
  );

  return (
    <nav className="bg-slate-900 text-white shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-blue-400">Lexalia</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {renderNavLinks()}
              {renderAuthMenu()}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-slate-700 focus:outline-none"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
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
            {renderNavLinks(true)}
            {renderAuthMenu(true)}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
