import { v4 as uuid } from 'uuid';
import { Card } from '../models/Card';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCardDto } from 'src/models/create-dto';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize/types';

@Injectable()
export class CardService {
  constructor(
    @InjectModel(Card)
    private cardModel: typeof Card,
  ) {}

  async create(card: CreateCardDto): Promise<void> {
    this.cardModel.create(
      {
        ...card,
        card_id: uuid(),
      },
      {
        fields: ['card_suit_id', 'card_id', 'card_value'],
      },
    );
  }

  async findAll(transaction?: Transaction): Promise<Card[]> {
    console.log('Model is not null');
    return this.cardModel.findAll({
      transaction,
    });
  }

  async shuffleFind(transaction?: Transaction): Promise<Card[]> {
    console.log('Model is not null');
    return this.cardModel.findAll({
      order: Sequelize.literal('rand()'),
      transaction,
    });
  }

  findOne(card_id: string, transaction?: Transaction): Promise<Card> {
    return Card.findOne({
      where: { card_id },
      transaction,
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }
}
