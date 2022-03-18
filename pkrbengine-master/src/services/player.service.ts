import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transaction } from 'sequelize/types';
import { Player } from 'src/models/Player';

@Injectable()
export class PlayerService {
  constructor(
    @InjectModel(Player)
    private playerModel: typeof Player,
  ) {}

  async findOne(player_id: string, transaction?: Transaction) {
    return this.playerModel.findByPk(player_id, {
      transaction,
    });
  }

  async findAll(transaction?: Transaction) {
    return this.playerModel.findAll({
      transaction,
    });
  }
}
