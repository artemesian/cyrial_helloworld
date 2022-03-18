import { v4 as uuid } from 'uuid';
import { InjectModel } from '@nestjs/sequelize';
import { HandDetail } from 'src/models/HandDetail';
import { CreateHandDetailDto } from 'src/models/create-dto';
import { Transaction } from 'sequelize/types';

export class HandDetailService {
  constructor(
    @InjectModel(HandDetail)
    private handDetailModel: typeof HandDetail,
  ) {}

  async create(
    handDetail: CreateHandDetailDto,
    transaction?: Transaction,
  ) {
    return this.handDetailModel.create(
      { ...handDetail, hand_detail_id: uuid() },
      {
        fields: [
          'hand_id',
          'game_double',
          'active_player',
          'hand_detail_id',
        ],
        transaction,
      },
    );
  }

  async findOne(hand_detail_id: string, transaction?: Transaction) {
    return this.handDetailModel.findOne({
      where: { hand_detail_id },
      transaction,
    });
  }
  
  async findByHand(hand_id: string, transaction?: Transaction) {
    return this.handDetailModel.findOne({
      where: { hand_id },
      transaction,
    });
  }

  async findHandDetails(
    query: { hand_id: string; game_double: string },
    transaction?: Transaction,
  ) {
    return this.handDetailModel.findAll({
      where: query,
      transaction,
    });
  }

  async update(
    hand_detail_id: string,
    data: {},
    transaction?: Transaction,
  ) {
    return this.handDetailModel.update(data, {
      where: { hand_detail_id },
      transaction,
    });
  }
}
