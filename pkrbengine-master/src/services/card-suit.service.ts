import uuid from 'uuid';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CardSuit } from 'src/models/CardSuit';
import { CreateCardSuitDto } from 'src/models/create-dto';
import { Transaction } from 'sequelize/types';

@Injectable()
export class CardSuitService {
  constructor(
    @InjectModel(CardSuit)
    private cardSuitModel: typeof CardSuit,
  ) {}

  async create(
    cardSuit: CreateCardSuitDto,
    transaction?: Transaction,
  ): Promise<void> {
    await this.cardSuitModel.create(
      {
        ...cardSuit,
        card_suit_id: uuid.v4(),
      },
      {
        fields: ['card_suit_id', 'suit_name', 'suit_value'],
        transaction,
      },
    );
  }

  async findAll(transaction?: Transaction) {
    return this.cardSuitModel.findAll({
      transaction,
    });
  }
}
