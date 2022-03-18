import { v4 as uuid } from 'uuid';
import { Player } from 'src/models/Player';
import { GameTable } from 'src/models/GameTable';
import { uniqueNamesGenerator, names } from 'unique-names-generator';

export class TableSeeder {
  static async up() {
    try {
      let players = await Player.bulkCreate(
        [
          {
            player_id: uuid(),
            last_name: uniqueNamesGenerator({
              dictionaries: [names],
              length: 1,
            }),
            first_name: uniqueNamesGenerator({
              dictionaries: [names],
              length: 1,
            }),
            created_at: new Date(),
            gender: Math.random() * 10 > 5 ? 'M' : 'F',
          },
          {
            player_id: uuid(),
            last_name: uniqueNamesGenerator({
              dictionaries: [names],
              length: 1,
            }),
            first_name: uniqueNamesGenerator({
              dictionaries: [names],
              length: 1,
            }),
            created_at: new Date(),
            gender: Math.random() * 10 > 5 ? 'M' : 'F',
          },
          {
            player_id: uuid(),
            last_name: uniqueNamesGenerator({
              dictionaries: [names],
              length: 1,
            }),
            first_name: uniqueNamesGenerator({
              dictionaries: [names],
              length: 1,
            }),
            created_at: new Date(),
            gender: Math.random() * 10 > 5 ? 'M' : 'F',
          },
          {
            player_id: uuid(),
            last_name: uniqueNamesGenerator({
              dictionaries: [names],
              length: 1,
            }),
            first_name: uniqueNamesGenerator({
              dictionaries: [names],
              length: 1,
            }),
            created_at: new Date(),
            gender: Math.random() * 10 > 5 ? 'M' : 'F',
          },
          {
            player_id: uuid(),
            last_name: uniqueNamesGenerator({
              dictionaries: [names],
              length: 1,
            }),
            first_name: uniqueNamesGenerator({
              dictionaries: [names],
              length: 1,
            }),
            created_at: new Date(),
            gender: Math.random() * 10 > 5 ? 'M' : 'F',
          },
        ],
        {
          fields: [
            'player_id',
            'first_name',
            'last_name',
            'created_at',
            'gender',
          ],
        },
      );
      console.log({ message: 'Players where seeders successfully' });
      let f_index = Math.round((Math.random() * 10) % players.length);
      let s_index = Math.round((Math.random() * 10) % players.length);
      let t_index = Math.round((Math.random() * 10) % players.length);
      await GameTable.bulkCreate(
        [
          {
            game_table_id: uuid(),
            number_of_seats: 5,
            small_blind: 35000,
            big_blind: 70000,
            owned_by: players[f_index].player_id,
            is_blocked: false,
            mined_at: new Date(),
            table_name: 'Pkrb Table 1',
            // minimum_entry_amount: 70000 * 4,
            is_open: true,
          },
          {
            game_table_id: uuid(),
            number_of_seats: Math.random() * 9 + 1,
            small_blind: 350,
            big_blind: 700,
            owned_by: players[s_index].player_id,
            is_blocked: false,
            mined_at: new Date(),
            table_name: 'Pkrb Table 2',
            // minimum_entry_amount: 700 * 4,
            is_open: true,
          },
          {
            game_table_id: uuid(),
            number_of_seats: Math.random() * 9 + 1,
            small_blind: 3500,
            big_blind: 7000,
            owned_by: players[t_index].player_id,
            is_blocked: true,
            mined_at: new Date(),
            table_name: 'Pkrb Table 3',
            // minimum_entry_amount: 7000 * 4,
            is_open: true,
          },
        ],
        {
          fields: [
            'big_blind',
            'is_open',
            'mined_at',
            'owned_by',
            'is_blocked',
            'table_name',
            'small_blind',
            'game_table_id',
            'number_of_seats',
            // 'minimum_entry_amount',
          ],
        },
      );
      console.log({ message: 'Tables where seeders successfully' });
    } catch (error) {
      console.error(error.message);
    }
  }
}
