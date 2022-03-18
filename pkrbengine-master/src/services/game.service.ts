import { v4 as uuid } from 'uuid';
import { Game } from 'src/models/Game';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateGameDto } from 'src/models/create-dto';
import { Transaction } from 'sequelize/types';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game)
    private gameModel: typeof Game,
  ) {}

  async create(game: CreateGameDto, transaction?: Transaction) {
    return this.gameModel.create(
      {
        ...game,
        game_id: uuid(),
        number_of_hands: 0,
      },
      {
        fields: ['number_of_hands', 'game_table_id', 'game_id', 'type'],
        transaction,
      },
    );
  }

  async findOne(game_id: string, transaction?: Transaction) {
    return this.gameModel.findOne({
      where: { game_id },
      transaction,
    });
  }

  async findTableGame(game_table_id: string, transaction?: Transaction) {
    return this.gameModel.findOne({
      where: { game_table_id, ended_at: null },
      transaction,
    });
  }

  async findAll() {
    return this.gameModel.findAll();
  }

  async update(game_id: string, data: {}, transaction?: Transaction) {
    return this.gameModel.update(data, {
      where: { game_id },
      transaction,
    });
  }
}
