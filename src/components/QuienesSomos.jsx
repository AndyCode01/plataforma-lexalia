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

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Text Content */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Impulsamos talento joven, acercamos la justicia
            </h3>
            {/* Texto principal en columnas para equilibrar con el carrusel */}
            <div lang="es" className="space-y-4 text-gray-700 leading-relaxed xl:columns-2 xl:gap-10 xl:[column-fill:balance] [text-align:justify] [text-justify:inter-word] [hyphens:auto]">
              <p>
                En <span className="font-semibold">LEXALIA</span> creemos en el poder del talento joven y en la importancia de hacer el
                derecho más accesible para todos. Somos una plataforma digital que conecta a personas
                que buscan asesoría legal con abogados jóvenes y comprometidos, dispuestos a brindar soluciones
                claras, éticas y humanas.
              </p>
              <p>
                Nacimos con un propósito: dar visibilidad a las nuevas generaciones de profesionales del derecho y,
                al mismo tiempo, acercar la asesoría jurídica a quienes la necesitan de forma sencilla, confiable y
                transparente.
              </p>
              <p>
                Nuestro compromiso es construir una comunidad donde el conocimiento se comparta, la justicia se acerque a las personas
                y los abogados encuentren un espacio para crecer profesionalmente, inspirar confianza y transformar la práctica del
                derecho desde una mirada moderna y solidaria.
              </p>
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

        {/* Misión y Visión (debajo para priorizar equilibrio texto/carrusel) */}
        <div className="grid sm:grid-cols-2 gap-4 mt-12">
          <div className="p-5 rounded-xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">🎯</span>
              <h4 className="text-lg font-semibold text-slate-900">Misión</h4>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed [text-align:justify] [text-justify:inter-word] [hyphens:auto]">
              Facilitar el acceso a servicios legales confiables conectando a personas con abogados jóvenes, talentosos y
              comprometidos. A través de una plataforma digital accesible y moderna, impulsamos el crecimiento profesional
              de los nuevos abogados mientras acercamos soluciones jurídicas claras, éticas y al alcance de todos.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">🚀</span>
              <h4 className="text-lg font-semibold text-slate-900">Visión</h4>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed [text-align:justify] [text-justify:inter-word] [hyphens:auto]">
              Ser la plataforma líder en Latinoamérica que transforma la manera de acceder a la asesoría legal, destacando el
              talento de las nuevas generaciones de abogados y promoviendo una cultura jurídica más humana, transparente y
              accesible para todos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuienesSomos;
