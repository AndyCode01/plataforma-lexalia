import { useEffect, useMemo, useState } from 'react';
import { abogados as seedAbogados, especialidades, ciudades } from '../data/abogados';
import { apiGet } from '../services/api';
import AbogadoCard from './AbogadoCard';
import PerfilAbogado from './PerfilAbogado';

const CatalogoAbogados = () => {
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("Todas");
  const [filtroCiudad, setFiltroCiudad] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [abogadoSeleccionado, setAbogadoSeleccionado] = useState(null);
  const [items, setItems] = useState(seedAbogados);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Cargar desde API con filtros mínimos en servidor
        const params = new URLSearchParams();
        if (filtroCiudad !== 'Todas') params.set('ciudad', filtroCiudad);
        if (filtroEspecialidad !== 'Todas') params.set('especialidad', filtroEspecialidad);
        if (busqueda.trim()) params.set('q', busqueda.trim());
        const data = await apiGet(`/api/abogados?${params.toString()}`);
        if (isMounted) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        // Fallback a datos locales si falla el backend
        if (isMounted) {
          setItems(seedAbogados);
          setError('Mostrando datos locales (sin conexión al servidor)');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [filtroCiudad, filtroEspecialidad, busqueda]);

  const abogadosFiltrados = useMemo(() => items.filter((abogado) => {
    const cumpleEspecialidad = filtroEspecialidad === "Todas" || abogado.especialidad === filtroEspecialidad;
    const cumpleCiudad = filtroCiudad === "Todas" || abogado.ciudad === filtroCiudad;
    const term = busqueda.toLowerCase();
    const cumpleBusqueda = !term ||
      abogado.nombre?.toLowerCase().includes(term) ||
      abogado.especialidad?.toLowerCase().includes(term) ||
      abogado.descripcion?.toLowerCase().includes(term);
    
    return cumpleEspecialidad && cumpleCiudad && cumpleBusqueda;
  }), [items, filtroEspecialidad, filtroCiudad, busqueda]);

  return (
    <section id="catalogo" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Catálogo de Abogados
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra al profesional legal perfecto para tu caso
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por nombre
              </label>
              <input
                type="text"
                placeholder="Nombre del abogado..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Filtro Especialidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Especialidad
              </label>
              <select
                value={filtroEspecialidad}
                onChange={(e) => setFiltroEspecialidad(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {especialidades.map((esp) => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
            </div>

            {/* Filtro Ciudad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad
              </label>
              <select
                value={filtroCiudad}
                onChange={(e) => setFiltroCiudad(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {ciudades.map((ciudad) => (
                  <option key={ciudad} value={ciudad}>{ciudad}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 text-sm text-gray-600">
            {abogadosFiltrados.length} abogado{abogadosFiltrados.length !== 1 ? 's' : ''} encontrado{abogadosFiltrados.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Mensajes estado */}
        {error && (
          <div className="mb-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* Grid de Abogados */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Cargando abogados...</div>
        ) : abogadosFiltrados.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {abogadosFiltrados.map((abogado) => (
              <AbogadoCard
                key={abogado.id}
                abogado={abogado}
                onClick={() => setAbogadoSeleccionado(abogado)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No se encontraron abogados
            </h3>
            <p className="text-gray-500">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}

        {/* Modal de Perfil */}
        {abogadoSeleccionado && (
          <PerfilAbogado
            abogado={abogadoSeleccionado}
            onClose={() => setAbogadoSeleccionado(null)}
          />
        )}
      </div>
    </section>
  );
};

export default CatalogoAbogados;
