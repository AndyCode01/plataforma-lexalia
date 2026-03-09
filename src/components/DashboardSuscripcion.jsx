import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGet, apiPost } from '../services/api';

export default function DashboardSuscripcion() {
  const [estado, setEstado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const usuarioId = useParams().id || user?.id;

  useEffect(() => {
    const fetchEstado = async () => {
      try {
        const data = await apiGet(`/mercadopago/estado/${usuarioId}`);
        setEstado(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Usuario no encontrado');
      } finally {
        setLoading(false);
      }
    };

    if (usuarioId) fetchEstado();
  }, [usuarioId]);

  const handleRenovar = async () => {
    try {
      const data = await apiPost('/mercadopago/renovar', {
        usuarioId,
        plan: estado.plan
      });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error renovando:', err);
    }
  };

  const renovacionResult = searchParams.get('renovacion');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Suscripción</h1>
          <p className="text-gray-600">Gestiona tu membresía profesional</p>
        </div>

        {/* Notificación de Renovación */}
        {renovacionResult === 'exitosa' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
            <svg className="w-5 h-5 text-green-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-800">¡Renovación Exitosa!</h3>
              <p className="text-green-700 text-sm">Tu suscripción ha sido renovada correctamente.</p>
            </div>
          </div>
        )}

        {renovacionResult === 'fallida' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <div>
              <h3 className="font-semibold text-red-800">Renovación Fallida</h3>
              <p className="text-red-700 text-sm">Tu renovación no se completó. Intenta nuevamente.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando estado de suscripción...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        ) : estado ? (
          <div className="space-y-6">
            {/* Estado Principal */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className={`px-6 py-4 ${
                estado.activo ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'
              } text-white`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">{estado.nombre}</h2>
                    <p className="text-green-100">{estado.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">
                      {estado.activo ? '✅' : '❌'}
                    </p>
                    <p className="text-sm font-semibold">
                      {estado.activo ? 'ACTIVO' : 'INACTIVO'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles */}
              <div className="px-6 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Plan Actual */}
                  <div className="border-b md:border-b-0 md:border-r border-gray-200 pb-8 md:pb-0 md:pr-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Plan Actual</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-600 text-sm">Tipo de Plan</p>
                        <p className="text-2xl font-bold text-blue-600 capitalize">
                          {estado.plan || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Estado Pago</p>
                        <p className={`text-lg font-semibold capitalize ${
                          estado.estado_pago === 'aprobado' ? 'text-green-600' :
                          estado.estado_pago === 'pendiente' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {estado.estado_pago || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fechas */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Vigencia</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-gray-600 text-sm">Activado</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {estado.fecha_activacion 
                            ? new Date(estado.fecha_activacion).toLocaleDateString('es-CO', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Pendiente'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Expira</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {estado.fecha_expiracion
                            ? new Date(estado.fecha_expiracion).toLocaleDateString('es-CO', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerta de Expiración */}
            {estado.caducado && (
              <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-red-800 mb-2">❌ Suscripción Expirada</h3>
                <p className="text-red-700 mb-4">
                  Tu suscripción venció hace {Math.abs(estado.diasRestantes)} día(s).
                  Tu cuenta ha sido desactivada. Renueva ahora para continuar ofreciendo tus servicios.
                </p>
                <button
                  onClick={handleRenovar}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Renovar Ahora
                </button>
              </div>
            )}

            {estado.caducaProximamente && !estado.caducado && (
              <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-amber-800 mb-2">⏰ Renovación Próxima</h3>
                <p className="text-amber-700 mb-4">
                  Tu suscripción vence en {estado.diasRestantes} día(s). 
                  Renueva ahora para asegurar acceso continuo sin interrupciones.
                </p>
                <button
                  onClick={handleRenovar}
                  className="bg-amber-600 text-white px-6 py-2 rounded-lg hover:bg-amber-700 transition-colors font-semibold"
                >
                  Renovar Suscripción
                </button>
              </div>
            )}

            {estado.activo && !estado.caducado && !estado.caducaProximamente && (
              <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-green-800 mb-2">✅ Todo en Orden</h3>
                <p className="text-green-700 mb-3">
                  Tu suscripción está activa y vigente.
                </p>
                <p className="text-green-700 text-sm">
                  Días disponibles: <span className="font-bold">{estado.diasRestantes}</span>
                </p>
              </div>
            )}

            {!estado.activo && !estado.caducado && (
              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-yellow-800 mb-2">⏳ Pendiente de Pago</h3>
                <p className="text-yellow-700 mb-4">
                  Tu cuenta está pendiente de completar el pago inicial.
                </p>
                <button
                  onClick={() => navigate('/registro')}
                  className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
                >
                  Completar Pago
                </button>
              </div>
            )}

            {/* Botón de Renovación General */}
            {estado.activo && !estado.caducaProximamente && (
              <div className="flex gap-4">
                <button
                  onClick={handleRenovar}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                >
                  Renovar Suscripción
                </button>
                <button
                  onClick={() => navigate('/mi-perfil')}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Volver a Perfil
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
