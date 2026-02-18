import { useNavigate, useSearchParams } from 'react-router-dom';

export default function RegistroError() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pago Rechazado</h1>
        <p className="text-gray-600 mb-6">
          Lo sentimos, tu pago no pudo ser procesado. Esto puede deberse a fondos insuficientes,
          datos incorrectos o rechazo de tu entidad bancaria.
        </p>
        {searchParams.get('status') && (
          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Estado:</strong> {searchParams.get('status')}
            </p>
            {searchParams.get('payment_id') && (
              <p className="text-sm text-gray-700 mt-1">
                <strong>ID de Pago:</strong> {searchParams.get('payment_id')}
              </p>
            )}
          </div>
        )}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/registro')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Intentar Nuevamente
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
