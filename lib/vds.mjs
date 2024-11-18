export default class VDS {
  options = {};

  static COLORS = {
    BLACK: '000000',
    RED: 'ff0000',
    GREEN: '00ff00',
    BLUE: '0000ff',
    MAGENTA: 'ff00ff',
    CYAN: '00ffff',
    WHITE: 'ffffff',
  };

  static SHAPES = {
    BLANK: ' ',
    SQUARE: '■',
    TRIANGLE: '▲',
    CIRCLE: '●',
    CROSS: 'X',
    DIAMOND: '◆',
  };

  // constants inherited from aztec. don't change?
  static SIZES = {
    BASE: 0, // size of how many color+shape codes being used. written on load
    CORE: 9, // finder pattern bullseye from aztec. TODO
    MODE: 13, // not sure, see above.
  };

  static ENC_L = new Map();
  static ENC = VDS.getEntropyColorEncodings();


  constructor(opts = {}) {
    this.options = {
      ec: 23, // error correction TODO gonna use that fuckin reed-hoffman algo yo
      debug: false, // debug output
      ...opts,
    };
  }


  _debug(v) {
    if (this.options?.debug === true) console.log(v);
  }


  static getEntropyColorEncodings() {
    let encs = [{C: VDS.COLORS.WHITE, S: VDS.SHAPES.BLANK}];

    for (const [color, code] of Object.entries(VDS.COLORS)) {
      if (color === 'WHITE') continue;

      for (const [shape, char] of Object.entries(VDS.SHAPES)) {
        if (shape === 'BLANK') continue;
        encs.push({C: code, S: char});
      }
    }

    encs.forEach((enc, idx) => {
      VDS.ENC_L.set(`${enc.C}${enc.S}`, idx);
    });

    VDS.SIZES.BASE = encs.length;
    return encs;
  }



  makeBinaryPayload(data) {
    let bd;

    if (typeof data === 'string' || data instanceof String) {
      bd = this.encodeUint8AText(data);
    }
    else if (data instanceof Uint8Array) {
      bd = data;
    }
    else if (typeof data === 'object') {
      bd = this.encodeUint8AText(JSON.stringify(data));
    }
    else {
      throw new Error('unsupported data type');
    }

    /*
      here's where we could perform optimizations to lower the size of the payload.
      since we have a JSON string most likely, we can eliminate unnecessary quotes, brackets, etc.
      think CSS minification, for JSON
    */

    return bd;
  }


  encode(data) {
    const payload = this.makeBinaryPayload(data);
    const matrix = [];

    this._debug('encoding payload:');
    this._debug(Array.from(payload));

    for (const byte of payload) {
      if (byte === 0) {
        matrix.push(VDS.ENC[0], VDS.ENC[0]);
        continue;
      }

      const b1 = byte % VDS.SIZES.BASE;
      const b2 = Math.floor(byte / VDS.SIZES.BASE) % VDS.SIZES.BASE;

      this._debug(`\tbyte ${byte} [b1: ${b1}, b2: ${b2}]`);

      matrix.push(VDS.ENC[b1], VDS.ENC[b2]);
    }

    return matrix;
  }


  encodeUint8AText(data) {
    return new TextEncoder().encode(data);
  }
  decodeUint8AText(buffer) {
    return new TextDecoder().decode(new Uint8Array(buffer));
  }


  decode(matrix) {
    let res = '';
    let buffer = [];

    for (let idx = 0; idx < matrix.length; idx += 2) {
      const b1 = matrix[idx];
      const b2 = matrix[idx + 1];

      this._debug(`decoding matrix cell pair:`);
      this._debug(b1, b2);

      let byte = 0;

      [b1, b2].forEach((cell, i) => {
        const lkey = `${cell.C}${cell.S}`;
        const num = VDS.ENC_L.get(lkey);

        if (VDS.ENC_L.has(lkey)) {
          if (i === 0) byte += Number(num);
          else byte += Number(num) * VDS.SIZES.BASE;
        }
      });

      buffer.push(byte);

      const fb = buffer[0];
      let blen = 1;

      if ((fb & 0b10000000) === 0) blen = 1;
      else if ((fb & 0b11100000) === 0b11000000) blen = 2;
      else if ((fb & 0b11110000) === 0b11100000) blen = 3;
      else if ((fb & 0b11111000) === 0b11110000) blen = 4;

      if (buffer.length === blen) {
        try {
          res += this.decodeUint8AText(buffer);
        }
        catch{}

        buffer = [];
      }
    }

    if (buffer.length) {
      try {
        res += this.decodeUint8AText(buffer);
      }
      catch {}
    }

    return res;
  }
}