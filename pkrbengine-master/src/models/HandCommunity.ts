import * as Sequelize from 'sequelize';
import { DataTypes, Optional } from 'sequelize';
import { Column, PrimaryKey, Model, Table } from 'sequelize-typescript';
import type { Hand, HandId } from './Hand';
import type { HandCard, HandCardId } from './HandCard';

export interface HandCommunityAttributes {
  hand_community_id: string;
  hand_card_id: string;
  added_at: Date;
  hand_id: string;
}

export type HandCommunityPk = 'hand_community_id';
export type HandCommunityId = HandCommunity[HandCommunityPk];
export type HandCommunityCreationAttributes = HandCommunityAttributes;

@Table({
  tableName: 'hand_community',
})
export class HandCommunity
  extends Model<HandCommunityAttributes, HandCommunityCreationAttributes>
  implements HandCommunityAttributes
{
  @PrimaryKey
  @Column
  hand_community_id!: string;
  @Column
  hand_card_id!: string;
  @Column
  added_at!: Date;
  @Column
  hand_id!: string;

  // HandCommunity belongsTo Hand via hand_id
  hand!: Hand;
  getHand!: Sequelize.BelongsToGetAssociationMixin<Hand>;
  setHand!: Sequelize.BelongsToSetAssociationMixin<Hand, HandId>;
  createHand!: Sequelize.BelongsToCreateAssociationMixin<Hand>;
  // HandCommunity belongsTo HandCard via hand_card_id
  game_card!: HandCard;
  getGame_card!: Sequelize.BelongsToGetAssociationMixin<HandCard>;
  setGame_card!: Sequelize.BelongsToSetAssociationMixin<HandCard, HandCardId>;
  createGame_card!: Sequelize.BelongsToCreateAssociationMixin<HandCard>;

  static initModel(sequelize: Sequelize.Sequelize): typeof HandCommunity {
    return HandCommunity.init(
      {
        hand_community_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        hand_card_id: {
          type: DataTypes.STRING(36),
          allowNull: false,
          references: {
            model: 'hand_card',
            key: 'hand_card_id',
          },
        },
        added_at: {
          type: DataTypes.DATE,
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
        tableName: 'hand_community',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'hand_community_id' }],
          },
          {
            name: 'fk_HandCommunity_HandCards1_idx',
            using: 'BTREE',
            fields: [{ name: 'hand_card_id' }],
          },
          {
            name: 'fk_Game_community_Game_hand1_idx',
            using: 'BTREE',
            fields: [{ name: 'hand_id' }],
          },
        ],
      },
    );
  }
}
