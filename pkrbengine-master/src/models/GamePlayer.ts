import * as Sequelize from 'sequelize';
import { DataTypes, Optional } from 'sequelize';
import { Column, PrimaryKey, Model, Table } from 'sequelize-typescript';
import type { Game, GameId } from './Game';
import type { HandAction, HandActionId } from './HandAction';
import type { HandDetail, HandDetailId } from './HandDetail';
import type { HandWinner, HandWinnerId } from './HandWinner';
import type { Player, PlayerId } from './Player';
import type { PlayerHole, PlayerHoleId } from './PlayerHole';

export interface GamePlayerAttributes {
  game_player_id: string;
  player_position: number;
  player_id: string;
  pseudo: string;
  balance: number;
  sat_in_at: Date;
  left_game_at?: Date;
  is_in_active_hand: boolean;
  game_id: string;
}

export type GamePlayerPk = 'game_player_id';
export type GamePlayerId = GamePlayer[GamePlayerPk];
export type GamePlayerOptionalAttributes = 'balance' | 'left_game_at';
export type GamePlayerCreationAttributes = Optional<
  GamePlayerAttributes,
  GamePlayerOptionalAttributes
>;

@Table({
  tableName: "game_player"
})
export class GamePlayer
  extends Model<GamePlayerAttributes, GamePlayerCreationAttributes>
  implements GamePlayerAttributes
{
  @PrimaryKey
  @Column
  game_player_id!: string;
  @Column
  player_position!: number;
  @Column
  player_id!: string;
  @Column
  pseudo!: string;
  @Column
  balance!: number;
  @Column
  sat_in_at!: Date;
  @Column
  left_game_at?: Date;
  @Column
  is_in_active_hand!: boolean;
  @Column
  game_id!: string;

  // GamePlayer belongsTo Game via game_id
  game!: Game;
  getGame!: Sequelize.BelongsToGetAssociationMixin<Game>;
  setGame!: Sequelize.BelongsToSetAssociationMixin<Game, GameId>;
  createGame!: Sequelize.BelongsToCreateAssociationMixin<Game>;
  // GamePlayer hasMany HandAction via game_player_id
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
  // GamePlayer hasMany HandDetail via game_double
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
  // GamePlayer hasMany HandDetail via active_player
  active_player_hand_details!: HandDetail[];
  getActive_player_hand_details!: Sequelize.HasManyGetAssociationsMixin<HandDetail>;
  setActive_player_hand_details!: Sequelize.HasManySetAssociationsMixin<
    HandDetail,
    HandDetailId
  >;
  addActive_player_hand_detail!: Sequelize.HasManyAddAssociationMixin<
    HandDetail,
    HandDetailId
  >;
  addActive_player_hand_details!: Sequelize.HasManyAddAssociationsMixin<
    HandDetail,
    HandDetailId
  >;
  createActive_player_hand_detail!: Sequelize.HasManyCreateAssociationMixin<HandDetail>;
  removeActive_player_hand_detail!: Sequelize.HasManyRemoveAssociationMixin<
    HandDetail,
    HandDetailId
  >;
  removeActive_player_hand_details!: Sequelize.HasManyRemoveAssociationsMixin<
    HandDetail,
    HandDetailId
  >;
  hasActive_player_hand_detail!: Sequelize.HasManyHasAssociationMixin<
    HandDetail,
    HandDetailId
  >;
  hasActive_player_hand_details!: Sequelize.HasManyHasAssociationsMixin<
    HandDetail,
    HandDetailId
  >;
  countActive_player_hand_details!: Sequelize.HasManyCountAssociationsMixin;
  // GamePlayer hasMany HandWinner via game_player_id
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
  // GamePlayer hasMany PlayerHole via game_player_id
  player_holes!: PlayerHole[];
  getPlayer_holes!: Sequelize.HasManyGetAssociationsMixin<PlayerHole>;
  setPlayer_holes!: Sequelize.HasManySetAssociationsMixin<
    PlayerHole,
    PlayerHoleId
  >;
  addPlayer_hole!: Sequelize.HasManyAddAssociationMixin<
    PlayerHole,
    PlayerHoleId
  >;
  addPlayer_holes!: Sequelize.HasManyAddAssociationsMixin<
    PlayerHole,
    PlayerHoleId
  >;
  createPlayer_hole!: Sequelize.HasManyCreateAssociationMixin<PlayerHole>;
  removePlayer_hole!: Sequelize.HasManyRemoveAssociationMixin<
    PlayerHole,
    PlayerHoleId
  >;
  removePlayer_holes!: Sequelize.HasManyRemoveAssociationsMixin<
    PlayerHole,
    PlayerHoleId
  >;
  hasPlayer_hole!: Sequelize.HasManyHasAssociationMixin<
    PlayerHole,
    PlayerHoleId
  >;
  hasPlayer_holes!: Sequelize.HasManyHasAssociationsMixin<
    PlayerHole,
    PlayerHoleId
  >;
  countPlayer_holes!: Sequelize.HasManyCountAssociationsMixin;
  // GamePlayer belongsTo Player via player_id
  player!: Player;
  getPlayer!: Sequelize.BelongsToGetAssociationMixin<Player>;
  setPlayer!: Sequelize.BelongsToSetAssociationMixin<Player, PlayerId>;
  createPlayer!: Sequelize.BelongsToCreateAssociationMixin<Player>;

  static initModel(sequelize: Sequelize.Sequelize): typeof GamePlayer {
    return GamePlayer.init(
      {
        game_player_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        player_position: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        player_id: {
          type: DataTypes.UUIDV4,
          allowNull: false,
          references: {
            model: 'player',
            key: 'player_id',
          },
        },
        pseudo: {
          type: DataTypes.STRING(45),
          allowNull: false,
        },
        balance: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        sat_in_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        left_game_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        is_in_active_hand: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
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
        tableName: 'game_player',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'game_player_id' }],
          },
          {
            name: 'fk_GamePlayer_Player1_idx',
            using: 'BTREE',
            fields: [{ name: 'player_id' }],
          },
          {
            name: 'fk_GamePlayer_Game1_idx',
            using: 'BTREE',
            fields: [{ name: 'game_id' }],
          },
        ],
      },
    );
  }
}
