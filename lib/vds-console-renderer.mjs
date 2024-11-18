const COLORS_HEX_ANSI = {
  '000000': "\x1b[90m", // technically this is gray cuz my terminal bg is black
  'ff0000': "\x1b[31m",
  '00ff00': "\x1b[32m",
  '0000ff': "\x1b[34m",
  '00ffff': "\x1b[36m",
  'ff00ff': "\x1b[35m",
  'ffffff': "\x1b[37m",
};
const ANSI_COLOR_RESET = "\x1b[0m";


export default class VDSConsoleRenderer {
  matrix = [];

  constructor(matrix = []) {
    this.matrix = matrix;
  }

  render(matrix = []) {
    if (!matrix) matrix = this.matrix;
    let buffer = '';

    const perRow = Math.ceil(Math.sqrt(matrix.length));
    let idx = 0;

    for (const cell of matrix) {
      const color = COLORS_HEX_ANSI[cell.C] || COLORS_HEX_ANSI['ffffff'];
      const shape = cell.S.padEnd(2, ' ');

      buffer += `${color}${shape}${ANSI_COLOR_RESET}`;

      if (idx++ > perRow) {
        buffer += `\n`;
        idx = 0;
      }
    }

    return buffer;
  }
}