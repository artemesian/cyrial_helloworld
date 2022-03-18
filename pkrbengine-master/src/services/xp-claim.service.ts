import { v4 as uuid } from 'uuid';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { XpClaim } from 'src/models/XpClaim';
import { CreateXpClaimDto } from 'src/models/create-dto';
import { Transaction } from 'sequelize/types';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class XpClaimService {
  constructor(
    @InjectModel(XpClaim)
    private xpClaimModel: typeof XpClaim,
  ) {}

  async setXpClaim(xpClaim: CreateXpClaimDto, transaction?: Transaction) {
    return this.xpClaimModel.create(
      {
        ...xpClaim,
        xp_claim_id: uuid(),
      },
      {
        transaction,
        fields: ['claim_value', 'player_id', 'xp_claim_id', 'claimed_at'],
      },
    );
  }

  async updateXp(xp_claim_id: string, data: {}, transaction?: Transaction) {
    return this.xpClaimModel.update(data, {
      where: { xp_claim_id },
      transaction,
    });
  }

  async findOne(player_id: string, transaction?: Transaction) {
    return this.xpClaimModel.findOne({
      where: { player_id },
      transaction,
    });
  }

  async SumXp(player_id: string, transaction?: Transaction) {
    return this.xpClaimModel.sum('claim_value', {
      transaction,
      where: { player_id },
    });
  }
}
