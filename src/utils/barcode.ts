// Code 39 Barcode SVG Generator
// Compatible with any standard USB 1D/2D Barcode scanner (Laser, Linear Imager, CCD)

const CODE39_PATTERNS: Record<string, string> = {
  '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
  '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
  '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
  'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
  'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
  'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
  'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
  'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
  'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
  '-': '010000101', '.': '110000100', ' ': '011000100', '$': '010101000',
  '/': '010100010', '+': '010001010', '%': '000101010', '*': '010010100',
};

/**
 * Generates an SVG string representation of a Code 39 Barcode.
 * Standard USB barcode scanners can read this directly off screen or printed paper.
 */
export function generateBarcodeSvg(value: string, height: number = 42): string {
  const upper = `*${value.toUpperCase()}*`;
  const narrowWidth = 2;
  const wideWidth = 5;
  const gap = 2;

  let currentX = 10;
  const rects: string[] = [];

  for (let i = 0; i < upper.length; i++) {
    const char = upper[i];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS['-'];

    for (let b = 0; b < 9; b++) {
      const isBar = b % 2 === 0;
      const isWide = pattern[b] === '1';
      const w = isWide ? wideWidth : narrowWidth;

      if (isBar) {
        rects.push(`<rect x="${currentX}" y="0" width="${w}" height="${height}" fill="currentColor" />`);
      }
      currentX += w;
    }
    currentX += gap;
  }

  const totalWidth = currentX + 10;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height}" class="w-full h-auto max-h-12 text-slate-900">${rects.join('')}</svg>`;
}
