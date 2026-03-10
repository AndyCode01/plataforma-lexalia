import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiPatch, apiUpload, apiGet, apiPost } from '../services/api';
import { normalizeImageUrl } from '../utils/imageUrl';

const MiPerfil = () => {
  const { user, token, updateUser, isAdmin } = useAuth();
  const [perfil, setPerfil] = useState({
    especialidad: '',
    ciudad: '',
    experiencia: 0,
    casos_ganados: 0,
    telefono: '',
    email_publico: '',
    descripcion: '',
    idiomas: '',
    educacion: '',
    foto_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [estadoSuscripcion, setEstadoSuscripcion] = useState(null);
  const [loadingSuscripcion, setLoadingSuscripcion] = useState(false);

  useEffect(() => {
    if (user?.perfil) {
      setPerfil({
        especialidad: user.perfil.especialidad || '',
        ciudad: user.perfil.ciudad || '',
        experiencia: user.perfil.experiencia || 0,
        casos_ganados: user.perfil.casos_ganados || 0,
        telefono: user.perfil.telefono || '',
        email_publico: user.perfil.email_publico || '',
        descripcion: user.perfil.descripcion || '',
        idiomas: user.perfil.idiomas || '',
        educacion: user.perfil.educacion || '',
        foto_url: user.perfil.foto_url || '',
      });
      setFotoPreview(normalizeImageUrl(user.perfil.foto_url));
    }

    if (user?.rol === 'abogado') {
      setLoadingSuscripcion(true);
      apiGet(`/mercadopago/estado/${user.id}`)
        .then((data) => setEstadoSuscripcion(data))
        .catch((err) => console.error('Error cargando suscripcion:', err))
        .finally(() => setLoadingSuscripcion(false));
    }
  }, [user]);

  const handleChange = (e) => {
    setPerfil((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La imagen no debe superar 2MB' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Solo se permiten imagenes' });
      return;
    }

    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRenovar = async () => {
    setLoadingSuscripcion(true);
    try {
      const data = await apiPost('/mercadopago/renovar', {
        usuarioId: user.id,
        plan: estadoSuscripcion?.plan || 'basico',
      });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error renovando:', err);
      setMessage({ type: 'error', text: 'Error al iniciar renovacion' });
    } finally {
      setLoadingSuscripcion(false);
    }
  };

  const persistFoto = async () => {
    if (!fotoFile) return perfil.foto_url;

    const up = await apiUpload('/api/upload', fotoFile, {
      headers: { Authorization: `Bearer ${token}` },
    });

    await apiPatch(
      `/api/abogados/${user.perfil.id}`,
      { foto_url: up.url },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    updateUser({ perfil: { ...user.perfil, foto_url: up.url } });
    setPerfil((prev) => ({ ...prev, foto_url: up.url }));
    setFotoPreview(normalizeImageUrl(up.url));
    setFotoFile(null);
    return up.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const foto_url = await persistFoto();
      const datosActualizados = {
        ...perfil,
        foto_url,
        idiomas: perfil.idiomas,
      };

      await apiPatch(`/api/abogados/${user.perfil.id}`, datosActualizados, {
        headers: { Authorization: `Bearer ${token}` },
      });

      updateUser({ perfil: { ...user.perfil, ...datosActualizados } });
      setPerfil((prev) => ({ ...prev, foto_url }));
      setFotoPreview(normalizeImageUrl(foto_url));
      setMessage({ type: 'success', text: 'Perfil actualizado exitosamente' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error al actualizar el perfil' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const isUsuario = user.rol === 'usuario';
  const isAbogado = user.rol === 'abogado';

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">Mi Perfil</h2>
            <div className="text-sm">
              {isAdmin() && (
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold mr-2">
                  Administrador
                </span>
              )}
              {isUsuario && (
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold mr-2">
                  Usuario
                </span>
              )}
              {isAbogado && (
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold mr-2">
                  Abogado
                </span>
              )}
              <span className={`px-3 py-1 rounded-full ${user.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                {user.activo ? 'Activo' : 'Inactivo'}
              </span>
              {user.plan && !isAdmin() && !isUsuario && (
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">{user.plan}</span>
              )}
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <strong>Nombre:</strong> {user.nombre}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Rol:</strong> <span className="capitalize">{user.rol}</span>
            </p>
            {user.fecha_expiracion && !isAdmin() && !isUsuario && (
              <p className="text-sm text-gray-600">
                <strong>Membresia vigente hasta:</strong> {new Date(user.fecha_expiracion).toLocaleDateString()}
              </p>
            )}
          </div>

          {isAdmin() ? (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg className="w-24 h-24 mx-auto text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Cuenta de Administrador</h3>
              <p className="text-gray-600 mb-6">
                Como administrador, tienes acceso completo al panel de gestion de usuarios y abogados.
              </p>
              <Link to="/admin" className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-medium">
                Ir al Panel de Administracion
              </Link>
            </div>
          ) : isUsuario ? (
            <>
              {message.text && (
                <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                  {message.text}
                </div>
              )}

              <div className="text-center py-8">
                <div className="mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mx-auto mb-4">
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        U
                      </div>
                    )}
                  </div>
                  <input type="file" accept="image/*" onChange={handleFotoChange} className="text-sm mx-auto" />
                  <p className="text-xs text-gray-500 mt-2">Maximo 2MB, formatos: JPG, PNG</p>
                </div>

                {fotoFile && (
                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await persistFoto();
                        setMessage({ type: 'success', text: 'Foto actualizada exitosamente' });
                      } catch (err) {
                        setMessage({ type: 'error', text: err.message || 'Error al subir la foto' });
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    className="mb-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Subiendo...' : 'Guardar foto'}
                  </button>
                )}

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Necesitas asesoria legal?</h3>
                  <p className="text-gray-600 mb-4">Publica tu consulta y nuestros abogados te responderan</p>
                  <Link to="/consultas" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium">
                    Ir a Consultas
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              {message.text && (
                <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                  {message.text}
                </div>
              )}

              {!loadingSuscripcion && estadoSuscripcion && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Estado de Suscripcion</h3>
                      <p className="text-gray-600 text-sm">Gestiona tu membresia profesional</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-semibold text-white ${
                      estadoSuscripcion.caducado ? 'bg-red-500' :
                      estadoSuscripcion.caducaProximamente ? 'bg-yellow-500' :
                      estadoSuscripcion.activo ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {estadoSuscripcion.caducado ? 'Expirada' :
                        estadoSuscripcion.caducaProximamente ? 'Proxima a vencer' :
                        estadoSuscripcion.activo ? 'Activa' : 'Pendiente'}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white p-3 rounded">
                      <p className="text-xs text-gray-600">Plan</p>
                      <p className="text-lg font-semibold capitalize">{estadoSuscripcion.plan || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <p className="text-xs text-gray-600">Estado Pago</p>
                      <p className="text-lg font-semibold capitalize">{estadoSuscripcion.estado_pago || 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <p className="text-xs text-gray-600">Vencimiento</p>
                      <p className="text-lg font-semibold">{estadoSuscripcion.fecha_expiracion ? new Date(estadoSuscripcion.fecha_expiracion).toLocaleDateString('es-CO') : 'N/A'}</p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <p className="text-xs text-gray-600">Dias Restantes</p>
                      <p className={`text-lg font-semibold ${
                        estadoSuscripcion.diasRestantes < 0 ? 'text-red-600' :
                        estadoSuscripcion.diasRestantes <= 7 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {estadoSuscripcion.diasRestantes !== null ? estadoSuscripcion.diasRestantes : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {(estadoSuscripcion.caducado || estadoSuscripcion.caducaProximamente) && (
                    <button
                      onClick={handleRenovar}
                      disabled={loadingSuscripcion}
                      className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                    >
                      {loadingSuscripcion ? 'Procesando...' : 'Renovar Suscripcion'}
                    </button>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Foto de perfil</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                      {fotoPreview ? (
                        <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Sin foto
                        </div>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleFotoChange} className="text-sm" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Maximo 2MB, formatos: JPG, PNG</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Especialidad</label>
                    <select
                      name="especialidad"
                      value={perfil.especialidad}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecciona una especialidad</option>
                      <option value="Derecho Civil">Derecho Civil</option>
                      <option value="Derecho Penal">Derecho Penal</option>
                      <option value="Derecho Laboral">Derecho Laboral</option>
                      <option value="Derecho de Familia">Derecho de Familia</option>
                      <option value="Derecho Comercial">Derecho Comercial</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ciudad</label>
                    <input
                      type="text"
                      name="ciudad"
                      value={perfil.ciudad}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Bogota"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Anos de experiencia</label>
                    <input
                      type="number"
                      name="experiencia"
                      value={perfil.experiencia}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Casos ganados</label>
                    <input
                      type="number"
                      name="casos_ganados"
                      value={perfil.casos_ganados}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Telefono</label>
                    <input
                      type="tel"
                      name="telefono"
                      value={perfil.telefono}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email publico (opcional)</label>
                    <input
                      type="email"
                      name="email_publico"
                      value={perfil.email_publico}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contacto@ejemplo.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email que veran tus clientes potenciales</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descripcion profesional</label>
                  <textarea
                    name="descripcion"
                    value={perfil.descripcion}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cuentanos sobre tu experiencia, logros y areas de especializacion..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Idiomas</label>
                  <input
                    type="text"
                    name="idiomas"
                    value={perfil.idiomas}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Espanol, Ingles, Frances"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separados por comas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Educacion</label>
                  <textarea
                    name="educacion"
                    value={perfil.educacion}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Universidad, titulos, certificaciones..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Guardando cambios...' : 'Guardar cambios'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default MiPerfil;
