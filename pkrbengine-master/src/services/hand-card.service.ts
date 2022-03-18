import { v4 as uuid } from 'uuid';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HandCard } from 'src/models/HandCard';
import { CreateHandCardDto } from 'src/models/create-dto';
import { Transaction } from 'sequelize';

@Injectable()
export class HandCardService {
  constructor(
    @InjectModel(HandCard)
    private handCardModel: typeof HandCard,
  ) {}

  async findAll(hand_id: string, transaction?: Transaction) {
    return this.handCardModel.findAll({
      where: { hand_id },
      order: [['card_position', 'ASC']],
      transaction,
    });
  }

  async findFreeCards(hand_id: string, transaction?: Transaction) {
    return this.handCardModel.findAll({
      where: { hand_id, is_used: false },
      order: [['card_position', 'ASC']],
      transaction,
    });
  }

  async bulkCreate(
    handCards: CreateHandCardDto[],
    transaction?: Transaction,
  ): Promise<HandCard[]> {
    return this.handCardModel.bulkCreate(
      [
        ...handCards.map((handCard) => ({
          ...handCard,
          is_used: false,
          hand_card_id: uuid(),
        })),
      ],
      {
        fields: [
          'card_id',
          'is_used',
          'hand_id',
          'hand_card_id',
          'card_position',
          'card_position',
        ],
        transaction,
      },
    );
  }
  async update(hand_card_id: string, data: {}, transaction?: Transaction) {
    return this.handCardModel.update(data, {
      where: { hand_card_id },
      transaction,
    });
  }
}
