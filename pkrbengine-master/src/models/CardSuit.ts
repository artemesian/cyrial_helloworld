import * as Sequelize from 'sequelize';
import { DataTypes } from 'sequelize';
import { Column, PrimaryKey, Model, Table } from 'sequelize-typescript';
import type { Card, CardId } from './Card';

export interface CardSuitAttributes {
  card_suit_id: string;
  suit_name: 'club' | 'heart' | 'spade' | 'diamond';
  suit_value: 'C' | 'H' | 'S' | 'D';
}

export type CardSuitPk = 'card_suit_id';
export type CardSuitId = CardSuit[CardSuitPk];
export type CardSuitCreationAttributes = CardSuitAttributes;

@Table({
  tableName: "card_suit"
})
export class CardSuit
  extends Model<CardSuitAttributes, CardSuitCreationAttributes>
  implements CardSuitAttributes
{
  @PrimaryKey
  @Column
  card_suit_id!: string;
  @Column
  suit_name!: 'club' | 'heart' | 'spade' | 'diamond';
  @Column
  suit_value!: 'C' | 'H' | 'S' | 'D';

  // CardSuit hasMany Card via card_suit_id
  cards!: Card[];
  getCards!: Sequelize.HasManyGetAssociationsMixin<Card>;
  setCards!: Sequelize.HasManySetAssociationsMixin<Card, CardId>;
  addCard!: Sequelize.HasManyAddAssociationMixin<Card, CardId>;
  addCards!: Sequelize.HasManyAddAssociationsMixin<Card, CardId>;
  createCard!: Sequelize.HasManyCreateAssociationMixin<Card>;
  removeCard!: Sequelize.HasManyRemoveAssociationMixin<Card, CardId>;
  removeCards!: Sequelize.HasManyRemoveAssociationsMixin<Card, CardId>;
  hasCard!: Sequelize.HasManyHasAssociationMixin<Card, CardId>;
  hasCards!: Sequelize.HasManyHasAssociationsMixin<Card, CardId>;
  countCards!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof CardSuit {
    return CardSuit.init(
      {
        card_suit_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        suit_name: {
          type: DataTypes.ENUM('club', 'heart', 'spade', 'diamond'),
          allowNull: false,
        },
        suit_value: {
          type: DataTypes.ENUM('C', 'H', 'S', 'D'),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'card_suit',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'card_suit_id' }],
          },
        ],
      },
    );
  }
}
