import { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaRegCreditCard } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { apiPost } from '../services/api';

const planes = [
  { value: 'basico', label: 'Básico', precio: 60000 },
  { value: 'pro', label: 'Pro', precio: 120000 },
  { value: 'premium', label: 'Premium', precio: 180000 },
];

export default function RegistroAbogado() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', plan: 'basico' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errores, setErrores] = useState([]);
  const [usuarioId, setUsuarioId] = useState(null);
  const [pagoUrl, setPagoUrl] = useState(null);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUsuarioId(null);
    setPagoUrl(null);
    setErrores([]);
    try {
      // Registrar usuario provisional
      const res = await apiPost('/api/auth/register', {
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        rol: 'abogado',
        perfil: {},
        plan: form.plan,
      });
      setUsuarioId(res.userId);
      
      // MODO DESARROLLO: simular pago directo (comentar cuando tengas MercadoPago funcionando)
      const pagoRes = await apiPost('/api/mercadopago/simular-pago', {
        usuarioId: res.userId,
        plan: form.plan,
      });
      // Marcar como completado sin redirigir a MP
      setPagoUrl('SIMULADO');
      setError(null);
      setErrores([]);
      
      /* MODO PRODUCCIÓN: descomentar cuando tengas el token de MercadoPago
      const pagoRes = await apiPost('/api/mercadopago/preferencia', {
        usuarioId: res.userId,
        plan: form.plan,
      });
      setPagoUrl(pagoRes.url);
      */
    } catch (err) {
      // Si el backend devuelve errores de validación
      if (err.data && Array.isArray(err.data.errors)) {
        setErrores(err.data.errors.map(e => e.msg));
        setError(null);
      } else {
        setError(err.message || 'Error en el registro');
        setErrores([]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-300 animate-fadein">
      <div className="max-w-md w-full bg-white/90 p-8 rounded-2xl shadow-2xl border border-blue-100 backdrop-blur-md">
  <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 drop-shadow">Registro de Abogado</h2>
        {error && <div className="mb-4 text-red-600 bg-red-100 border border-red-200 rounded px-3 py-2 animate-shake">{error}</div>}
        {errores.length > 0 && (
          <ul className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 animate-shake">
            {errores.map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        )}
        {!pagoUrl ? (
          <form onSubmit={handleSubmit} className="space-y-5 animate-fadein-slow">
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Nombre completo</label>
              <span className="absolute left-3 top-9 text-blue-400"><FaUser /></span>
              <input name="nombre" value={form.nombre} onChange={handleChange} required
                className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm bg-white/80" />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Email</label>
              <span className="absolute left-3 top-9 text-blue-400"><FaEnvelope /></span>
              <input name="email" type="email" value={form.email} onChange={handleChange} required
                className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm bg-white/80" />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Contraseña</label>
              <span className="absolute left-3 top-9 text-blue-400"><FaLock /></span>
              <input name="password" type="password" value={form.password} onChange={handleChange} required
                className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm bg-white/80" />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Plan</label>
              <span className="absolute left-3 top-9 text-blue-400"><FaRegCreditCard /></span>
              <select name="plan" value={form.plan} onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 shadow-sm bg-white/80">
                {planes.map(p => <option key={p.value} value={p.value}>{p.label} - ${p.precio}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-semibold shadow-md hover:from-blue-700 hover:to-blue-500 transition-all duration-200 flex items-center justify-center gap-2">
              {loading && <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>}
              {loading ? 'Procesando...' : 'Registrar y pagar'}
            </button>
          </form>
        ) : (
          <div className="text-center animate-fadein-slow">
            <h3 className="text-xl font-bold mb-4 text-green-600 flex items-center justify-center gap-2">
              <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Registro y pago exitoso
            </h3>
            <p className="mb-4">Tu membresía ha sido activada. Ya puedes iniciar sesión y completar tu perfil de abogado.</p>
            <p className="text-sm text-gray-600 mb-6">
              Plan: <strong className="capitalize">{form.plan}</strong> | Usuario ID: {usuarioId}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/login" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all duration-200 shadow">
                Iniciar sesión
              </Link>
              <Link to="/" className="inline-block px-6 py-2 bg-gray-600 text-white rounded-lg font-bold hover:bg-gray-700 transition-all duration-200 shadow">
                Ir al inicio
              </Link>
            </div>
          </div>
        )}
      </div>
      {/* Animaciones personalizadas */}
      <style>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fadein { animation: fadein 0.7s cubic-bezier(.4,0,.2,1) both; }
        .animate-fadein-slow { animation: fadein 1.2s cubic-bezier(.4,0,.2,1) both; }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
}
