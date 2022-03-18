import * as Sequelize from 'sequelize';
import { DataTypes, Optional } from 'sequelize';
import { Column, PrimaryKey, Table, Model } from 'sequelize-typescript';
import type { GamePlayer, GamePlayerId } from './GamePlayer';
import type { HandCard, HandCardId } from './HandCard';

export interface PlayerHoleAttributes {
  player_hole_id: string;
  game_player_id: string;
  hand_card_id: string;
  distributed_at: Date;
}

export type PlayerHolePk = 'player_hole_id';
export type PlayerHoleId = PlayerHole[PlayerHolePk];
export type PlayerHoleCreationAttributes = PlayerHoleAttributes;

@Table({
  tableName: 'player_hole',
})
export class PlayerHole
  extends Model<PlayerHoleAttributes, PlayerHoleCreationAttributes>
  implements PlayerHoleAttributes
{
  @PrimaryKey
  @Column
  player_hole_id!: string;
  @Column
  game_player_id!: string;
  @Column
  hand_card_id!: string;
  @Column
  distributed_at!: Date;

  // PlayerHole belongsTo GamePlayer via game_player_id
  game_player!: GamePlayer;
  getGame_player!: Sequelize.BelongsToGetAssociationMixin<GamePlayer>;
  setGame_player!: Sequelize.BelongsToSetAssociationMixin<
    GamePlayer,
    GamePlayerId
  >;
  createGame_player!: Sequelize.BelongsToCreateAssociationMixin<GamePlayer>;
  // PlayerHole belongsTo HandCard via hand_card_id
  game_hand_card!: HandCard;
  getGame_hand_card!: Sequelize.BelongsToGetAssociationMixin<HandCard>;
  setGame_hand_card!: Sequelize.BelongsToSetAssociationMixin<
    HandCard,
    HandCardId
  >;
  createGame_hand_card!: Sequelize.BelongsToCreateAssociationMixin<HandCard>;

  static initModel(sequelize: Sequelize.Sequelize): typeof PlayerHole {
    return PlayerHole.init(
      {
        player_hole_id: {
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
        hand_card_id: {
          type: DataTypes.UUIDV4,
          allowNull: false,
          references: {
            model: 'hand_card',
            key: 'hand_card_id',
          },
        },
        distributed_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'player_hole',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'player_hole_id' }],
          },
          {
            name: 'fk_GamePlayer_has_Card_GamePlayer1_idx',
            using: 'BTREE',
            fields: [{ name: 'game_player_id' }],
          },
          {
            name: 'fk_PlayerHole_HandCards1_idx',
            using: 'BTREE',
            fields: [{ name: 'hand_card_id' }],
          },
        ],
      },
    );
  }
}
