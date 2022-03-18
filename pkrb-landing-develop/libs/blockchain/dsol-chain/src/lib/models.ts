import { deserializeUnchecked } from 'borsh';
import {
  deserializeUnchecked as deserializeUnchecked2,
  generateSchemas,
  field,
  StructKind,
  vec,
  fixedArray,
} from '@s2g/borsh';
import { BN } from 'bn.js';
import { Buffer } from 'buffer';
import {
  Connection,
  PublicKey,
  STAKE_CONFIG_ID,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_STAKE_HISTORY_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { STAKE_POOL_PROGRAM_ID } from '@solana/spl-stake-pool';

// Flexible class that takes properties and imbues them
// to the object instance
class Assignable {
  [index: string]: any;

  constructor(properties: any) {
    Object.keys(properties).map((key) => {
      return (this[key] = properties[key]);
    });
  }
}

export class AccoundData extends Assignable {}

const avatarSchema = new Map([
  [
    AccoundData,
    {
      kind: 'struct',
      fields: [
        ['struct_id', 'u32'],
        ['date_created', 'u32'],
        ['unlockable_date', 'u32'],
        ['numeration', 'u32'],
        ['rarity', 'u8'],
        ['level', 'u8'],
        ['xp', 'u32'],
        ['rented_state', 'u8'],
        ['use_authority', ['u8', 32]],
        ['rent_bump', 'u32'],
      ],
    },
  ],
]);

/**
 * Fetch program account data
 * @param {Buffer} data - AccountInfo Data
 * @return {any}} - Account data in Object format
 */
export function deserializeAvatarData(data: Buffer): any {
  return deserializeUnchecked(avatarSchema, AccoundData, data as Buffer);
}

const avatarSalesSchema = new Map([
  [
    AccoundData,
    {
      kind: 'struct',
      fields: [
        ['struct_id', 'u32'],
        ['vault_total', 'u32'],
        ['counter', 'u32'],
        ['rent_min_listed', 'u32'],
        ['rent_max_listed', 'u32'],
        ['rent_max_ever', 'u32'],
      ],
    },
  ],
]);

/**
 * Fetch program account data
 * @param {Buffer} data - AccountInfo Data
 * @return {any}} - Account data in Object format
 */
export function deserializeAvatarSalesData(data: Buffer): any {
  return deserializeUnchecked(avatarSalesSchema, AccoundData, data as Buffer);
}

const governorSchema = new Map([
  [
    AccoundData,
    {
      kind: 'struct',
      fields: [
        ['date_created', 'u32'],
        ['unlockable_date', 'u32'],
        ['numeration', 'u32'],
        ['rarity', 'u8'],
        ['level', 'u8'],
        ['xp', 'u32'],
      ],
    },
  ],
]);

/**
 * Fetch program account data
 * @param {Buffer} data - AccountInfo Data
 * @return {any}} - Account data in Object format
 */
export function deserializeGovernorData(data: Buffer): any {
  return deserializeUnchecked(governorSchema, AccoundData, data as Buffer);
}

const governorSalesSchema = new Map([
  [
    AccoundData,
    {
      kind: 'struct',
      fields: [
        ['vault_total', 'u64'],
        ['counter', 'u32'],
      ],
    },
  ],
]);

/**
 * Fetch program account data
 * @param {Buffer} data - AccountInfo Data
 * @return {any}} - Account data in Object format
 */
export function deserializeGovernorSalesData(data: Buffer): any {
  return deserializeUnchecked(governorSalesSchema, AccoundData, data as Buffer);
}

const proposalsSchema = new Map([
  [
    AccoundData,
    {
      kind: 'struct',
      fields: [['proposal_id', 'u32']],
    },
  ],
]);

/**
 * Fetch program account data
 * @param {Buffer} data - AccountInfo Data
 * @return {any}} - Account data in Object format
 */
export function deserializeProposalsData(data: Buffer): any {
  return deserializeUnchecked(proposalsSchema, AccoundData, data as Buffer);
}

class Result {
  @field({ type: 'u8' })
  public leading_choice_bump!: number;

  @field({ type: fixedArray('u32', 5) })
  public choices!: number[];

  constructor(properties?: { leading_choice_bump: number; choices: number[] }) {
    if (properties) {
      this.leading_choice_bump = properties.leading_choice_bump;
      this.choices = properties.choices;
    }
  }
}

class Vote {
  @field({ type: fixedArray('u8', 32) })
  public proposal_pda!: number[];

  @field({ type: fixedArray('u8', 32) })
  public mint_id!: number[];

  @field({ type: fixedArray('u8', 5) })
  public choice_bumps!: number[];

  constructor(properties?: {
    proposal_pda: number[];
    mint_id: number[];
    choice_bumps: number[];
  }) {
    if (properties) {
      this.proposal_pda = properties.proposal_pda;
      this.mint_id = properties.mint_id;
      this.choice_bumps = properties.choice_bumps;
    }
  }
}

class Proposal {
  @field({ type: fixedArray('u8', 32) })
  public proposal_pda!: number[];

  @field({ type: 'String' })
  public proposal!: string;

  @field({ type: 'String' })
  public choices!: string;

  @field({ type: 'u32' })
  public max_vote_bump!: number;

  @field({ type: fixedArray('u8', 32) })
  public proposal_governor_id!: number[];

  @field({ type: 'u64' })
  public duration!: typeof BN;

  @field({ type: 'u64' })
  public ending_date!: typeof BN;

  @field({ type: vec(Vote) })
  public votes!: Vote[];

  @field({ type: Result })
  public result!: Result;

  constructor(properties?: {
    proposal_pda: number[];
    proposal: string;
    choices: string;
    max_vote_bump: number;
    proposal_governor_id: number[];
    duration: typeof BN;
    ending_date: typeof BN;
    votes: Vote[];
    result: Result;
  }) {
    if (properties) {
      this.proposal_pda = properties.proposal_pda;
      this.proposal = properties.proposal;
      this.choices = properties.choices;
      this.max_vote_bump = properties.max_vote_bump;
      this.proposal_governor_id = properties.proposal_governor_id;
      this.duration = properties.duration;
      this.ending_date = properties.ending_date;
      this.votes = properties.votes;
      this.result = properties.result;
    }
  }
}

const proposalSchema = generateSchemas([Proposal]);

/**
 * Fetch program account data
 * @param {Buffer} data - AccountInfo Data
 * @return {any}} - Account data in Object format
 */
export function deserializeProposalData(data: Buffer): any {
  return deserializeUnchecked2(proposalSchema, Proposal, data as Buffer);
}

class Payment {
  @field({ type: 'u64' })
  public amount!: typeof BN;

  @field({ type: 'u32' })
  public time!: number;

  constructor(properties?: { amount: typeof BN; time: number }) {
    if (properties) {
      this.amount = properties.amount;
      this.time = properties.time;
    }
  }
}
class Loan {
  @field({ type: fixedArray('u8', 32) })
  public mint!: number[];

  @field({ type: 'u64' })
  public initial_amount!: typeof BN;

  @field({ type: 'u64' })
  public amount_left!: typeof BN;

  @field({ type: vec(Payment) })
  public payments!: Payment[];

  @field({ type: 'u32' })
  public monthly_interest_numerator!: number;

  @field({ type: 'u32' })
  public monthly_interest_denominator!: number;

  @field({ type: 'u32' })
  public initial_loan_date!: number;

  @field({ type: 'u32' })
  public last_pay_date!: number;

  @field({ type: 'u8' })
  public is_loan_active!: boolean;

  constructor(properties?: {
    mint: number[];
    initial_amount: typeof BN;
    amount_left: typeof BN;
    payments: Payment[];
    monthly_interest_numerator: number;
    monthly_interest_denominator: number;
    initial_loan_date: number;
    last_pay_date: number;
    is_loan_active: boolean;
  }) {
    if (properties) {
      this.mint = properties.mint;
      this.initial_amount = properties.initial_amount;
      this.amount_left = properties.amount_left;
      this.payments = properties.payments;
      this.monthly_interest_numerator = properties.monthly_interest_numerator;
      this.monthly_interest_denominator =
        properties.monthly_interest_denominator;
      this.initial_loan_date = properties.initial_loan_date;
      this.last_pay_date = properties.last_pay_date;
      this.is_loan_active = properties.is_loan_active;
    }
  }
}

class LoanLoc {
  @field({ type: fixedArray('u8', 32) })
  public payer!: number[];

  @field({ type: 'u32' })
  public bump!: number;

  constructor(properties?: { payer: number[]; bump: number }) {
    if (properties) {
      this.payer = properties.payer;
      this.bump = properties.bump;
    }
  }
}

class AllLoans {
  @field({ type: vec(LoanLoc) })
  public all_loans!: LoanLoc[];

  constructor(properties?: { all_loans: LoanLoc[] }) {
    if (properties) {
      this.all_loans = properties.all_loans;
    }
  }
}

const allLoansSchema = generateSchemas([AllLoans]);
const loanSchema = generateSchemas([Loan]);

/**
 * Fetch program account data
 * @param {Buffer} data - AccountInfo Data
 * @return {any}} - Account data in Object format
 */
export function deserializeallLoansData(data: Buffer): any {
  return deserializeUnchecked2(allLoansSchema, AllLoans, data as Buffer);
}

/**
 * Fetch program account data
 * @param {Buffer} data - AccountInfo Data
 * @return {any}} - Account data in Object format
 */
export function deserializeLoanData(data: Buffer): any {
  return deserializeUnchecked2(loanSchema, Loan, data as Buffer);
}
// const addValidatorToStakePool = async (
//   program_id: PublicKey,
//   stake_pool: PublicKey,
//   manager: PublicKey,
//   validator_list: PublicKey,
//   funder: PublicKey,
//   validator: PublicKey
// ) => {
//   const connection = new Connection(CONNECTION_URL)
//   const [withdraw_auth, seed_1] = await PublicKey.findProgramAddress(
//     [Buffer.from(stake_pool.toString()), Buffer.from('withdraw')],
//     program_id
//   );
//   const [validator_stake, seed_2] = await PublicKey.findProgramAddress(
//     [Buffer.from(stake_pool.toString()), Buffer.from(validator.toString())],
//     program_id
//   );

//   const accounts = [
//     { pubkey: stake_pool, isSigner: false, isWritable: false },
//     { pubkey: manager, isSigner: true, isWritable: false },
//     { pubkey: funder, isSigner: true, isWritable: true },
//     { pubkey: withdraw_auth, isSigner: false, isWritable: false },
//     { pubkey: validator_list, isSigner: false, isWritable: true },
//     { pubkey: validator_stake, isSigner: false, isWritable: true },
//     { pubkey: validator, isSigner: false, isWritable: false },
//     { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
//     { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
//     { pubkey: SYSVAR_STAKE_HISTORY_PUBKEY, isSigner: false, isWritable: false },
//     { pubkey: STAKE_CONFIG_ID, isSigner: false, isWritable: false },
//     { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
//     { pubkey: STAKE_POOL_PROGRAM_ID, isSigner: false, isWritable: false },
//   ];

//   const data = Buffer.from('\x01')

//   const instruction = new TransactionInstruction({
//     keys: accounts,
//     data: data,
//     programId: program_id
//   })

//   try {
//     const transaction = new Transaction();

//     const tx = await transaction.add(instruction);
//     tx.feePayer = funder;
//     const blockhashObj = await connection.getLatestBlockhash();
//     tx.recentBlockhash = await blockhashObj.blockhash;
//     tx.sign(...[managerKeypair]);
//     const signedTransaction = wallet.signTransaction
//       ? await wallet?.signTransaction(tx)
//       : null;
//     const txn = signedTransaction?.serialize();

//     const transactionId = await sendAndConfirmRawTransaction(
//       connection,
//       txn as Buffer
//     );

//     return transactionId;
//   } catch (error) {
//     throw new Error('' + error);
//   }
// };

// def add_validator_to_pool_with_vote(
//   program_id: PublicKey,
//   stake_pool: PublicKey,
//   staker: PublicKey,
//   validator_list: PublicKey,
//   funder: PublicKey,
//   validator: PublicKey
// ) -> TransactionInstruction:
//   """Creates instruction to add a validator based on their vote account address."""
//   (withdraw_authority, seed) = find_withdraw_authority_program_address(program_id, stake_pool)
//   (validator_stake, seed) = find_stake_program_address(program_id, validator, stake_pool)
//   return add_validator_to_pool(
//       AddValidatorToPoolParams(
//           program_id=STAKE_POOL_PROGRAM_ID,
//           stake_pool=stake_pool,
//           staker=staker,
//           funding_account=funder,
//           withdraw_authority=withdraw_authority,
//           validator_list=validator_list,
//           validator_stake=validator_stake,
//           validator_vote=validator,
//           rent_sysvar=SYSVAR_RENT_PUBKEY,
//           clock_sysvar=SYSVAR_CLOCK_PUBKEY,
//           stake_history_sysvar=SYSVAR_STAKE_HISTORY_PUBKEY,
//           stake_config_sysvar=SYSVAR_STAKE_CONFIG_ID,
//           system_program_id=SYS_PROGRAM_ID,
//           stake_program_id=STAKE_PROGRAM_ID,
//       )
//   )
