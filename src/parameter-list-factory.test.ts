import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mappedListFactory } from './parameter-list-factory.js';

describe('mappedListFactory', () => {
  describe('factory', () => {
    it('should support no options (use defaults)', () => {
      const instance = new (mappedListFactory<string>())();
      expect(instance).toBeDefined();
      expect(instance.set('a', 'b').get('a')).toBe('b');
    });
  });

  describe('class', () => {
    class TestClass extends mappedListFactory<string>({
      validateKey: (key: string): string => {
        if (key === '@invalid') {
          throw new Error('Invalid key');
        }
        return key.toLowerCase();
      },
      validateValue: (value: string): string => {
        if (value === '@invalid') {
          throw new Error('Invalid value');
        }
        return value;
      },
    }) {
      override toString(): string {
        let output: string = '';

        for (const [key, value] of this.entries()) {
          output += `; ${key}=${value}`;
        }

        return output;
      }
    }

    describe('new(...)', () => {
      describe('with nothing as input', () => {
        it('works with undefined as input', () => {
          expect(new TestClass().toString()).toBe('');
        });
      });

      describe('with an iterable as input', () => {
        it('works with a Map as input', () => {
          expect(
            new TestClass(
              new Map([
                ['a', 'b'],
                ['c', 'd'],
              ]),
            ).toString(),
          ).toBe('; a=b; c=d');
        });
      });

      describe('with an object as input', () => {
        it('works with a key/value object as input', () => {
          expect(
            new TestClass({
              a: 'b',
              c: 'd',
            }).toString(),
          ).toBe('; a=b; c=d');
        });
      });

      describe('with invalid data', () => {
        it('throws with an invalid input', () => {
          expect(() => new TestClass(null as any)).toThrow();
        });

        it('throws with an invalid key/value object', () => {
          // invalid key
          expect(
            () =>
              new TestClass({
                '@invalid': 'b',
              }),
          ).toThrow();

          // invalid value
          expect(
            () =>
              new TestClass({
                a: '@invalid',
              }),
          ).toThrow();
        });
      });
    });

    describe('properties', () => {
      describe('.size', () => {
        it('should have correct size', () => {
          expect(new TestClass().size).toBe(0);
          expect(new TestClass([['a', 'b']]).size).toBe(1);
          expect(
            new TestClass([
              ['a', 'b'],
              ['c', 'd'],
            ]).size,
          ).toBe(2);
        });
      });
    });

    describe('methods', () => {
      describe('.append(...)', () => {
        let instance: TestClass;

        beforeEach(() => {
          instance = new TestClass();
        });

        it('should be able to append new parameters', () => {
          instance.append('a', 'b');
          expect(instance.toString()).toBe('; a=b');
          instance.append('a', 'c');
          expect(instance.toString()).toBe('; a=b; a=c');
        });

        it('should throw if key is invalid', () => {
          expect(() => instance.append('@invalid', 'b')).toThrow();
        });

        it('should throw if value is invalid', () => {
          expect(() => instance.append('a', '@invalid')).toThrow();
        });
      });

      describe('.delete(...)', () => {
        let instance: TestClass;

        beforeEach(() => {
          instance = new TestClass([
            ['a', 'b'],
            ['a', 'c'],
            ['e', 'f'],
          ]);
        });

        it('should be able to delete a parameter from its key', () => {
          expect(instance.delete('a')).toBe(2);
          expect(instance.toString()).toBe('; e=f');
        });

        it('should be able to delete a parameter from its key and value', () => {
          expect(instance.delete('a', 'c')).toBe(1);
          expect(instance.toString()).toBe('; a=b; e=f');
        });

        it('should throw if key is invalid', () => {
          expect(() => instance.delete('@invalid')).toThrow();
        });

        it('should throw if value is invalid', () => {
          expect(() => instance.delete('a', '@invalid')).toThrow();
        });
      });

      describe('.get(...)', () => {
        let instance: TestClass;

        beforeEach(() => {
          instance = new TestClass([
            ['a', 'b'],
            ['a', 'c'],
            ['e', 'f'],
          ]);
        });

        it('should be able to get the first a parameter from a key', () => {
          expect(instance.get('a')).toBe('b');
        });

        it('should throw if the parameter does not exist', () => {
          expect(() => instance.get('z')).toThrow();
        });

        it('should throw if key is invalid', () => {
          expect(() => instance.get('@invalid')).toThrow();
        });
      });

      describe('.getAll(...)', () => {
        let instance: TestClass;

        beforeEach(() => {
          instance = new TestClass([
            ['a', 'b'],
            ['a', 'c'],
            ['e', 'f'],
          ]);
        });

        it('should be able to get the all the parameters from a key', () => {
          expect(instance.getAll('a')).toEqual(['b', 'c']);
          expect(instance.getAll('e')).toEqual(['f']);
        });

        it('should return an empty array if the parameter does not exist', () => {
          expect(instance.getAll('z')).toEqual([]);
        });

        it('should throw if key is invalid', () => {
          expect(() => instance.getAll('@invalid')).toThrow();
        });
      });

      describe('.getOptional(...)', () => {
        let instance: TestClass;

        beforeEach(() => {
          instance = new TestClass([
            ['a', 'b'],
            ['a', 'c'],
            ['e', 'f'],
          ]);
        });

        it('should be able to get the first a parameter from a key', () => {
          expect(instance.getOptional('a')).toBe('b');
        });

        it('should return undefined if the parameter does not exist', () => {
          expect(instance.getOptional('z')).toBe(undefined);
        });

        it('should throw if key is invalid', () => {
          expect(() => instance.getOptional('@invalid')).toThrow();
        });
      });

      describe('.has(...)', () => {
        let instance: TestClass;

        beforeEach(() => {
          instance = new TestClass([
            ['a', 'b'],
            ['a', 'c'],
            ['e', 'f'],
          ]);
        });

        it('should have an existing parameter', () => {
          expect(instance.has('a')).toBe(true);
          expect(instance.has('e')).toBe(true);
        });

        it('should have an existing parameter with key and value', () => {
          expect(instance.has('a', 'b')).toBe(true);
          expect(instance.has('a', 'c')).toBe(true);
          expect(instance.has('e', 'f')).toBe(true);
        });

        it('should not have an inexisting parameter', () => {
          expect(instance.has('z')).toBe(false);
        });

        it('should not have a parameter with an inexisting value', () => {
          expect(instance.has('a', 'z')).toBe(false);
        });

        it('should throw if key is invalid', () => {
          expect(() => instance.has('@invalid')).toThrow();
        });
      });

      describe('.set(...)', () => {
        let instance: TestClass;

        beforeEach(() => {
          instance = new TestClass();
        });

        it('should be able to set new parameters', () => {
          instance.set('a', 'b');
          expect(instance.toString()).toBe('; a=b');
          instance.set('a', 'c');
          expect(instance.toString()).toBe('; a=c');
        });

        it('should throw if key is invalid', () => {
          expect(() => instance.set('@invalid', 'b')).toThrow();
        });

        it('should throw if value is invalid', () => {
          expect(() => instance.set('a', '@invalid')).toThrow();
        });
      });

      describe('.clear(...)', () => {
        it('should remove all parameters', () => {
          const instance = new TestClass([
            ['a', 'a1'],
            ['a', 'a2'],
          ]);
          expect(instance.toString()).toBe('; a=a1; a=a2');
          instance.clear();
          expect(instance.toString()).toBe('');
        });
      });

      describe('.sort(...)', () => {
        it('should be able to sort parameters', () => {
          {
            const instance = new TestClass([
              ['a', 'a1'],
              ['a', 'a2'],
            ]);
            instance.sort();
            expect(instance.toString()).toBe('; a=a1; a=a2');
          }

          {
            const instance = new TestClass([
              ['a', 'a1'],
              ['b', 'b1'],
            ]);
            instance.sort();
            expect(instance.toString()).toBe('; a=a1; b=b1');
          }

          {
            const instance = new TestClass([
              ['b', 'b1'],
              ['a', 'a1'],
            ]);
            instance.sort();
            expect(instance.toString()).toBe('; a=a1; b=b1');
          }
        });
      });

      describe('.keys(...)', () => {
        it('should return parameter keys', () => {
          expect(Array.from(new TestClass().keys())).toEqual([]);
          expect(
            Array.from(
              new TestClass([
                ['a', 'a1'],
                ['a', 'a2'],
                ['b', 'b1'],
              ]).keys(),
            ),
          ).toEqual(['a', 'a', 'b']);
        });
      });

      describe('.values(...)', () => {
        it('should return parameter values', () => {
          expect(Array.from(new TestClass().values())).toEqual([]);
          expect(
            Array.from(
              new TestClass([
                ['a', 'a1'],
                ['a', 'a2'],
                ['b', 'b1'],
              ]).values(),
            ),
          ).toEqual(['a1', 'a2', 'b1']);
        });
      });

      describe('.entries(...)', () => {
        it('should return parameter entries', () => {
          expect(Array.from(new TestClass().entries())).toEqual([]);
          expect(
            Array.from(
              new TestClass([
                ['a', 'a1'],
                ['a', 'a2'],
                ['b', 'b1'],
              ]).entries(),
            ),
          ).toEqual([
            ['a', 'a1'],
            ['a', 'a2'],
            ['b', 'b1'],
          ]);
        });
      });

      describe('[Symbol.iterator](...)', () => {
        it('should return parameter entries', () => {
          expect(
            Array.from(
              new TestClass([
                ['a', 'a1'],
                ['a', 'a2'],
                ['b', 'b1'],
              ])[Symbol.iterator](),
            ),
          ).toEqual([
            ['a', 'a1'],
            ['a', 'a2'],
            ['b', 'b1'],
          ]);
        });
      });

      describe('forEach(...)', () => {
        it('should iterate on entries', () => {
          const spy = vi.fn();
          const instance = new TestClass([
            ['a', 'a1'],
            ['a', 'a2'],
            ['b', 'b1'],
          ]);
          instance.forEach(spy);
          expect(spy).toHaveBeenCalledTimes(3);
          expect(spy).toHaveBeenNthCalledWith(1, 'a1', 'a');
          expect(spy).toHaveBeenNthCalledWith(2, 'a2', 'a');
          expect(spy).toHaveBeenNthCalledWith(3, 'b1', 'b');
        });
      });
    });

    describe('immutability', () => {
      it('should throw when updating an immutable MIMETypeParameters', () => {
        const instance = new TestClass([['a', 'b']]).makeImmutable();

        expect(instance.immutable).toBe(true);
        expect(() => instance.set('b', 'b1')).toThrow();
      });
    });
  });
});
