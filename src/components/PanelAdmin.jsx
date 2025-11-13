import { useState, useEffect } from 'react';
import { apiGet, apiPut, apiDelete, withAuth } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function PanelAdmin() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [usuarios, setUsuarios] = useState([]);
  const [abogados, setAbogados] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'usuarios') {
        const data = await apiGet('/api/admin/usuarios', withAuth(token));
        setUsuarios(data);
      } else if (activeTab === 'abogados') {
        const data = await apiGet('/api/admin/abogados', withAuth(token));
        setAbogados(data);
      } else if (activeTab === 'consultas') {
        const data = await apiGet('/api/consultas', withAuth(token));
        setConsultas(data);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditando(item.id);
    setFormData({ ...item });
  };

  const handleCancelEdit = () => {
    setEditando(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      const endpoint = activeTab === 'usuarios' 
        ? `/api/admin/usuarios/${editando}` 
        : `/api/admin/abogados/${editando}`;
      
      await apiPut(endpoint, formData, withAuth(token));
      alert('✓ Actualizado correctamente');
      setEditando(null);
      setFormData({});
      cargarDatos();
    } catch (err) {
      alert('Error al actualizar: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    // Prevenir que el admin se elimine a sí mismo
    if (activeTab === 'usuarios' && id === user?.id) {
      alert('❌ No puedes eliminar tu propia cuenta de administrador');
      return;
    }
    
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
    
    try {
      const endpoint = activeTab === 'usuarios' 
        ? `/api/admin/usuarios/${id}` 
        : `/api/admin/abogados/${id}`;
      
      await apiDelete(endpoint, withAuth(token));
      alert('✓ Eliminado correctamente');
      cargarDatos();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Panel de Administración</h1>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('usuarios')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'usuarios'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Usuarios ({usuarios.length})
            </button>
            <button
              onClick={() => setActiveTab('abogados')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'abogados'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Abogados ({abogados.length})
            </button>
            <button
              onClick={() => setActiveTab('consultas')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'consultas'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Consultas ({consultas.length})
            </button>
          </nav>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'usuarios' && (
              <TablaUsuarios
                usuarios={usuarios}
                editando={editando}
                formData={formData}
                currentUserId={user?.id}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSave={handleSave}
                onCancel={handleCancelEdit}
                onChange={handleInputChange}
              />
            )}
            {activeTab === 'abogados' && (
              <TablaAbogados
                abogados={abogados}
                editando={editando}
                formData={formData}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSave={handleSave}
                onCancel={handleCancelEdit}
                onChange={handleInputChange}
              />
            )}
            {activeTab === 'consultas' && (
              <TablaConsultas consultas={consultas} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TablaUsuarios({ usuarios, editando, formData, currentUserId, onEdit, onDelete, onSave, onCancel, onChange }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {usuarios.map(usuario => (
            editando === usuario.id ? (
              <tr key={usuario.id} className="bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.id}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre || ''}
                    onChange={onChange}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={onChange}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    name="rol"
                    value={formData.rol || 'usuario'}
                    onChange={onChange}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="usuario">Usuario</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    name="plan"
                    value={formData.plan || 'basico'}
                    onChange={onChange}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="basico">Básico</option>
                    <option value="pro">Pro</option>
                    <option value="premium">Premium</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    name="estado_pago"
                    value={formData.estado_pago || 'pendiente'}
                    onChange={onChange}
                    className="w-full px-2 py-1 border rounded text-sm"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    name="activo"
                    checked={formData.activo || false}
                    onChange={onChange}
                    className="h-4 w-4"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={onSave}
                    className="text-green-600 hover:text-green-900 font-medium"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={onCancel}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={usuario.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{usuario.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{usuario.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    usuario.rol === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{usuario.plan}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    usuario.estado_pago === 'aprobado' ? 'bg-green-100 text-green-800' :
                    usuario.estado_pago === 'rechazado' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {usuario.estado_pago}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {usuario.activo ? '✓' : '✗'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => onEdit(usuario)}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    Editar
                  </button>
                  {usuario.id === currentUserId ? (
                    <span className="text-gray-400 font-medium cursor-not-allowed" title="No puedes eliminar tu propia cuenta">
                      Eliminar
                    </span>
                  ) : (
                    <button
                      onClick={() => onDelete(usuario.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TablaAbogados({ abogados, editando, formData, onEdit, onDelete, onSave, onCancel, onChange }) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ciudad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experiencia</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {abogados.map(abogado => (
            editando === abogado.id ? (
              <tr key={abogado.id} className="bg-blue-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{abogado.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{abogado.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abogado.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    name="especialidad"
                    value={formData.especialidad || ''}
                    onChange={onChange}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad || ''}
                    onChange={onChange}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    name="experiencia"
                    value={formData.experiencia || 0}
                    onChange={onChange}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="number"
                    step="0.1"
                    name="rating"
                    value={formData.rating || 0}
                    onChange={onChange}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={onSave}
                    className="text-green-600 hover:text-green-900 font-medium"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={onCancel}
                    className="text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={abogado.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{abogado.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{abogado.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abogado.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abogado.especialidad || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abogado.ciudad || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abogado.experiencia || 0} años</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">⭐ {abogado.rating || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => onEdit(abogado)}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(abogado.id)}
                    className="text-red-600 hover:text-red-900 font-medium"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TablaConsultas({ consultas }) {
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {consultas.map(consulta => (
        <div key={consulta.id} className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{consulta.titulo}</h3>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">{consulta.categoria}</span>
                <span>Por: {consulta.usuario?.nombre}</span>
                <span>{formatearFecha(consulta.created_at)}</span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              consulta.estado === 'abierta' ? 'bg-yellow-100 text-yellow-800' :
              consulta.estado === 'respondida' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {consulta.estado}
            </span>
          </div>
          
          <p className="text-gray-700 mb-4 whitespace-pre-line">{consulta.descripcion}</p>
          
          {consulta.respuestas && consulta.respuestas.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold text-gray-700 mb-2">
                Respuestas ({consulta.respuestas.length}):
              </h4>
              <div className="space-y-2">
                {consulta.respuestas.map(resp => (
                  <div key={resp.id} className="bg-green-50 p-3 rounded border border-green-100">
                    <div className="flex items-center gap-2 mb-1 text-xs text-gray-600">
                      <span className="font-semibold text-green-700">⚖️ {resp.abogado?.nombre}</span>
                      <span>•</span>
                      <span>{formatearFecha(resp.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{resp.contenido}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
