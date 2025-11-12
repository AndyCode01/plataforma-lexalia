const AbogadoCard = ({ abogado, onClick }) => {
  const imgSrc =
    abogado.foto_url ||
    abogado.foto ||
    (abogado.nombre
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(abogado.nombre)}&size=256&background=0D8ABC&color=fff`
      : 'https://via.placeholder.com/256x256.png?text=Abogado');
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      {/* Foto */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600">
        <img
          src={imgSrc}
          alt={abogado.nombre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold text-blue-600 flex items-center gap-1">
          ⭐ {abogado.rating}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
          {abogado.nombre}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {abogado.especialidad}
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {abogado.ciudad}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {abogado.casosGanados} casos ganados
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Ver Perfil
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbogadoCard;
