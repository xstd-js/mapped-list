import { type MappedList, type MappedListTuple } from './mapped-list.js';

/* TYPES */

export type MappedListInit<GValue> = Iterable<MappedListTuple<GValue>> | Record<string, GValue>;

/* CONSTRUCTOR */

export interface MappedListConstructor<GValue> {
  new (init?: MappedListInit<GValue>): MappedList<GValue>;
}
