import VDS from './vds.mjs';


export default class VDSSVGRenderer {
  matrix = [];

  options = {
    cellSize: 10, // pixels per cell
    cellMargin: 2, // padding around cells
    shapeStroke: 1, // for more visual clarity
    ec: 30, // error correction (todo)
    version: 1,
  };

  FINDER_GRID = 5;


  constructor(matrix = []) {
    this.matrix = matrix;
  }


  render(matrix = []) {
    if (!matrix) matrix = this.matrix;
    let svga = [];

    const totalCells = matrix.length + (Math.pow(this.FINDER_GRID, 2) * 2); // end math is for two finders
    const grid = Math.ceil(Math.sqrt(totalCells));
    //const gridPixels = grid * (this.options.cellSize + this.options.cellMargin);
    const gridPixels = (grid * this.options.cellSize) + ((grid + 1) * this.options.cellMargin);
    const matrix2d = this.fillMatrix2d(Array.from({length: grid}, _ => Array(grid).fill(null)), matrix);

    svga.push(
      `<?xml version="1.0" encoding="UTF-8"?>\n`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${gridPixels} ${gridPixels}">\n`,
    );

    for (let ridx = 0; ridx < matrix2d.length; ridx++) {
      for (let cidx = 0; cidx < matrix2d.length; cidx++) {
        svga.push(this.renderCell(matrix2d[ridx][cidx], ridx, cidx));
      }
    }

    svga.push('</svg>');
    return svga.join('');
  }


  fillMatrix2d(matrix2d, matrix) {
    const f1_bound_min = 0;
    const f1_bound_max = this.FINDER_GRID - 1;
    const f2_bound_min = matrix2d.length - this.FINDER_GRID;
    const f2_bound_max = matrix2d.length - 1;

    let fm1 = this.finderMatrix();
    let fm2 = this.finderMatrix();

    for (let ridx = 0; ridx < matrix2d.length; ridx++) {
      for (let cidx = 0; cidx < matrix2d.length; cidx++) {
        // hit area for finder 1
        if (ridx >= f1_bound_min && ridx <= f1_bound_max && cidx >= f1_bound_min && cidx <= f1_bound_max) {
          matrix2d[ridx][cidx] = fm1.shift();
        }

        // hit area for finder 2
        else if (ridx >= f2_bound_min && ridx <= f2_bound_max && cidx >= f2_bound_min && cidx <= f2_bound_max) {
          matrix2d[ridx][cidx] = fm2.shift();
        }

        // normal data
        else {
          let cell = matrix.shift();
          if (!cell) cell = {S: VDS.SHAPES.BLANK, C: VDS.COLORS.WHITE};

          matrix2d[ridx][cidx] = cell;
        }
      }
    }

    return matrix2d;
  }


  finderMatrix() {
    const matrix = Array.from({length: this.FINDER_GRID}, _ => Array(this.FINDER_GRID).fill(0));
    const rings = Math.ceil(this.FINDER_GRID / 2);

    for (let ring = 0; ring < rings; ring++) {
      const cell = {
        S: VDS.SHAPES.SQUARE,
        C: ring % 2 === 0 ? VDS.COLORS.BLACK : VDS.COLORS.WHITE,
      };

      for (let idx = ring; idx < this.FINDER_GRID - ring; idx++) {
        matrix[ring][idx] = cell;
        matrix[this.FINDER_GRID - ring - 1][idx] = cell;
        matrix[idx][ring] = cell;
        matrix[idx][this.FINDER_GRID - ring - 1] = cell;
      }
    }

    return matrix.flat();
  }


  renderCell(cell, ridx, cidx) {
    const size = this.options.cellSize;
    const margin = this.options.cellMargin;
    const x = (cidx * (size + margin)) + margin;
    const y = (ridx * (size + margin)) + margin;

    let shape = [];
    const stroke = this.options.shapeStroke ? `stroke="#${VDS.COLORS.BLACK}" stroke-width="${this.options.shapeStroke}"` : '';

    switch (cell.S) {
      case VDS.SHAPES.SQUARE:
        shape.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="#${cell.C}" ${cell.C !== VDS.COLORS.WHITE ? stroke : ''}/>`);
        break;
      case VDS.SHAPES.TRIANGLE:
        shape.push(`<polygon points="${x + size / 2},${y} ${x},${y + size} ${x + size},${y + size}" fill="#${cell.C}" ${stroke}/>`);
        break;
      case VDS.SHAPES.CIRCLE:
        shape.push(`<circle cx="${x + size / 2}" cy="${y + size / 2}" r="${size / 2}" fill="#${cell.C}" ${stroke}/>`);
        break;
      case VDS.SHAPES.DIAMOND:
        shape.push(`<polygon points="${x + size / 2},${y} ${x + size},${y + size / 2} ${x + size / 2},${y + size} ${x},${y + size / 2}" fill="#${cell.C}" ${stroke}/>`);
        break;
      case VDS.SHAPES.CROSS:
        const quart = size / 4;
        const half = size / 2;

        shape.push(
          `<g stroke="#${cell.C}" stroke-width="${quart}" stroke-linecap="butt">`,
            `<line x1="${x}" y1="${y + half}" x2="${x + size}" y2="${y + half}"/>`,
            `<line x1="${x + half}" y1="${y}" x2="${x + half}" y2="${y + size}"/>`,
          `</g>`,
        );
        break;
      default:
        if (cell.C !== VDS.COLORS.WHITE) {
          shape.push(`<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="#${cell.C}"/>`);
        }
    }

    return shape.join('');
  }
}