export function RegistroExito() {
  return (
    <section className="py-24 text-center">
      <h2 className="text-3xl font-bold text-green-700 mb-2">¡Pago aprobado!</h2>
      <p className="text-gray-700">Tu membresía fue activada. Inicia sesión y completa tu perfil para aparecer en el catálogo.</p>
    </section>
  );
}

export function RegistroError() {
  return (
    <section className="py-24 text-center">
      <h2 className="text-3xl font-bold text-red-700 mb-2">Pago rechazado</h2>
      <p className="text-gray-700">Intenta nuevamente o contacta soporte.</p>
    </section>
  );
}

export function RegistroPending() {
  return (
    <section className="py-24 text-center">
      <h2 className="text-3xl font-bold text-amber-700 mb-2">Pago pendiente</h2>
      <p className="text-gray-700">Estamos esperando la confirmación. Se activará automáticamente cuando se apruebe.</p>
    </section>
  );
}
