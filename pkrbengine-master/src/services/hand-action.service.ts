import { Op, Transaction } from 'sequelize';
import { v4 as uuid } from 'uuid';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreeateHandActionDto } from 'src/models/create-dto';
import { HandAction } from 'src/models/HandAction';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class HandActionService {
  constructor(
    @InjectModel(HandAction)
    private handActionModel: typeof HandAction,
  ) {}

  async create(handAction: CreeateHandActionDto, transaction?: Transaction) {
    return this.handActionModel.create(
      {
        ...handAction,
        played_at: new Date(),
        hand_action_id: uuid(),
      },
      {
        fields: [
          'action',
          'amount_placed',
          'hand_action_id',
          'hand_id',
          'game_player_id',
          'hand_status',
          'played_at',
        ],
        transaction,
      },
    );
  }

  async findLastAction(hand_id: string, transaction?: Transaction) {
    return this.handActionModel.findOne({
      attributes: ['amount_placed', 'hand_action_id'],
      order: [['played_at', 'DESC']],
      transaction,
      where: {
        hand_id,
        action: ['bet', 'call', 'raise', 'all_in'],
      },
    });
  }

  async findOne(
    query: { hand_id: string; game_player_id: string },
    transaction?: Transaction,
  ) {
    return this.handActionModel.findOne({
      attributes: ['hand_action_id'],
      order: [['played_at', 'DESC']],
      transaction,
      where: {
        ...query,
      },
    });
  }
  
  async findAction(
    query: { hand_id: string; game_player_id: string, action: string },
    transaction?: Transaction,
  ) {
    return this.handActionModel.findOne({
      attributes: ['hand_action_id'],
      transaction,
      where: {
        ...query,
      },
    });
  }

  async findHandsActions(hands: string[]) {
    return this.handActionModel.findAll({
      where: { hand_id: hands },
    });
  }

  async sumPlacedAmount(hand_id: string, transaction?: Transaction) {
    return this.handActionModel.sum('amount_placed', {
      where: { hand_id },
      transaction,
    });
  }
}
