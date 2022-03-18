import * as Sequelize from 'sequelize';
import { DataTypes, Optional } from 'sequelize';
import { Column, PrimaryKey, Table, Model } from 'sequelize-typescript';
import type { GamePlayer, GamePlayerId } from './GamePlayer';
import type { GameTable, GameTableId } from './GameTable';
import type { XpClaim, XpClaimId } from './XpClaim';

export interface PlayerAttributes {
  player_id: string;
  first_name: string;
  last_name: string;
  wallet_id?: string;
  created_at: Date;
  gender: 'F' | 'M';
}

export type PlayerPk = 'player_id';
export type PlayerId = Player[PlayerPk];
export type PlayerOptionalAttributes = 'wallet_id' | 'created_at';
export type PlayerCreationAttributes = Optional<
  PlayerAttributes,
  PlayerOptionalAttributes
>;

@Table({
  tableName: 'player',
})
export class Player
  extends Model<PlayerAttributes, PlayerCreationAttributes>
  implements PlayerAttributes
{
  @PrimaryKey
  @Column
  player_id!: string;
  @Column
  first_name!: string;
  @Column
  last_name!: string;
  @Column
  wallet_id?: string;
  @Column
  created_at!: Date;
  @Column
  gender!: 'F' | 'M';

  // Player hasMany GamePlayer via player_id
  game_players!: GamePlayer[];
  getGame_players!: Sequelize.HasManyGetAssociationsMixin<GamePlayer>;
  setGame_players!: Sequelize.HasManySetAssociationsMixin<
    GamePlayer,
    GamePlayerId
  >;
  addGame_player!: Sequelize.HasManyAddAssociationMixin<
    GamePlayer,
    GamePlayerId
  >;
  addGame_players!: Sequelize.HasManyAddAssociationsMixin<
    GamePlayer,
    GamePlayerId
  >;
  createGame_player!: Sequelize.HasManyCreateAssociationMixin<GamePlayer>;
  removeGame_player!: Sequelize.HasManyRemoveAssociationMixin<
    GamePlayer,
    GamePlayerId
  >;
  removeGame_players!: Sequelize.HasManyRemoveAssociationsMixin<
    GamePlayer,
    GamePlayerId
  >;
  hasGame_player!: Sequelize.HasManyHasAssociationMixin<
    GamePlayer,
    GamePlayerId
  >;
  hasGame_players!: Sequelize.HasManyHasAssociationsMixin<
    GamePlayer,
    GamePlayerId
  >;
  countGame_players!: Sequelize.HasManyCountAssociationsMixin;
  // Player hasMany GameTable via owned_by
  game_tables!: GameTable[];
  getGame_tables!: Sequelize.HasManyGetAssociationsMixin<GameTable>;
  setGame_tables!: Sequelize.HasManySetAssociationsMixin<
    GameTable,
    GameTableId
  >;
  addGame_table!: Sequelize.HasManyAddAssociationMixin<GameTable, GameTableId>;
  addGame_tables!: Sequelize.HasManyAddAssociationsMixin<
    GameTable,
    GameTableId
  >;
  createGame_table!: Sequelize.HasManyCreateAssociationMixin<GameTable>;
  removeGame_table!: Sequelize.HasManyRemoveAssociationMixin<
    GameTable,
    GameTableId
  >;
  removeGame_tables!: Sequelize.HasManyRemoveAssociationsMixin<
    GameTable,
    GameTableId
  >;
  hasGame_table!: Sequelize.HasManyHasAssociationMixin<GameTable, GameTableId>;
  hasGame_tables!: Sequelize.HasManyHasAssociationsMixin<
    GameTable,
    GameTableId
  >;
  countGame_tables!: Sequelize.HasManyCountAssociationsMixin;
  // Player hasMany XpClaim via player_id
  xp_claims!: XpClaim[];
  getXp_claims!: Sequelize.HasManyGetAssociationsMixin<XpClaim>;
  setXp_claims!: Sequelize.HasManySetAssociationsMixin<XpClaim, XpClaimId>;
  addXp_claim!: Sequelize.HasManyAddAssociationMixin<XpClaim, XpClaimId>;
  addXp_claims!: Sequelize.HasManyAddAssociationsMixin<XpClaim, XpClaimId>;
  createXp_claim!: Sequelize.HasManyCreateAssociationMixin<XpClaim>;
  removeXp_claim!: Sequelize.HasManyRemoveAssociationMixin<XpClaim, XpClaimId>;
  removeXp_claims!: Sequelize.HasManyRemoveAssociationsMixin<
    XpClaim,
    XpClaimId
  >;
  hasXp_claim!: Sequelize.HasManyHasAssociationMixin<XpClaim, XpClaimId>;
  hasXp_claims!: Sequelize.HasManyHasAssociationsMixin<XpClaim, XpClaimId>;
  countXp_claims!: Sequelize.HasManyCountAssociationsMixin;

  static initModel(sequelize: Sequelize.Sequelize): typeof Player {
    return Player.init(
      {
        player_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        first_name: {
          type: DataTypes.STRING(45),
          allowNull: false,
        },
        last_name: {
          type: DataTypes.STRING(45),
          allowNull: false,
        },
        wallet_id: {
          type: DataTypes.UUIDV4,
          allowNull: true,
        },
        gender: {
          type: DataTypes.ENUM('F', 'M'),
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        sequelize,
        tableName: 'player',
        timestamps: true,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'player_id' }],
          },
        ],
      },
    );
  }
}
