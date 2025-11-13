const Servicios = () => {
  const servicios = [
    {
      icon: (
        <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      titulo: "Asesoramiento",
      descripcion:
        "Recibe orientación práctica y sencilla de futuros abogados comprometidos con ayudarte."
    }
  ];

  return (
    <section id="servicios" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/40 relative overflow-hidden">
      {/* decor */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Nuestros Servicios
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Beneficios exclusivos diseñados para impulsar tu práctica legal
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 max-w-2xl mx-auto">
          {servicios.map((servicio, index) => (
            <div
              key={index}
              className="relative bg-white p-10 rounded-2xl shadow-xl ring-1 ring-blue-100/70 hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center"
            >
              <div className="absolute -top-8">
                <div className="mx-auto mb-2 p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg">
                  {servicio.icon}
                </div>
              </div>
              <div className="pt-6">
                <span className="inline-block mb-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 rounded-full">
                  Servicio destacado
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 mb-3">
                  {servicio.titulo}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
                  {servicio.descripcion}
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full">Orientación clara</span>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">Respuesta oportuna</span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">Acompañamiento humano</span>
                </div>
                <div className="mt-8">
                  <a
                    href="/consultas"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition transform hover:scale-[1.02]"
                  >
                    Publicar mi consulta
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Servicios;
