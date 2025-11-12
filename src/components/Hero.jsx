const Hero = () => {
  return (
    <section id="inicio" className="relative h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
          Únete a la Plataforma Legal Más Grande
        </h1>
        <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
          Conecta con clientes, accede a recursos exclusivos y potencia tu práctica legal
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="#registro" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition transform hover:scale-105"
          >
            Registrarse Ahora
          </a>
          <a 
            href="#servicios" 
            className="bg-transparent border-2 border-white hover:bg-white hover:text-slate-900 text-white font-bold py-3 px-8 rounded-lg text-lg transition"
          >
            Ver Beneficios
          </a>
        </div>
      </div>

      {/* Background Image Placeholder */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3')] bg-cover bg-center"></div>
      </div>
    </section>
  );
};

export default Hero;
