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
    <section id="servicios" className="py-20 bg-gray-50">
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

  <div className="grid grid-cols-1 gap-8 max-w-xl mx-auto">
          {servicios.map((servicio, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 border-blue-600 flex flex-col items-center text-center"
            >
              <div className="mb-6 p-4 bg-blue-50 rounded-full">
                {servicio.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {servicio.titulo}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {servicio.descripcion}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a 
            href="#registro" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition transform hover:scale-105"
          >
            Comienza a Disfrutar de Estos Beneficios
          </a>
        </div>
      </div>
    </section>
  );
};

export default Servicios;
