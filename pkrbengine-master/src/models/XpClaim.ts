import * as Sequelize from 'sequelize';
import { DataTypes, Optional } from 'sequelize';
import { Column, PrimaryKey, Table, Model } from 'sequelize-typescript';
import type { Player, PlayerId } from './Player';

export interface XpClaimAttributes {
  xp_claim_id: string;
  claim_value: number;
  claimed_at: Date;
  player_id: string;
}

export type XpClaimPk = 'xp_claim_id';
export type XpClaimId = XpClaim[XpClaimPk];
export type XpClaimCreationAttributes = XpClaimAttributes;

@Table({
  tableName: 'xp_claim',
})
export class XpClaim
  extends Model<XpClaimAttributes, XpClaimCreationAttributes>
  implements XpClaimAttributes
{
  @PrimaryKey
  @Column
  xp_claim_id!: string;
  @Column
  claim_value!: number;
  @Column
  claimed_at: Date;
  @Column
  player_id!: string;

  // XpClaim belongsTo Player via player_id
  player!: Player;
  getPlayer!: Sequelize.BelongsToGetAssociationMixin<Player>;
  setPlayer!: Sequelize.BelongsToSetAssociationMixin<Player, PlayerId>;
  createPlayer!: Sequelize.BelongsToCreateAssociationMixin<Player>;

  static initModel(sequelize: Sequelize.Sequelize): typeof XpClaim {
    return XpClaim.init(
      {
        xp_claim_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        claim_value: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          comment: 'cliam_value = total_number_hands_played - sum(claim_value)',
        },
        claimed_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        player_id: {
          type: DataTypes.UUIDV4,
          allowNull: false,
          references: {
            model: 'player',
            key: 'player_id',
          },
        },
      },
      {
        sequelize,
        tableName: 'xp_claim',
        timestamps: false,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'xp_claim_id' }],
          },
          {
            name: 'fk_Xp_claim_Player1_idx',
            using: 'BTREE',
            fields: [{ name: 'player_id' }],
          },
        ],
      },
    );
  }
}
