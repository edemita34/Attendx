// Code 39 Industrial Barcode SVG Generator
// Highly compatible with any standard USB 1D/2D Barcode scanner (Laser, Linear Imager, CCD)
// and camera-based barcode readers.

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
 * Standard USB barcode scanners and laser guns can read this directly off screens or printed ID cards.
 */
export function generateBarcodeSvg(
  value: string,
  height: number = 55,
  options: {
    showText?: boolean;
    textColor?: string;
    barColor?: string;
    narrowWidth?: number;
    wideWidth?: number;
    gap?: number;
    padding?: number;
  } = {}
): string {
  const {
    showText = false,
    textColor = '#0f172a',
    barColor = '#000000',
    narrowWidth = 2,
    wideWidth = 5,
    gap = 2,
    padding = 12,
  } = options;

  const rawClean = (value || '0000').toUpperCase().replace(/[^0-9A-Z\-.$/+% ]/g, '-');
  const upper = `*${rawClean}*`;

  let currentX = padding;
  const rects: string[] = [];

  for (let i = 0; i < upper.length; i++) {
    const char = upper[i];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS['-'];

    for (let b = 0; b < 9; b++) {
      const isBar = b % 2 === 0;
      const isWide = pattern[b] === '1';
      const w = isWide ? wideWidth : narrowWidth;

      if (isBar) {
        rects.push(`<rect x="${currentX}" y="0" width="${w}" height="${height}" fill="${barColor}" />`);
      }
      currentX += w;
    }
    currentX += gap;
  }

  const totalWidth = currentX + padding;
  const totalHeight = showText ? height + 18 : height;

  const textElement = showText
    ? `<text x="${totalWidth / 2}" y="${height + 14}" font-family="monospace" font-size="11" font-weight="bold" fill="${textColor}" text-anchor="middle" letter-spacing="3">*${rawClean}*</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="100%" height="100%" class="w-full h-auto text-slate-900">${rects.join('')}${textElement}</svg>`;
}

/**
 * Download Barcode as a standalone SVG file
 */
export function downloadBarcodeSvg(value: string, filename: string = 'staff-barcode.svg'): void {
  const svgString = generateBarcodeSvg(value, 70, { showText: true, padding: 16 });
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download Barcode as a high-res PNG image
 */
export function downloadBarcodePng(value: string, filename: string = 'staff-barcode.png'): void {
  const svgString = generateBarcodeSvg(value, 80, { showText: true, padding: 20 });
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width * 2 || 600;
    canvas.height = img.height * 2 || 200;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
}
