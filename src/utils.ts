class KMP {
  prefixTable: Array<number>;
  constructor(public pattern: Uint8Array) {
    const table = Array(pattern.length).fill(0);

    for (let [i, j] = [1, 0]; i < pattern.length; i++) {
      while (j > 0 && pattern[i] !== pattern[j]) {
        j = table[j - 1];
      }
      if (pattern[i] === pattern[j]) {
        j++;
      }
      table[i] = j;
    }

    this.prefixTable = table;
  }

  search(source: Uint8Array, start: number = 0) {
    const patternLength = this.pattern.length;
    const textLength = source.length;

    for (let [i, j] = [start, 0]; i < textLength; i++) {
      while (j > 0 && source[i] !== this.pattern[j]) {
        j = this.prefixTable[j - 1];
      }
      if (source[i] === this.pattern[j]) {
        j++;
      }
      if (j === patternLength) {
        return i - j + 1;
      }
    }
    return -1;
  }
}

function cmp(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

export const writer = {
  byte(value: number) {
    return new Uint8Array([value]);
  },
  short(value: number, littleEndian = true) {
    const buffer = new ArrayBuffer(2);
    new DataView(buffer).setInt16(0, value, littleEndian);
    return new Uint8Array(buffer);
  },
  ushort(value: number, littleEndian = true) {
    const buffer = new ArrayBuffer(2);
    new DataView(buffer).setUint16(0, value, littleEndian);
    return new Uint8Array(buffer);
  },
  int(value: number, littleEndian = true) {
    const buffer = new ArrayBuffer(4);
    new DataView(buffer).setInt32(0, value, littleEndian);
    return new Uint8Array(buffer);
  },
  uint(value: number, littleEndian = true) {
    const buffer = new ArrayBuffer(4);
    new DataView(buffer).setUint32(0, value, littleEndian);
    return new Uint8Array(buffer);
  },
  long(value: number, littleEndian = true) {
    const buffer = new ArrayBuffer(8);
    new DataView(buffer).setBigInt64(0, BigInt(value), littleEndian);
    return new Uint8Array(buffer);
  },
  ulong(value: number, littleEndian = true) {
    const buffer = new ArrayBuffer(8);
    new DataView(buffer).setBigUint64(0, BigInt(value), littleEndian);
    return new Uint8Array(buffer);
  },
  float(value: number, littleEndian = true) {
    const buffer = new ArrayBuffer(4);
    new DataView(buffer).setFloat32(0, value, littleEndian);
    return new Uint8Array(buffer);
  },
  double(value: number, littleEndian = true) {
    const buffer = new ArrayBuffer(8);
    new DataView(buffer).setFloat64(0, value, littleEndian);
    return new Uint8Array(buffer);
  },
  text(value: string) {
    return new TextEncoder().encode(value);
  },
};

export enum LengthType {
  Byte,
  Uint16,
  Uint32,
}

export const GlobalLengthType = {
  value: LengthType.Byte,
};

export class BytesReader {
  offset = 0;
  lengthType: LengthType = GlobalLengthType.value;
  littleEdian: boolean = true;

  constructor(
    public data: Uint8Array,
    options?: {
      lengthType?: LengthType;
      littleEdian?: boolean;
    },
    public _tag = ""
  ) {
    options?.lengthType && (this.lengthType = options.lengthType);
    options?.littleEdian && (this.littleEdian = options.littleEdian);
    _tag && (this._tag = `reader: ${_tag}`);
  }

  seek(length: number, _tag = "") {
    _tag &&
      console.log(
        `${this._tag ? this._tag + ":" : ""} ${_tag} -> ${
          this.offset
        } + ${length}`
      );
    this.offset += length;
  }

  setOffset(offset = 0) {
    this.offset = offset;
    console.log(`${this._tag}: setoffset -> ${this.offset}`);
  }

  read(length?: number, _tag = "") {
    let slice = new Uint8Array();
    if (length) {
      slice = this.data.slice(this.offset, this.offset + length);
      this.seek(length, _tag);
    } else if (length === undefined) {
      slice = this.data.slice(this.offset);
      console.log(
        `${this._tag}: ${this.offset} -> ${this.data.length} read to end`
      );
      this.offset = this.data.length;
    }
    return slice;
  }

  text() {
    let length;
    switch (this.lengthType) {
      case LengthType.Byte:
        length = this.byte();
        break;
      case LengthType.Uint16:
        length = this.ushort();
        break;
      case LengthType.Uint32:
        length = this.uint();
        break;
    }

    if (length > 0) {
      return new TextDecoder().decode(this.read(length));
    } else {
      return "";
    }
  }

  boolean() {
    return Boolean(this.byte());
  }

  byte() {
    return this.data[this.offset++];
  }

  short(littleEndian = this.littleEdian) {
    const data = this.read(2);
    return new DataView(data.buffer).getInt16(0, littleEndian);
  }

  ushort(littleEndian = this.littleEdian) {
    const data = this.read(2);
    return new DataView(data.buffer).getUint16(0, littleEndian);
  }

  int(littleEndian = this.littleEdian) {
    const data = this.read(4);
    return new DataView(data.buffer).getInt32(0, littleEndian);
  }

  uint(littleEndian = this.littleEdian) {
    const data = this.read(4);
    return new DataView(data.buffer).getUint32(0, littleEndian);
  }

  long(littleEndian = this.littleEdian) {
    const data = this.read(8);
    return Number(new DataView(data.buffer).getBigInt64(0, littleEndian));
  }

  ulong(littleEndian = this.littleEdian) {
    const data = this.read(8);
    return Number(new DataView(data.buffer).getBigUint64(0, littleEndian));
  }

  float(littleEndian = this.littleEdian) {
    const data = this.read(4);
    return new DataView(data.buffer).getFloat32(0, littleEndian);
  }

  double(littleEndian = this.littleEdian) {
    const data = this.read(8);
    return new DataView(data.buffer).getFloat64(0, littleEndian);
  }

  png() {
    console.log(`${this._tag}: png start`);
    const startOffset = this.offset;
    const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    if (!cmp(signature, this.read(signature.length)))
      throw new Error("Invalid PNG signature");

    this.seek(25); // ihdr

    // IDAT chunk
    for (let size = this.int(false); size > 0; size = this.int(false)) {
      const idatType = String.fromCharCode(...this.read(4));
      if (idatType !== "IDAT") throw new Error("Invalid PNG IDAT chunk");

      this.seek(size + 4); // data + crc
    }
    const iend = String.fromCharCode(...this.read(4));
    if (iend !== "IEND") throw new Error("Invalid PNG IDAT chunk");
    this.seek(4); // crc

    const length = this.offset - startOffset;
    this.setOffset(startOffset);
    return this.read(length, "png end");
  }
}

export type BytesStructSchema = Array<
  | boolean
  | number
  | string
  | StringTuple
  | NumberTuple
  | Uint8Array
  | undefined
  | null
>;

type StringTuple = [
  "string",
  string,
  Pick<BundleOptions, "withLength" | "lengthType">?
];

type NumberTuple = [
  (
    | "byte"
    | "short"
    | "ushort"
    | "int"
    | "uint"
    | "long"
    | "ulong"
    | "float"
    | "double"
  ),
  number,
  Pick<BundleOptions, "littleEndian">?
];

export interface BundleOptions {
  /**
   * @default true
   */
  withLength?: boolean;
  /**
   * @default GlobalLengthType.value
   */
  lengthType?: LengthType;
  /**
   * @default true
   */
  littleEndian?: boolean;
}

export function bundleBytesStruct(schema: BytesStructSchema, _tag = "") {
  schema = schema.filter((s) => s !== undefined && s !== null);
  _tag && (_tag = `bundle: ${_tag}`);
  let bundleLength = 0;

  const bundleStringWithLength = (value: string, lengthType: LengthType) => {
    const b = writer.text(value);
    switch (lengthType) {
      case LengthType.Byte:
        return [writer.byte(b.length), b];
      case LengthType.Uint16:
        return [writer.short(b.length), b];
      case LengthType.Uint32:
        return [writer.int(b.length), b];
    }
  };

  const bytes = schema
    .map((v): Uint8Array | Uint8Array[] => {
      if (typeof v === "boolean") {
        return writer.byte(v ? 1 : 0);
      }
      if (typeof v === "string") {
        bundleStringWithLength(v, GlobalLengthType.value);
      }
      if (typeof v === "number") {
        return writer.int(v);
      }
      if (v instanceof Uint8Array) {
        return v;
      } else if (Array.isArray(v) && typeof v[0] === "string") {
        // @ts-ignore
        const [type, value, options, _value_tag = ""] = v;

        switch (type) {
          case "byte":
          case "short":
          case "ushort":
          case "int":
          case "uint":
          case "long":
          case "ulong":
          case "float":
          case "double":
          case "int":
            return writer[type](value, options?.littleEndian);

          case "string": {
            if (options?.withLength === false) return writer.text(value);

            const lengthType = options?.lengthType ?? GlobalLengthType.value;
            return bundleStringWithLength(value, lengthType);
          }
        }
      }
      return [];
    })
    .flat();

  bundleLength = bytes.reduce((pre, v) => pre + v.length, 0);
  _tag && console.log(`${_tag}: total length: ${bundleLength}`);
  const r = new Uint8Array(bundleLength);

  let offset = 0;
  bytes.forEach((v) => {
    r.set(v, offset);
    offset += v.length;
  });

  return r;
}
