import { v4 as uuid } from 'uuid';
import { Injectable } from '@nestjs/common';
import { CreateHandWinnerDto } from 'src/models/create-dto';
import { InjectModel } from '@nestjs/sequelize';
import { HandWinner } from 'src/models/HandWinner';
import { Transaction } from 'sequelize/types';

@Injectable()
export class HandWinnerService {
  constructor(
    @InjectModel(HandWinner)
    private handWinnerModel: typeof HandWinner,
  ) {}

  async create(handWinner: CreateHandWinnerDto, transaction?: Transaction) {
    return this.handWinnerModel.create(
      {
        ...handWinner,
        hand_winner_id: uuid(),
      },
      {
        fields: ['hand_id', 'game_player_id', 'hand_winner_id'],
        transaction,
      },
    );
  }
}
