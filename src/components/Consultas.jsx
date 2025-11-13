import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost } from '../services/api';

export default function Consultas() {
  const { user, token } = useAuth();
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    categoria: 'civil'
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  const categorias = [
    { value: 'civil', label: 'Derecho Civil' },
    { value: 'penal', label: 'Derecho Penal' },
    { value: 'laboral', label: 'Derecho Laboral' },
    { value: 'familia', label: 'Derecho de Familia' },
    { value: 'comercial', label: 'Derecho Comercial' },
    { value: 'otro', label: 'Otro' }
  ];

  useEffect(() => {
    cargarConsultas();
  }, []);

  const cargarConsultas = async () => {
    try {
      const data = await apiGet('/api/consultas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConsultas(data);
    } catch (err) {
      console.error('Error al cargar consultas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!formData.titulo.trim() || !formData.descripcion.trim()) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos' });
      return;
    }

    try {
      await apiPost('/api/consultas', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: '✓ Consulta publicada exitosamente' });
      setFormData({ titulo: '', descripcion: '', categoria: 'civil' });
      setShowForm(false);
      cargarConsultas();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error al publicar la consulta' });
    }
  };

  const handleResponder = async (consultaId, contenido) => {
    if (!contenido.trim()) return;

    try {
      await apiPost(`/api/consultas/${consultaId}/responder`, 
        { contenido },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      cargarConsultas();
    } catch (err) {
      alert(err.message || 'Error al responder');
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  const isAbogado = user?.rol === 'abogado' || user?.rol === 'admin';
  const isUsuario = user?.rol === 'usuario';

  return (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Consultas Legales</h1>
          <p className="text-gray-600">
            {isUsuario && 'Publica tus dudas legales y nuestros abogados te responderán'}
            {isAbogado && 'Responde a las consultas de los usuarios'}
          </p>
        </div>

        {message.text && (
          <div className={`mb-4 p-3 rounded ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
            {message.text}
          </div>
        )}

        {isUsuario && (
          <div className="mb-6">
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                ➕ Nueva Consulta
              </button>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Nueva Consulta</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <input
                      type="text"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Resumen breve de tu consulta"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Categoría</label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categorias.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Descripción</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      rows="6"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe tu situación legal con el mayor detalle posible..."
                    ></textarea>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Publicar Consulta
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {consultas.length === 0 ? (
            <div className="bg-white p-12 rounded-lg shadow text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>No hay consultas publicadas aún</p>
            </div>
          ) : (
            consultas.map(consulta => (
              <ConsultaCard
                key={consulta.id}
                consulta={consulta}
                isAbogado={isAbogado}
                onResponder={handleResponder}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function ConsultaCard({ consulta, isAbogado, onResponder }) {
  const [showRespuesta, setShowRespuesta] = useState(false);
  const [respuesta, setRespuesta] = useState('');

  const handleSubmitRespuesta = () => {
    onResponder(consulta.id, respuesta);
    setRespuesta('');
    setShowRespuesta(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800">{consulta.titulo}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
              {consulta.categoria}
            </span>
            <span>•</span>
            <span>Por {consulta.usuario?.nombre}</span>
            <span>•</span>
            <span>{new Date(consulta.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <p className="text-gray-700 mb-4 whitespace-pre-line">{consulta.descripcion}</p>

      {consulta.respuestas && consulta.respuestas.length > 0 && (
        <div className="mt-4 space-y-3 border-t pt-4">
          <h4 className="font-semibold text-gray-700">Respuestas:</h4>
          {consulta.respuestas.map(resp => (
            <div key={resp.id} className="bg-green-50 p-4 rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                <span className="font-semibold text-green-700">⚖️ {resp.abogado?.usuario?.nombre}</span>
                <span>•</span>
                <span>{new Date(resp.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-line">{resp.contenido}</p>
            </div>
          ))}
        </div>
      )}

      {isAbogado && (
        <div className="mt-4">
          {!showRespuesta ? (
            <button
              onClick={() => setShowRespuesta(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              💬 Responder
            </button>
          ) : (
            <div className="space-y-2">
              <textarea
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Escribe tu respuesta profesional..."
              ></textarea>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitRespuesta}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Enviar Respuesta
                </button>
                <button
                  onClick={() => setShowRespuesta(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
