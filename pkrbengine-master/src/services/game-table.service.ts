import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize/types';
import { GameTable } from 'src/models/GameTable';

@Injectable()
export class GameTableService {
  constructor(
    @InjectModel(GameTable)
    private gameTable: typeof GameTable,
  ) {}

  async findAll(transaction?: Transaction) {
    return this.gameTable.findAll({
      where: { is_blocked: false },
      transaction,
    });
  }

  async findOne(game_table_id: string, transaction?: Transaction) {
    return this.gameTable.findOne({
      where: { game_table_id },
      transaction,
    });
  }

  async update(game_table_id: string, data: {}, transaction?: Transaction) {
    return this.gameTable.update(data, {
      where: { game_table_id },
      transaction,
    });
  }
}
