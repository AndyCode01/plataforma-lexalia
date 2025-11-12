import { useState } from 'react';

const QuienesSomos = () => {
  // Carga automática de imágenes locales desde src/assets/abogados
  const localImageModules = import.meta.glob('../assets/abogados/*.{jpg,jpeg,png,webp,avif}', { eager: true });
  const localImages = Object.keys(localImageModules)
    .sort()
    .map((k) => localImageModules[k].default);
  const images = localImages;
  const hasImages = images.length > 0;
  const [current, setCurrent] = useState(0);
  const prev = () => {
    if (!hasImages) return;
    setCurrent((i) => (i === 0 ? images.length - 1 : i - 1));
  };
  const next = () => {
    if (!hasImages) return;
    setCurrent((i) => (i === images.length - 1 ? 0 : i + 1));
  };
  return (
    <section id="quienes-somos" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Quiénes Somos
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              La Plataforma que Impulsa tu Carrera Legal
            </h3>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Somos una plataforma innovadora dedicada a conectar abogados profesionales 
              con oportunidades únicas de crecimiento. Nuestra misión es facilitar el acceso 
              a recursos, clientes y una red de profesionales del derecho.
            </p>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Con más de 10 años de experiencia en el sector legal, hemos ayudado a miles 
              de abogados a expandir su práctica y mejorar sus servicios a través de 
              herramientas tecnológicas de vanguardia.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="text-3xl font-bold text-blue-600">5000+</h4>
                <p className="text-gray-600">Abogados Registrados</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="text-3xl font-bold text-blue-600">15000+</h4>
                <p className="text-gray-600">Casos Resueltos</p>
              </div>
            </div>
          </div>

          {/* Carousel de imágenes de abogados */}
          <div className="relative w-full max-w-xl mx-auto">
            <div className="relative overflow-hidden rounded-xl shadow-2xl aspect-[4/3] bg-slate-100">
              {hasImages ? (
                <>
                  {images.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt={`Abogados ${i + 1}`}
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                        i === current ? 'opacity-100' : 'opacity-0'
                      }`}
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  ))}
                  {/* Controles */}
                  <button
                    onClick={prev}
                    aria-label="Imagen anterior"
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2 shadow"
                  >
                    ◀
                  </button>
                  <button
                    onClick={next}
                    aria-label="Imagen siguiente"
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-700 rounded-full p-2 shadow"
                  >
                    ▶
                  </button>
                  {/* Dots */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        aria-label={`Ir a la imagen ${i + 1}`}
                        className={`h-2 w-2 rounded-full transition-all ${
                          i === current ? 'bg-white w-6' : 'bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-center p-6">
                  <div>
                    <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl">📁</div>
                    <p className="text-slate-600">Agrega imágenes en <span className="font-semibold">src/assets/abogados</span> para mostrarlas aquí.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuienesSomos;
