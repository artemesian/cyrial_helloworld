import * as Sequelize from 'sequelize';
import { DataTypes, Optional } from 'sequelize';
import { Column, PrimaryKey, Model, Table } from 'sequelize-typescript';
import type { GamePlayer, GamePlayerId } from './GamePlayer';
import type { Hand, HandId } from './Hand';

export interface HandActionAttributes {
  hand_action_id: string;
  game_player_id: string;
  amount_placed: number;
  action: 'fold' | 'check' | 'bet' | 'call' | 'raise' | 'all_in' | 'skip';
  hand_status: 'pre-flop' | 'flop' | 'turn' | 'river' | 'show-down';
  played_at: Date;
  hand_id: string;
}

export type HandActionPk = 'hand_action_id';
export type HandActionId = HandAction[HandActionPk];
export type HandActionCreationAttributes = HandActionAttributes;

@Table({
  tableName: 'hand_action',
})
export class HandAction
  extends Model<HandActionAttributes, HandActionCreationAttributes>
  implements HandActionAttributes
{
  @PrimaryKey
  @Column
  hand_action_id!: string;
  @Column
  game_player_id!: string;
  @Column
  amount_placed!: number;
  @Column
  action!: 'fold' | 'check' | 'bet' | 'call' | 'raise' | 'all_in' | 'skip';
  @Column
  hand_status!: 'pre-flop' | 'flop' | 'turn' | 'river' | 'show-down';
  @Column
  played_at!: Date;
  @Column
  hand_id!: string;

  // HandAction belongsTo GamePlayer via game_player_id
  game_player!: GamePlayer;
  getGame_player!: Sequelize.BelongsToGetAssociationMixin<GamePlayer>;
  setGame_player!: Sequelize.BelongsToSetAssociationMixin<
    GamePlayer,
    GamePlayerId
  >;
  createGame_player!: Sequelize.BelongsToCreateAssociationMixin<GamePlayer>;
  // HandAction belongsTo Hand via hand_id
  hand!: Hand;
  getHand!: Sequelize.BelongsToGetAssociationMixin<Hand>;
  setHand!: Sequelize.BelongsToSetAssociationMixin<Hand, HandId>;
  createHand!: Sequelize.BelongsToCreateAssociationMixin<Hand>;

  static initModel(sequelize: Sequelize.Sequelize): typeof HandAction {
    return HandAction.init(
      {
        hand_action_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        game_player_id: {
          type: DataTypes.STRING(36),
          allowNull: false,
          references: {
            model: 'game_player',
            key: 'game_player_id',
          },
        },
        amount_placed: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        action: {
          type: DataTypes.ENUM(
            'fold',
            'check',
            'bet',
            'call',
            'raise',
            'all_in',
            'skip'
          ),
          allowNull: false,
          comment: '"fold", "check", "bet", "call", "raise", "all_in", "skip"',
        },
        hand_status: {
          type: DataTypes.ENUM(
            'pre-flop',
            'flop',
            'turn',
            'river',
            'show-down',
          ),
          allowNull: false,
        },
        played_at: {
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
        tableName: 'hand_action',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'hand_action_id' }],
          },
          {
            name: 'fk_GamePlayer_has_Game_GamePlayer1_idx',
            using: 'BTREE',
            fields: [{ name: 'game_player_id' }],
          },
          {
            name: 'fk_Game_action_Game_hand1_idx',
            using: 'BTREE',
            fields: [{ name: 'hand_id' }],
          },
        ],
      },
    );
  }
}
