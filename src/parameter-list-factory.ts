import { WithImmutability } from '@xstd/with-immutability';
import { type MappedListConstructor, type MappedListInit } from './mapped-list-constructor.js';
import { type MappedList, type MappedListTuple } from './mapped-list.js';

/* TYPES */

export interface MappedListFactoryOptions<GValue> {
  readonly validateKey?: MappedListValidateKey;
  readonly validateValue?: MappedListValidateValue<GValue>;
}

export interface MappedListValidateKey {
  (key: string): string;
}

export interface MappedListValidateValue<GValue> {
  (value: GValue): GValue;
}

/* FACTORY */

const passthrough: <GValue>(value: GValue) => GValue = <GValue>(value: GValue): GValue => value;

export function mappedListFactory<GValue>({
  validateKey = passthrough,
  validateValue = passthrough,
}: MappedListFactoryOptions<GValue> = {}): MappedListConstructor<GValue> {
  return class extends WithImmutability implements MappedList<GValue> {
    readonly #entries: MappedListTuple<GValue>[];

    constructor(init?: MappedListInit<GValue>) {
      super();

      this.#entries = [];

      if (init !== undefined) {
        if (Symbol.iterator in init) {
          for (const [name, value] of init) {
            this.append(name, value);
          }
        } else {
          for (const [name, value] of Object.entries(init)) {
            this.append(name, value);
          }
        }
      }
    }

    get size(): number {
      return this.#entries.length;
    }

    append(key: string, value: GValue): this {
      this.throwIfImmutable();

      this.#append(validateKey(key), validateValue(value));

      return this;
    }

    #append(key: string, value: GValue): void {
      this.#entries.push(Object.freeze([key, value]));
    }

    delete(key: string, value?: GValue): number {
      this.throwIfImmutable();

      return this.#delete(validateKey(key), value === undefined ? undefined : validateValue(value));
    }

    #delete(key: string, value?: GValue): number {
      let deleted: number = 0;

      for (let i: number = 0; i < this.#entries.length; i++) {
        const [_key, _value]: MappedListTuple<GValue> = this.#entries[i];

        if (_key === key && (value === undefined || _value === value)) {
          this.#entries.splice(i, 1);
          i--;
          deleted++;
        }
      }

      return deleted;
    }

    get(key: string): GValue {
      return this.#get(validateKey(key));
    }

    #get(key: string): GValue {
      const value: GValue | undefined = this.#getOptional(key);

      if (value === undefined) {
        throw new Error(`Missing: ${key}`);
      } else {
        return value;
      }
    }

    getAll(key: string): GValue[] {
      return this.#getAll(validateKey(key));
    }

    #getAll(key: string): GValue[] {
      const values: GValue[] = [];

      for (let i: number = 0; i < this.#entries.length; i++) {
        if (this.#entries[i][0] === key) {
          values.push(this.#entries[i][1]);
        }
      }

      return values;
    }

    getOptional(key: string): GValue | undefined {
      return this.#getOptional(validateKey(key));
    }

    #getOptional(key: string): GValue | undefined {
      for (let i: number = 0; i < this.#entries.length; i++) {
        if (this.#entries[i][0] === key) {
          return this.#entries[i][1];
        }
      }

      return undefined;
    }

    has(key: string, value?: GValue): boolean {
      return this.#has(validateKey(key), value === undefined ? undefined : validateValue(value));
    }

    #has(key: string, value?: GValue): boolean {
      for (let i: number = 0; i < this.#entries.length; i++) {
        const [_key, _value]: MappedListTuple<GValue> = this.#entries[i];

        if (_key === key && (value === undefined || _value === value)) {
          return true;
        }
      }

      return false;
    }

    set(key: string, value: GValue): this {
      this.throwIfImmutable();

      this.#set(validateKey(key), validateValue(value));

      return this;
    }

    #set(key: string, value: GValue): void {
      this.#delete(key);
      this.#append(key, value);
    }

    clear(): void {
      this.throwIfImmutable();

      this.#entries.length = 0;
    }

    sort(): this {
      this.throwIfImmutable();

      this.#entries.sort(
        ([keyA]: MappedListTuple<GValue>, [keyB]: MappedListTuple<GValue>): number => {
          if (keyA < keyB) {
            return -1;
          } else if (keyA > keyB) {
            return 1;
          } else {
            return 0;
          }
        },
      );

      return this;
    }

    *keys(): Generator<string> {
      for (let i: number = 0; i < this.#entries.length; i++) {
        yield this.#entries[i][0];
      }
    }

    *values(): Generator<GValue> {
      for (let i: number = 0; i < this.#entries.length; i++) {
        yield this.#entries[i][1];
      }
    }

    *entries(): Generator<MappedListTuple<GValue>> {
      for (let i: number = 0; i < this.#entries.length; i++) {
        yield this.#entries[i];
      }
    }

    [Symbol.iterator](): IterableIterator<MappedListTuple<GValue>> {
      return this.entries();
    }

    forEach(callback: (value: GValue, key: string) => void): void {
      for (let i: number = 0; i < this.#entries.length; i++) {
        callback(this.#entries[i][1], this.#entries[i][0]);
      }
    }
  };
}
