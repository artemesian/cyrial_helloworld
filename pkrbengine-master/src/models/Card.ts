import * as Sequelize from 'sequelize';
import { DataTypes } from 'sequelize';
import { Column, PrimaryKey, Table,  Model } from 'sequelize-typescript';
import type { CardSuit, CardSuitId } from './CardSuit';

export interface CardAttributes {
  card_id: string;
  card_value: string;
  card_suit_id: string;
}

export type CardPk = 'card_id';
export type CardId = Card[CardPk];
export type CardCreationAttributes = CardAttributes;

@Table({
  tableName: "card"
})
export class Card
  extends Model<CardAttributes, CardCreationAttributes>
  implements CardAttributes
{
  @PrimaryKey
  @Column
  card_id!: string;
  @Column
  card_value!: string;
  @Column
  card_suit_id!: string;

  // Card belongsTo CardSuit via card_suit_id
  card_suit!: CardSuit;
  getCard_suit!: Sequelize.BelongsToGetAssociationMixin<CardSuit>;
  setCard_suit!: Sequelize.BelongsToSetAssociationMixin<CardSuit, CardSuitId>;
  createCard_suit!: Sequelize.BelongsToCreateAssociationMixin<CardSuit>;

  static initModel(sequelize: Sequelize.Sequelize): typeof Card {
    return Card.init(
      {
        card_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        card_value: {
          type: DataTypes.STRING(2),
          allowNull: false,
        },
        card_suit_id: {
          type: DataTypes.UUIDV4,
          allowNull: false,
          references: {
            model: 'card_suit',
            key: 'card_suit_id',
          },
        },
      },
      {
        sequelize,
        tableName: 'card',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'card_id' }],
          },
          {
            name: 'fk_Card_CardCategory1_idx',
            using: 'BTREE',
            fields: [{ name: 'card_suit_id' }],
          },
        ],
      },
    );
  }
}
