import * as Sequelize from 'sequelize';
import { DataTypes, Optional } from 'sequelize';
import { Column, PrimaryKey, Table, Model } from 'sequelize-typescript';
import type { Game, GameId } from './Game';
import type { HandAction, HandActionId } from './HandAction';
import type { HandCommunity, HandCommunityId } from './HandCommunity';
import type { HandDetail, HandDetailId } from './HandDetail';
import type { HandWinner, HandWinnerId } from './HandWinner';

export interface HandAttributes {
  hand_id: string;
  pot_value: number;
  hand_number: number;
  started_at: Date;
  ended_at: Date;
  status: 'pre-flop' | 'flop' | 'turn' | 'river' | 'show-down';
  game_id: string;
}

export type HandPk = 'hand_id';
export type HandId = Hand[HandPk];
export type HandOptionalAttributes = 'status';
export type HandCreationAttributes = Optional<
  HandAttributes,
  HandOptionalAttributes
>;

@Table({
  tableName: "hand"
})
export class Hand
  extends Model<HandAttributes, HandCreationAttributes>
  implements HandAttributes
{
  @PrimaryKey
  @Column
  hand_id!: string;
  @Column
  pot_value!: number;
  @Column
  hand_number!: number;
  @Column
  started_at!: Date;
  @Column
  ended_at!: Date;
  @Column
  status!: 'pre-flop' | 'flop' | 'turn' | 'river' | 'show-down';
  @Column
  game_id!: string;

  // Hand belongsTo Game via game_id
  game!: Game;
  getGame!: Sequelize.BelongsToGetAssociationMixin<Game>;
  setGame!: Sequelize.BelongsToSetAssociationMixin<Game, GameId>;
  createGame!: Sequelize.BelongsToCreateAssociationMixin<Game>;
  // Hand hasMany HandAction via hand_id
  hand_actions!: HandAction[];
  getHand_actions!: Sequelize.HasManyGetAssociationsMixin<HandAction>;
  setHand_actions!: Sequelize.HasManySetAssociationsMixin<
    HandAction,
    HandActionId
  >;
  addHand_action!: Sequelize.HasManyAddAssociationMixin<
    HandAction,
    HandActionId
  >;
  addHand_actions!: Sequelize.HasManyAddAssociationsMixin<
    HandAction,
    HandActionId
  >;
  createHand_action!: Sequelize.HasManyCreateAssociationMixin<HandAction>;
  removeHand_action!: Sequelize.HasManyRemoveAssociationMixin<
    HandAction,
    HandActionId
  >;
  removeHand_actions!: Sequelize.HasManyRemoveAssociationsMixin<
    HandAction,
    HandActionId
  >;
  hasHand_action!: Sequelize.HasManyHasAssociationMixin<
    HandAction,
    HandActionId
  >;
  hasHand_actions!: Sequelize.HasManyHasAssociationsMixin<
    HandAction,
    HandActionId
  >;
  countHand_actions!: Sequelize.HasManyCountAssociationsMixin;
  // Hand hasMany HandCommunity via hand_id
  hand_communities!: HandCommunity[];
  getHand_communities!: Sequelize.HasManyGetAssociationsMixin<HandCommunity>;
  setHand_communities!: Sequelize.HasManySetAssociationsMixin<
    HandCommunity,
    HandCommunityId
  >;
  addHand_community!: Sequelize.HasManyAddAssociationMixin<
    HandCommunity,
    HandCommunityId
  >;
  addHand_communities!: Sequelize.HasManyAddAssociationsMixin<
    HandCommunity,
    HandCommunityId
  >;
  createHand_community!: Sequelize.HasManyCreateAssociationMixin<HandCommunity>;
  removeHand_community!: Sequelize.HasManyRemoveAssociationMixin<
    HandCommunity,
    HandCommunityId
  >;
  removeHand_communities!: Sequelize.HasManyRemoveAssociationsMixin<
    HandCommunity,
    HandCommunityId
  >;
  hasHand_community!: Sequelize.HasManyHasAssociationMixin<
    HandCommunity,
    HandCommunityId
  >;
  hasHand_communities!: Sequelize.HasManyHasAssociationsMixin<
    HandCommunity,
    HandCommunityId
  >;
  countHand_communities!: Sequelize.HasManyCountAssociationsMixin;
  // Hand hasMany HandDetail via hand_id
  hand_details!: HandDetail[];
  getHand_details!: Sequelize.HasManyGetAssociationsMixin<HandDetail>;
  setHand_details!: Sequelize.HasManySetAssociationsMixin<
    HandDetail,
    HandDetailId
  >;
  addHand_detail!: Sequelize.HasManyAddAssociationMixin<
    HandDetail,
    HandDetailId
  >;
  addHand_details!: Sequelize.HasManyAddAssociationsMixin<
    HandDetail,
    HandDetailId
  >;
  createHand_detail!: Sequelize.HasManyCreateAssociationMixin<HandDetail>;
  removeHand_detail!: Sequelize.HasManyRemoveAssociationMixin<
    HandDetail,
    HandDetailId
  >;
  removeHand_details!: Sequelize.HasManyRemoveAssociationsMixin<
    HandDetail,
    HandDetailId
  >;
  hasHand_detail!: Sequelize.HasManyHasAssociationMixin<
    HandDetail,
    HandDetailId
  >;
  hasHand_details!: Sequelize.HasManyHasAssociationsMixin<
    HandDetail,
    HandDetailId
  >;
  countHand_details!: Sequelize.HasManyCountAssociationsMixin;
  // Hand hasMany HandWinner via hand_id
  hand_winners!: HandWinner[];
  getHand_winners!: Sequelize.HasManyGetAssociationsMixin<HandWinner>;
  setHand_winners!: Sequelize.HasManySetAssociationsMixin<
    HandWinner,
    HandWinnerId
  >;
  addHand_winner!: Sequelize.HasManyAddAssociationMixin<
    HandWinner,
    HandWinnerId
  >;
  addHand_winners!: Sequelize.HasManyAddAssociationsMixin<
    HandWinner,
    HandWinnerId
  >;
  createHand_winner!: Sequelize.HasManyCreateAssociationMixin<HandWinner>;
  removeHand_winner!: Sequelize.HasManyRemoveAssociationMixin<
    HandWinner,
    HandWinnerId
  >;
  removeHand_winners!: Sequelize.HasManyRemoveAssociationsMixin<
    HandWinner,
    HandWinnerId
  >;
  hasHand_winner!: Sequelize.HasManyHasAssociationMixin<
    HandWinner,
    HandWinnerId
  >;
  hasHand_winners!: Sequelize.HasManyHasAssociationsMixin<
    HandWinner,
    HandWinnerId
  >;
  countHand_winners!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Hand {
    return Hand.init(
      {
        hand_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        pot_value: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        hand_number: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        started_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        ended_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM(
            'pre-flop',
            'flop',
            'turn',
            'river',
            'show-down',
          ),
          allowNull: false,
          defaultValue: 'pre-flop',
          comment: '"pre-flop", "flop", "turn", "river", "show-down"',
        },
        game_id: {
          type: DataTypes.UUIDV4,
          allowNull: false,
          references: {
            model: 'game',
            key: 'game_id',
          },
        },
      },
      {
        sequelize,
        tableName: 'hand',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'hand_id' }],
          },
          {
            name: 'fk_Game_hand_Game1_idx',
            using: 'BTREE',
            fields: [{ name: 'game_id' }],
          },
        ],
      },
    );
  }
}
