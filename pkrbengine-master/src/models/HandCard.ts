import * as Sequelize from 'sequelize';
import { DataTypes, Optional } from 'sequelize';
import { Column, PrimaryKey, Table, Model } from 'sequelize-typescript';
import type { Card, CardId } from './Card';
import type { Hand, HandId } from './Hand';

export interface HandCardAttributes {
  hand_card_id: string;
  card_id: string;
  is_used: boolean;
  used_at: Date;
  card_position: number;
  hand_id: string;
}

export type HandCardPk = 'hand_card_id';
export type HandCardId = HandCard[HandCardPk];
export type HandCardOptionalAttributes = 'is_used';
export type HandCardCreationAttributes = Optional<
  HandCardAttributes,
  HandCardOptionalAttributes
>;

@Table({
  tableName: 'hand_card',
})
export class HandCard
  extends Model<HandCardAttributes, HandCardCreationAttributes>
  implements HandCardAttributes
{
  @PrimaryKey
  @Column
  hand_card_id!: string;
  @Column
  card_id!: string;
  @Column
  is_used!: boolean;
  @Column
  used_at!: Date;
  @Column
  card_position!: number;
  @Column
  hand_id!: string;

  // HandCard belongsTo Card via card_id
  card!: Card;
  getCard!: Sequelize.BelongsToGetAssociationMixin<Card>;
  setCard!: Sequelize.BelongsToSetAssociationMixin<Card, CardId>;
  createCard!: Sequelize.BelongsToCreateAssociationMixin<Card>;
  // HandCard belongsTo Hand via hand_id
  hand!: Hand;
  getHand!: Sequelize.BelongsToGetAssociationMixin<Hand>;
  setHand!: Sequelize.BelongsToSetAssociationMixin<Hand, HandId>;
  createHand!: Sequelize.BelongsToCreateAssociationMixin<Hand>;

  static initModel(sequelize: Sequelize.Sequelize): typeof HandCard {
    return HandCard.init(
      {
        hand_card_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        card_id: {
          type: DataTypes.UUIDV4,
          allowNull: false,
          references: {
            model: 'card',
            key: 'card_id',
          },
        },
        is_used: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: 0,
        },
        used_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        card_position: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        hand_id: {
          type: DataTypes.UUIDV4,
          allowNull: false,
          references: {
            model: 'hand',
            key: 'hand_id',
          },
        },
      },
      {
        sequelize,
        tableName: 'hand_card',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'hand_card_id' }],
          },
          {
            name: 'fk_Game_has_Card_Card2_idx',
            using: 'BTREE',
            fields: [{ name: 'card_id' }],
          },
          {
            name: 'fk_Game_card_Game_hand1_idx',
            using: 'BTREE',
            fields: [{ name: 'hand_id' }],
          },
        ],
      },
    );
  }
}
