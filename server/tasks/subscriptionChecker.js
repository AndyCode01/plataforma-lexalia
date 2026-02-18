import { Usuario } from '../models/Usuario.js';
import { Op } from 'sequelize';

/**
 * Tarea automática para verificar y desactivar suscripciones expiradas
 * Se ejecuta cada hora automáticamente
 */
export async function verificarSuscripcionesExpiradas() {
  try {
    const ahora = new Date();
    
    // Buscar usuarios con suscripción expirada y que aún estén activos
    const usuariosExpirados = await Usuario.findAll({
      where: {
        fecha_expiracion: {
          [Op.lt]: ahora, // fecha_expiracion < ahora
        },
        activo: true, // que estén activos
      },
    });

    if (usuariosExpirados.length === 0) {
      console.log('⏰ Verificación de suscripciones: Todas las cuentas al día ✅');
      return;
    }

    // Desactivar los usuarios con suscripción expirada
    for (const usuario of usuariosExpirados) {
      usuario.activo = false;
      usuario.estado_pago = 'expirado';
      await usuario.save();
      console.log(`⏳ Suscripción EXPIRADA y cuenta DESACTIVADA: ${usuario.nombre} (${usuario.email})`);
    }

    console.log(`✅ Se desactivaron ${usuariosExpirados.length} cuenta(s) con suscripción expirada`);
  } catch (err) {
    console.error('❌ Error verificando suscripciones:', err.message);
  }
}

/**
 * Búsqueda de usuarios cuya suscripción vence pronto (7 días)
 * Útil para enviar notificaciones
 */
export async function obtenerUsuariosProxAExpirar() {
  try {
    const ahora = new Date();
    const en7Dias = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);

    const usuarios = await Usuario.findAll({
      where: {
        fecha_expiracion: {
          [Op.between]: [ahora, en7Dias],
        },
        activo: true,
        estado_pago: 'aprobado',
      },
    });

    return usuarios;
  } catch (err) {
    console.error('❌ Error buscando usuarios próximos a expirar:', err.message);
    return [];
  }
}

/**
 * Función para obtener estadísticas de suscripciones
 */
export async function obtenerEstadisticasSuscripciones() {
  try {
    const ahora = new Date();

    const activas = await Usuario.count({
      where: {
        activo: true,
        estado_pago: 'aprobado',
        fecha_expiracion: {
          [Op.gte]: ahora,
        },
      },
    });

    const expiradas = await Usuario.count({
      where: {
        activo: false,
        estado_pago: 'expirado',
      },
    });

    const proxAExpirar = await Usuario.count({
      where: {
        activo: true,
        estado_pago: 'aprobado',
        fecha_expiracion: {
          [Op.between]: [ahora, new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000)],
        },
      },
    });

    return {
      activas,
      expiradas,
      proxAExpirar,
      total: activas + expiradas,
    };
  } catch (err) {
    console.error('❌ Error obteniendo estadísticas:', err.message);
    return { activas: 0, expiradas: 0, proxAExpirar: 0, total: 0 };
  }
}

export default {
  verificarSuscripcionesExpiradas,
  obtenerUsuariosProxAExpirar,
  obtenerEstadisticasSuscripciones,
};
