import * as Sequelize from 'sequelize';
import { DataTypes, Optional } from 'sequelize';
import { Column, PrimaryKey, Table, Model } from 'sequelize-typescript';
import type { GamePlayer, GamePlayerId } from './GamePlayer';
import type { Hand, HandId } from './Hand';

export interface HandWinnerAttributes {
  hand_winner_id: string;
  game_player_id: string;
  hand_id: string;
}

export type HandWinnerPk = 'hand_winner_id';
export type HandWinnerId = HandWinner[HandWinnerPk];
export type HandWinnerCreationAttributes = HandWinnerAttributes;

@Table({
  tableName: 'hand_winner',
})
export class HandWinner
  extends Model<HandWinnerAttributes, HandWinnerCreationAttributes>
  implements HandWinnerAttributes
{
  @PrimaryKey
  @Column
  hand_winner_id!: string;
  @Column
  game_player_id!: string;
  @Column
  hand_id!: string;

  // HandWinner belongsTo GamePlayer via game_player_id
  game_player!: GamePlayer;
  getGame_player!: Sequelize.BelongsToGetAssociationMixin<GamePlayer>;
  setGame_player!: Sequelize.BelongsToSetAssociationMixin<
    GamePlayer,
    GamePlayerId
  >;
  createGame_player!: Sequelize.BelongsToCreateAssociationMixin<GamePlayer>;
  // HandWinner belongsTo Hand via hand_id
  hand!: Hand;
  getHand!: Sequelize.BelongsToGetAssociationMixin<Hand>;
  setHand!: Sequelize.BelongsToSetAssociationMixin<Hand, HandId>;
  createHand!: Sequelize.BelongsToCreateAssociationMixin<Hand>;

  static initModel(sequelize: Sequelize.Sequelize): typeof HandWinner {
    return HandWinner.init(
      {
        hand_winner_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        game_player_id: {
          type: DataTypes.UUIDV4,
          allowNull: false,
          references: {
            model: 'game_player',
            key: 'game_player_id',
          },
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
        tableName: 'hand_winner',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'hand_winner_id' }],
          },
          {
            name: 'fk_HandWinner_GamePlayer1_idx',
            using: 'BTREE',
            fields: [{ name: 'game_player_id' }],
          },
          {
            name: 'fk_Game_winner_Game_hand1_idx',
            using: 'BTREE',
            fields: [{ name: 'hand_id' }],
          },
        ],
      },
    );
  }
}
