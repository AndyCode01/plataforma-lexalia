import { useState } from 'react';

const PerfilAbogado = ({ abogado, onClose }) => {
  const [mostrarContacto, setMostrarContacto] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Mensaje enviado a ${abogado.nombre}`);
    setMostrarFormulario(false);
    setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar - Mejorado */}
        <button
          onClick={onClose}
          className="sticky top-4 float-right z-10 bg-red-500 hover:bg-red-600 text-white font-bold w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-all hover:scale-110"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Header con foto */}
        <div className="relative h-40 bg-gradient-to-br from-blue-500 to-blue-700 rounded-t-2xl">
          <div className="absolute -bottom-12 left-6">
            <img
              src={abogado.foto_url || abogado.foto || (abogado.nombre ? `https://ui-avatars.com/api/?name=${encodeURIComponent(abogado.nombre)}&size=200&background=random` : 'https://via.placeholder.com/200.png?text=Abogado')}
              alt={abogado.nombre}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
          </div>
          <div className="absolute top-4 left-6 flex items-center gap-2 bg-white px-3 py-1 rounded-full">
            <span className="text-yellow-500 text-lg">⭐</span>
            <span className="font-bold text-gray-800">{abogado.rating}</span>
          </div>
        </div>

        {/* Contenido */}
        <div className="pt-16 px-6 pb-6">
          {/* Nombre y especialidad */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">
              {abogado.nombre}
            </h2>
            <p className="text-lg text-blue-600 font-semibold mb-1">
              {abogado.especialidad}
            </p>
            <p className="text-gray-600 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {abogado.ciudad}
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <p className="text-xl font-bold text-blue-600">{abogado.experiencia}</p>
              <p className="text-xs text-gray-600">Años</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <p className="text-xl font-bold text-green-600">{abogado.casosGanados}</p>
              <p className="text-xs text-gray-600">Casos</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <p className="text-xl font-bold text-purple-600">{abogado.idiomas.length}</p>
              <p className="text-xs text-gray-600">Idiomas</p>
            </div>
          </div>

          {/* Descripción */}
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 mb-2">Sobre mí</h3>
            <p className="text-gray-700 leading-relaxed text-sm">{abogado.descripcion}</p>
          </div>

          {/* Educación */}
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 mb-2">Educación</h3>
            <p className="text-gray-700 text-sm">{abogado.educacion}</p>
          </div>

          {/* Idiomas */}
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 mb-2">Idiomas</h3>
            <div className="flex gap-2">
              {abogado.idiomas.map((idioma) => (
                <span key={idioma} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                  {idioma}
                </span>
              ))}
            </div>
          </div>

          {/* Botones de contacto */}
          <div className="border-t pt-4 space-y-3">
            {!mostrarFormulario ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setMostrarContacto(!mostrarContacto)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {mostrarContacto ? 'Ocultar Contacto' : 'Ver Contacto'}
                </button>
                <button
                  onClick={() => setMostrarFormulario(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Enviar Mensaje
                </button>
              </div>
            ) : null}

            {/* Info de contacto */}
            {mostrarContacto && !mostrarFormulario && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-semibold text-gray-700 text-sm">{abogado.telefono}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold text-gray-700 text-sm">{abogado.email}</span>
                </div>
              </div>
            )}

            {/* Formulario de contacto */}
            {mostrarFormulario && (
              <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h3 className="text-base font-bold text-slate-900 mb-3">Enviar mensaje a {abogado.nombre}</h3>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tu nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Mensaje</label>
                  <textarea
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Describe tu caso o consulta..."
                  ></textarea>
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Enviar
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarFormulario(false)}
                    className="px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilAbogado;
