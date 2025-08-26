/* TYPES */
import { type WithImmutability } from '@xstd/with-immutability';

export type MappedListTuple<GValue> = readonly [key: string, value: GValue];

/* CLASS */

/**
 * Represents an interface for managing a mapped list of key/value pairs.
 * This interface provides operations to manipulate, retrieve, and iterate over the entries in the list.
 *
 * @template GValue The type of the values stored in the mapped list.
 */
export interface MappedList<GValue> extends WithImmutability, Iterable<MappedListTuple<GValue>> {
  /**
   * Returns the number of entries present in this list.
   *
   * @returns {number} The number of entries.
   */
  readonly size: number;

  /**
   * Appends a specified key/value pair in this list.
   *
   * @param {string} key - The key to add to the list.
   * @param {GValue} value - The value associated with this key.
   * @return {this} The current instance for method chaining.
   */
  append(key: string, value: GValue): this;

  /**
   * Deletes the specified entry from this list.
   *
   * @param {string} key - The key identifying the entry to remove.
   * @param {GValue} [value] - Optional value to match for removal if multiple values exist for the key.
   * @return {number} The number of entries removed as a result of the operation.
   */
  delete(key: string, value?: GValue): number;

  /**
   * Returns the first value associated with the specified key.
   *
   * @param {string} key - The key identifying the entry to retrieve.
   * @return {GValue} The value associated with the given key.
   */
  get(key: string): GValue;

  /**
   * Retrieves all values associated with the specified key.
   *
   * @param {string} key - The key identifying the entries to retrieve.
   * @return {GValue[]} An array of values associated with the given key.
   */
  getAll(key: string): GValue[];

  /**
   * Retrieves the first and optional value associated with the given key.
   *
   * @param {string} key - The key identifying the entry to retrieve.
   * @return {GValue | undefined} The value associated with the given key if any, otherwise undefined.
   */
  getOptional(key: string): GValue | undefined;

  /**
   * Checks if a specified key exists in the list and optionally verifies if it is associated with a given value.
   *
   * @param {string} key - The key to check for existence in the list.
   * @param {GValue} [value] - Optional. The value to match against the key in the list.
   * @return {boolean} Returns true if the key exists and matches the value (if provided), otherwise false.
   */
  has(key: string, value?: GValue): boolean;

  /**
   * Sets a value associated with a specified key.
   * If there are several matching keys, this method deletes the others.
   * If the entry doesn't exist, this method creates it.
   *
   * @param {string} key - The key to set the value with.
   * @param {GValue} value - The value associated with this key.
   * @return {this} The current instance for method chaining.
   */
  set(key: string, value: GValue): this;

  /**
   * Removes all the entries from this list.
   */
  clear(): void;

  /**
   * Sorts all key/value pairs contained in this list in place.
   * The sort order is according to unicode code points of the keys.
   * This method uses a stable sorting algorithm (i.e. the relative order between key/value pairs with equal keys will be preserved).
   *
   * @return {this} The current instance for method chaining.
   */
  sort(): this;

  /**
   * Returns a `Generator` allowing iteration through all the keys contained in this list.
   *
   * @returns {Generator<string>}
   */
  keys(): Generator<string>;

  /**
   * Returns a `Generator` allowing iteration through all the values contained in this list.
   *
   * @returns {Generator<GValue>}
   */
  values(): Generator<GValue>;

  /**
   * Returns an `Generator` allowing iteration through all the key/value pairs contained in this list.
   * The iterator returns key/value pairs in the same order as they appear in the list.
   *
   * @returns {Generator<[key: string, value: string]>}
   */
  entries(): Generator<MappedListTuple<GValue>>;

  /**
   * Alias of `.entries()`.
   *
   * @see MappedList.entries
   */
  [Symbol.iterator](): IterableIterator<MappedListTuple<GValue>>;

  /**
   * Executes a provided callback function once for each entry in the list, in insertion order.
   *
   * @param {function} callback - A function that is called for each entry in the list. It receives two arguments:
   * the entry's value and key. The value is provided as the first parameter, and the key as the second.
   * @return {void} Does not return a value.
   */
  forEach(callback: (value: GValue, key: string) => void): void;
}
