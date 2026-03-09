import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiPost } from '../services/api';

export default function RegistroPending() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('payment_id');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    if (!paymentId && !externalReference) return;

    let active = true;
    const interval = setInterval(async () => {
      try {
        const data = await apiPost('/mercadopago/confirmar-retorno', {
          paymentId,
          externalReference,
        });

        if (!active) return;
        if (data?.usuario?.estado_pago === 'aprobado') {
          navigate('/login', {
            replace: true,
            state: { message: 'Pago confirmado. Ya puedes iniciar sesión.' },
          });
        }
      } catch (_) {
        // Mantener polling silencioso mientras MP confirma
      }
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [paymentId, externalReference, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pago Pendiente</h1>
        <p className="text-gray-600 mb-6">
          Tu pago está siendo procesado. Recibirás una notificación por correo electrónico
          cuando se confirme el estado de tu transacción.
        </p>
        {paymentId && (
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>ID de Pago:</strong> {paymentId}
            </p>
            {externalReference && (
              <p className="text-sm text-gray-700 mt-1">
                <strong>Referencia:</strong> {externalReference}
              </p>
            )}
          </div>
        )}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 text-left">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Los pagos con transferencia bancaria o efectivo pueden tardar
            hasta 48 horas en confirmarse.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}
