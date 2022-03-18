import { v4 as uuid } from 'uuid';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateHandCommunityDto } from 'src/models/create-dto';
import { HandCommunity } from 'src/models/HandCommunity';
import { Transaction } from 'sequelize/types';

@Injectable()
export class HandCommunityService {
  constructor(
    @InjectModel(HandCommunity)
    private handCommunityModel: typeof HandCommunity,
  ) {}

  async create(
    handCommunity: CreateHandCommunityDto,
    transaction?: Transaction,
  ) {
    return this.handCommunityModel.create(
      {
        ...handCommunity,
        added_at: new Date(),
        hand_community_id: uuid(),
      },
      {
        fields: ['hand_community_id', 'hand_card_id', 'hand_id', 'added_at'],
        transaction,
      },
    );
  }

  async bulkCreate(
    gameCommunities: CreateHandCommunityDto[],
    transaction?: Transaction,
  ) {
    return this.handCommunityModel.bulkCreate(
      [
        ...gameCommunities.map(({ hand_id, hand_card_id }) => ({
          hand_id,
          hand_card_id,
          added_at: new Date(),
          hand_community_id: uuid(),
        })),
      ],
      {
        fields: ['hand_community_id', 'hand_card_id', 'hand_id', 'added_at'],
        transaction,
      },
    );
  }

  async findAll(hand_id: string, transaction?: Transaction) {
    return this.handCommunityModel.findAll({
      order: [['added_at', 'DESC']],
      where: { hand_id },
      limit: 5,
      transaction,
    });
  }
}
