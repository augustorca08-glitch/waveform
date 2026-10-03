/**
 * Tamaño de display que garantiza que una palabra entre en el ancho disponible.
 * Archivo Black expandido mide ~0.96em por carácter en mayúsculas.
 * @param text   texto (se usa la línea más larga)
 * @param maxVw  tamaño deseado en vw
 * @param availVw ancho disponible en vw
 * @param maxRem tope en rem para pantallas grandes
 */
export function fitDisplay(text: string, maxVw: number, availVw = 90, maxRem?: number) {
  const longest = Math.max(...text.split("\n").map((l) => l.length), 1);
  const vw = Math.min(maxVw, availVw / (longest * 0.96));
  return { fontSize: maxRem ? `min(${maxRem}rem, ${vw.toFixed(2)}vw)` : `${vw.toFixed(2)}vw` };
}
