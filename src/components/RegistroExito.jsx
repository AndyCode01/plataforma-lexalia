import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function RegistroExito() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');

    console.log('Pago completado:', { paymentId, status, externalReference });

    // Obtener datos del usuario desde localStorage
    const user = localStorage.getItem('user');
    if (user) {
      setUserData(JSON.parse(user));
    }

    // Simular verificación
    setTimeout(() => setLoading(false), 2000);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verificando pago...</h2>
            <p className="text-gray-600">Por favor espera un momento</p>
          </div>
        ) : (
          <>
            {/* Header Success */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 px-8 py-12 text-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">¡Pago Exitoso!</h1>
              <p className="text-green-100 text-lg">Tu cuenta ha sido activada correctamente</p>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Success Message */}
              <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8 rounded">
                <h2 className="text-xl font-bold text-green-800 mb-2">🎉 ¡Bienvenido a Lexalia Abogados!</h2>
                <p className="text-green-700 mb-3">
                  Tu registro como <strong>abogado profesional</strong> ha sido completado exitosamente.
                  Tu cuenta está completamente activada y lista para usar.
                </p>
                <p className="text-green-700 text-sm">
                  Recibirás un correo de confirmación en breve con los detalles de tu cuenta.
                </p>
              </div>

              {/* Account Info */}
              {userData && (
                <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de tu cuenta:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600 text-sm">Nombre</p>
                      <p className="text-gray-900 font-semibold">{userData.nombre || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm">Email</p>
                      <p className="text-gray-900 font-semibold">{userData.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles del pago:</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-600">Concepto</span>
                    <span className="font-semibold text-gray-900">Membresía Premium Lexalia</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-600">Monto</span>
                    <span className="font-bold text-lg text-green-600">$ 100.000 COP</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                    <span className="text-gray-600">ID de Pago</span>
                    <span className="text-sm font-mono text-gray-600">
                      {searchParams.get('payment_id') || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Referencia</span>
                    <span className="text-sm font-mono text-gray-600">
                      {searchParams.get('external_reference') || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-8 rounded">
                <h3 className="text-lg font-semibold text-amber-900 mb-3">Próximos pasos:</h3>
                <ul className="space-y-2 text-amber-900 text-sm">
                  <li className="flex items-start">
                    <span className="text-lg mr-3">✓</span>
                    <span>Tu perfil de abogado está visible en el catálogo</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-lg mr-3">✓</span>
                    <span>Puedes recibir consultas de clientes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-lg mr-3">✓</span>
                    <span>Acceso completo al panel profesional</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-lg mr-3">✓</span>
                    <span>Tu membresía es válida por 30 días desde hoy</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/mi-perfil')}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 rounded-lg hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105 font-bold text-lg shadow-lg"
                >
                  📊 Ir a Mi Perfil
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-200 text-gray-800 py-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  ← Volver al Inicio
                </button>
              </div>

              {/* Support */}
              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  ¿Necesitas ayuda? Contacta a nuestro equipo de soporte en
                  <a href="mailto:soporte@lexalia.com" className="text-blue-600 hover:underline ml-1">
                    soporte@lexalia.com
                  </a>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
