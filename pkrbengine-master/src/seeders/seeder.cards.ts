import { v4 as uuid } from 'uuid';
import { Sequelize } from 'sequelize-typescript';
import { QueryInterface } from 'sequelize/types';
import { Card } from 'src/models/Card';
import { CardSuit } from 'src/models/CardSuit';

export class CardSeeder {
  static async up() {
    const cardValues = [
      'A',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'J',
      'Q',
      'K',
    ];
    const suits = ['club', 'heart', 'spade', 'diamond'];
    for (let i = 0; i < suits.length; i++) {
      const card_suit_id = uuid();
      await CardSuit.create(
        {
          card_suit_id,
          suit_name:
            i === 0
              ? 'club'
              : i === 1
              ? 'heart'
              : i === 2
              ? 'spade'
              : 'diamond',
          suit_value: i === 0 ? 'C' : i === 1 ? 'H' : i === 2 ? 'S' : 'D',
        },
        {
          fields: ['card_suit_id', 'suit_name', 'suit_value'],
        },
      );
      for (let j = 0; j < cardValues.length; j++) {
        await Card.create(
          {
            card_id: uuid(),
            card_suit_id,
            card_value: cardValues[j],
          },
          {
            fields: ['card_suit_id', 'card_id', 'card_value'],
          },
        );
      }
    }
    console.log({ message: 'All cards seedered successfully' });
  }
}
