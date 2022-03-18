import { deserializeUnchecked } from 'borsh';
import { Buffer } from 'buffer';

// Flexible class that takes properties and imbues them
// to the object instance
class Assignable {
  [index: string]: any;

  constructor(properties: any) {
    Object.keys(properties).map((key) => {
      return (this[key] = properties[key]);
    });
  }
}

export class AccoundData extends Assignable {}

const avatarSchema = new Map([
  [
    AccoundData,
    {
      kind: 'struct',
      fields: [
        ['struct_id', 'u8'],
        ['date_created', 'u32'],
        ['unlockable_date', 'u32'],
        ['numeration', 'u32'],
        ['rarity', 'u8'],
        ['level', 'u8'],
        ['xp', 'u32'],
        ['rented_state', 'u8'],
        ['use_authority', ['u8', 32]],
        ['rent_bump', 'u32'],
      ],
    },
  ],
]);

/**
 * Fetch program account data
 * @param {Buffer} data - AccountInfo Datat
 * @return {any}} - Account data in Object format
 */
export function deserializeAccountData(data: Buffer): any {
  return deserializeUnchecked(avatarSchema, AccoundData, data as Buffer);
}
