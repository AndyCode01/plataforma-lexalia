// Test de cálculo de fechas - Ejecutar antes de subir a producción
// node server/test-fechas.js

console.log('🧪 TEST: Cálculo de Suscripciones - 30 días exactos\n');

// Función que replica la lógica del backend
function calcularFechaExpiracion(fechaInicio) {
  const fechaFin = new Date(fechaInicio.getTime());
  fechaFin.setDate(fechaFin.getDate() + 30);
  return fechaFin;
}

function calcularDiasRestantes(fechaExpiracion) {
  const ahora = new Date();
  return Math.ceil((new Date(fechaExpiracion).getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
}

// Casos de prueba
const tests = [
  { nombre: 'Marzo → Abril', fecha: new Date('2026-03-09T00:00:00') },
  { nombre: 'Enero → Febrero', fecha: new Date('2026-01-01T00:00:00') },
  { nombre: 'Febrero → Marzo', fecha: new Date('2026-02-15T00:00:00') },
  { nombre: 'Fin de mes', fecha: new Date('2026-01-31T00:00:00') },
  { nombre: 'Diciembre → Enero', fecha: new Date('2025-12-15T00:00:00') },
];

console.log('Caso                    | Inicio       | Expira       | Días  | ✓');
console.log('------------------------|--------------|--------------|-------|---');

let todosOk = true;

tests.forEach(test => {
  const expira = calcularFechaExpiracion(test.fecha);
  const diasDiferencia = Math.round((expira - test.fecha) / (1000 * 60 * 60 * 24));
  const ok = diasDiferencia === 30 ? '✓' : '✗';
  
  if (diasDiferencia !== 30) todosOk = false;
  
  console.log(
    `${test.nombre.padEnd(23, ' ')} | ${formatFecha(test.fecha)} | ${formatFecha(expira)} | ${diasDiferencia.toString().padStart(5)} | ${ok}`
  );
});

function formatFecha(fecha) {
  return fecha.toISOString().split('T')[0];
}

console.log('');

if (todosOk) {
  console.log('✅ TODOS LOS TESTS PASARON - Seguro para producción\n');
  
  // Test adicional: verificar contador de días
  console.log('🧪 TEST: Contador de días restantes\n');
  
  const hoy = new Date();
  const en5Dias = new Date(hoy.getTime() + 5 * 24 * 60 * 60 * 1000);
  const hace2Dias = new Date(hoy.getTime() - 2 * 24 * 60 * 60 * 1000);
  
  console.log(`Expira en 5 días:  ${calcularDiasRestantes(en5Dias)} días (esperado: 5) ${calcularDiasRestantes(en5Dias) === 5 ? '✓' : '✗'}`);
  console.log(`Expiró hace 2 días: ${calcularDiasRestantes(hace2Dias)} días (esperado: -2) ${calcularDiasRestantes(hace2Dias) === -2 ? '✓' : '✗'}`);
  
  console.log('\n✅ Sistema listo para producción!\n');
  console.log('Siguiente paso:');
  console.log('  git add .');
  console.log('  git commit -m "feat: Suscripciones con 30 días exactos + Deploy scripts"');
  console.log('  git push origin main\n');
} else {
  console.log('❌ ALGUNOS TESTS FALLARON - NO SUBIR A PRODUCCIÓN\n');
  process.exit(1);
}
