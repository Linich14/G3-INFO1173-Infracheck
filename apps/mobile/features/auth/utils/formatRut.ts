// Utilidad para formatear RUT chileno a 99.999.999-k
export function formatRut(rut: string) {
  rut = rut.replace(/[^0-9kK]/g, '');
  if (rut.length === 0) return '';
  // Limitar a 9 dígitos + 1 dígito verificador (máx 10 caracteres)
  rut = rut.slice(0, 9) + rut.slice(9, 10);
  let body = rut.slice(0, -1);
  let dv = rut.slice(-1);
  let formatted = '';
  for (let i = 0, j = body.length; j > 0; i++, j--) {
    formatted = body.charAt(j - 1) + formatted;
    if (i % 3 === 2 && j !== 1) formatted = '.' + formatted;
  }
  if (body.length > 0) formatted += '-' + dv;
  else formatted = dv;
  return formatted;
}
