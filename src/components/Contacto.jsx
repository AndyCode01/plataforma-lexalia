import { useState } from 'react';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    especialidad: '',
    mensaje: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Formulario enviado:', formData);
    alert('¡Gracias por contactarnos! Nos pondremos en contacto contigo pronto.');
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      especialidad: '',
      mensaje: ''
    });
  };

  return (
    <section id="contacto" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Formulario de Contacto
          </h2>
          <div className="w-24 h-1 bg-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Regístrate y comienza a aprovechar todos nuestros beneficios
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-gray-50 p-8 rounded-lg shadow-lg">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="nombre">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="juan@ejemplo.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="telefono">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2" htmlFor="especialidad">
                  Especialidad Legal *
                </label>
                <select
                  id="especialidad"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="civil">Derecho Civil</option>
                  <option value="penal">Derecho Penal</option>
                  <option value="laboral">Derecho Laboral</option>
                  <option value="mercantil">Derecho Mercantil</option>
                  <option value="familiar">Derecho Familiar</option>
                  <option value="administrativo">Derecho Administrativo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2" htmlFor="mensaje">
                Mensaje
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Cuéntanos sobre tu práctica legal y qué te interesa de nuestra plataforma..."
              ></textarea>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-12 rounded-lg text-lg transition transform hover:scale-105"
              >
                Enviar Registro
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contacto;
