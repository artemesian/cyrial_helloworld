import { v4 as uuid } from 'uuid';
import { Injectable } from '@nestjs/common';
import { Hand } from 'src/models/Hand';
import { InjectModel } from '@nestjs/sequelize';
import { CreateHandDto } from 'src/models/create-dto';
import { Transaction } from 'sequelize/types';

@Injectable()
export class HandService {
  constructor(
    @InjectModel(Hand)
    private handModel: typeof Hand,
  ) {}

  async findLastest(game_id: string, transaction?: Transaction) {
    return this.handModel.findOne({
      order: [['started_at', 'DESC']],
      where: { game_id },
      transaction,
    });
  }

  async create(hand: CreateHandDto, transaction?: Transaction) {
    return this.handModel.create(
      {
        ...hand,
        status: 'pre-flop',
        hand_id: uuid(),
        started_at: new Date(),
      },
      {
        fields: [
          'hand_id',
          'game_id',
          'hand_number',
          'pot_value',
          'started_at',
        ],
        transaction,
      },
    );
  }

  async update(hand_id: string, data: {}, transaction?: Transaction) {
    return this.handModel.update(data, {
      where: { hand_id },
      transaction,
    });
  }
  async findOne(hand_id: string, transaction?: Transaction) {
    return this.handModel.findOne({
      where: { hand_id },
      transaction,
    });
  }

  async findGameHands(game_id: string, limit?: number, transaction?: Transaction) {
    return this.handModel.findAll({
      order: [['started_at', 'DESC']],
      where: { game_id },
      transaction,
      limit,
    });
  }

  async incrementPotValue(
    hand_id: string,
    amount_placed: number,
    transaction?: Transaction,
  ) {
    return this.handModel.increment(
      { pot_value: amount_placed },
      {
        where: { hand_id },
        transaction,
      },
    );
  }
}
