import {
  PublicKey,
  Keypair,
  SystemProgram,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
  sendAndConfirmRawTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Connection } from '@metaplex/js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  AccountLayout,
} from '@solana/spl-token';
import {
  depositSol,
  getStakePoolAccount,
  withdrawSol,
} from '@solana/spl-stake-pool';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import {
  deserializeallLoansData,
  deserializeAvatarData,
  deserializeAvatarSalesData,
  deserializeGovernorData,
  deserializeGovernorSalesData,
  deserializeLoanData,
  deserializeProposalData,
  deserializeProposalsData,
} from './models';
import { Avatar, Governor } from '@temp-workspace/dsol/util-interfaces';

const CONNECTION_URL = 'devnet';
// Avatar ProgramID
const avatarProgramID = new PublicKey(
  'ASV3UahwSK3oRmNkkbyhFNSRSaccL2jJvAYCYQa8RSgG'
);
// Governor ProgramID
const governorProgramID = new PublicKey(
  '8Ga7yNCYJiJ6HLTZMu14iNh6una9AGZvuM4n9napx1v3'
);
// Metaplex ProgramID
const metaplexMetadataID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);
const governorVaultID = (async () => {
  return await PublicKey.findProgramAddress(
    [Buffer.from('Governor_Vault')],
    governorProgramID
  );
})();

const vaultID = new PublicKey('G473EkeR5gowVn8CRwTSDop3zPwaNixwp62qi7nyVf4z');

const dsolID = new PublicKey('HSYdApQF2FKVNnX6FQ1ySYstGLe5Gp8NseHVFavWye66');

const stakePoolID = new PublicKey(
  'BHEXdxcCEYD9or7LPYH95P1SsAiQKzYZRiEoVgdi8C8o'
);

const stakeID = new PublicKey('BysCnVrQZrUJkYo36bcGvnt2HKnxHycEoRZcwsBL4ne3');

const validatorListID = new PublicKey(
  'BTGPgRuDFoMBQVJQH7FT6TA5YNb7XKNBDYL5Snos2xeo'
);

const poolMintID = new PublicKey(
  'A4SjjdhLgcUxupnhShoPo62ACW79bMX47JutkqWFMgsQ'
);

const daoID = new PublicKey('7y8RbM8qx3V4Hnwj8fmkd1H96e8xeVsAQQ9zc5WYRsCF');

const proposalsID = (async () => {
  return await PublicKey.findProgramAddress(
    [Buffer.from('Dsol_Dao_Governance')],
    daoID
  );
})();

const create_num_cnt = (num: any) => {
  return [Number((num - (num % 255)) / 255), 255, num % 255];
};

const toBytesInt32 = (num: number) => {
  const arr = new Uint8Array([
    (num & 0xff000000) >> 24,
    (num & 0x00ff0000) >> 16,
    (num & 0x0000ff00) >> 8,
    num & 0x000000ff,
  ]);
  return arr;
};

const promiseAll = async (promiseData: any) => {
  const filteredPromiseData: any = [];
  const getTokenData = await Promise.allSettled(promiseData);
  await getTokenData.forEach((tokenD) => {
    if (tokenD?.status === 'fulfilled' && tokenD.value) {
      filteredPromiseData.push(tokenD.value);
    }

    return false;
  });
  return filteredPromiseData;
};

const fetchToken = async (
  wallet: PublicKey,
  deserializeToken: any,
  programId: PublicKey,
  dataPDASeed: string
) => {
  const connection = new Connection(CONNECTION_URL);

  // get all tokens account from wallet NB: even Dsol token account
  const parsedTokens = await connection.getParsedTokenAccountsByOwner(
    wallet as PublicKey,
    { programId: TOKEN_PROGRAM_ID }
  );
  // extract token infos
  console.log(parsedTokens);
  let tokenInfos = parsedTokens.value.map((data) => {
    const token = data.account.data.parsed.info;
    return token;
  });
  tokenInfos = tokenInfos.filter(
    (tokenInfo: any) => tokenInfo?.tokenAmount?.uiAmount === 1
  );

  const tokens = [];
  for (let i = 0; i < tokenInfos.length; i++) {
    const token = tokenInfos[i];

    // compute token data's account's pda
    const tokenDataPDA = await PublicKey.findProgramAddress(
      [Buffer.from(dataPDASeed), new PublicKey(token.mint).toBuffer()],
      programId
    );
    tokens.push({
      pda: tokenDataPDA[0],
      mint: token?.mint,
      state: token?.state,
    });
  }

  const tokenData = tokens.map(
    (token: any) =>
      new Promise((resolve, reject) => {
        (async () => {
          const tokenInfo = await connection.getAccountInfo(token?.pda);
          if (!tokenInfo?.data) {
            // if data null, token is not what we expect, delete it
            reject(false);
          } else {
            // const rawAccount = await AccountLayout.decode(tokenInfo?.data);
            const tokenInfoData = {
              // address: token.pda,
              // mint: rawAccount.mint,
              // owner: rawAccount.owner,
              // amount: rawAccount.amount,
              // delegate: rawAccount.delegateOption ? rawAccount.delegate : null,
              // delegatedAmount: rawAccount.delegatedAmount,
              // isInitialized: rawAccount.state !== 0,
              isFrozen: token.state === 'frozen',
              // isNative: !!rawAccount.isNativeOption,
              // rentExemptReserve: rawAccount.isNativeOption
              //   ? rawAccount.isNative
              //   : null,
              // closeAuthority: rawAccount.closeAuthorityOption
              //   ? rawAccount.closeAuthority
              //   : null,
            };

            resolve({
              ...token,
              data: tokenInfo?.data,
              isFrozen: tokenInfoData.isFrozen,
            });
          }
        })();
      })
  );

  const filteredTokens: any = await promiseAll(tokenData);
  const tokenDeserializedData = [];
  for (let i = 0; i < filteredTokens.length; i++) {
    const element = filteredTokens[i];
    const value = element?.data;
    // deserialize buffer data into readable format
    const data = await deserializeToken(value);
    tokenDeserializedData.push({ ...element, data: data });
  }

  const tokensWithMeta = tokenDeserializedData.map(
    (token: any) =>
      new Promise((resolve, reject) => {
        (async () => {
          let metadata;
          // get metadata of each token
          try {
            const metadataPDA = await Metadata.getPDA(
              new PublicKey(token.mint)
            );
            metadata = await Metadata.load(connection, metadataPDA);
          } catch (error) {
            throw new Error(
              'Error When Fetching Metadata of ' + token?.mint + ' : ' + error
            );
            reject(false);
          }
          const metadataURI = metadata?.data?.data?.uri;

          let tokenURIDATA = await fetch(metadataURI as RequestInfo);
          tokenURIDATA = await tokenURIDATA.json();
          resolve({ ...token, metadata: { metadata, tokenURIDATA } });
        })();
      })
  );

  const finalTokens = await promiseAll(tokensWithMeta);

  return finalTokens;
};

export const fetchAvatars = async (wallet: PublicKey) => {
  await getStakePoolTotalSol();
  const avatars = await fetchToken(
    wallet,
    deserializeAvatarData,
    avatarProgramID,
    'avatar_data_pda'
  );
  // Sanetize avatars into the clean Avatar Interface
  const finalAvatars: Array<Avatar> = avatars.map((avatar: any) => {
    return {
      avatar_id: avatar?.mint?.toString(),
      avatar_link: avatar?.metadata?.tokenURIDATA?.image,
      name: avatar?.data?.numeration,
      rarity: avatar?.metadata?.tokenURIDATA?.collection?.family,
      minimum_listed_price: 500,
      avatar_xp: avatar?.data?.xp,
      avatar_level: avatar?.data?.level,
      is_owned: avatar?.data?.rented_state === 1 ? false : true,
      is_on_marketplace: avatar?.data?.on_market === 0 ? true : false,
      lease_end_date: undefined,
    };
  });
  return finalAvatars;
};

export const mintAvatar = async (wallet: WalletContextState) => {
  if (!wallet?.connected) return false;
  const connection = new Connection(CONNECTION_URL);
  const payerAccount = {
    pubkey: wallet.publicKey as PublicKey,
    isSigner: true,
    isWritable: true,
  };

  const vaultAccount = {
    pubkey: vaultID,
    isSigner: false,
    isWritable: true,
  };
  const mintKeypair = Keypair.generate();
  const mintAccount = {
    pubkey: mintKeypair.publicKey,
    isSigner: true,
    isWritable: true,
  };
  const payerDsolTokenAccount = {
    pubkey: await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      dsolID,
      payerAccount.pubkey
    ),
    isSigner: false,
    isWritable: true,
  };
  const vaultDsolTokenAccount = {
    pubkey: await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      dsolID,
      vaultID
    ),
    isSigner: false,
    isWritable: true,
  };
  const assoctokenAccount = {
    pubkey: await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mintAccount.pubkey,
      wallet.publicKey as PublicKey
    ),
    isSigner: false,
    isWritable: true,
  };
  const splprogramAccount = {
    pubkey: TOKEN_PROGRAM_ID,
    isSigner: false,
    isWritable: false,
  };
  const sysprogramAccount = {
    pubkey: SystemProgram.programId,
    isSigner: false,
    isWritable: false,
  };
  const assocprogramAccount = {
    pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
    isSigner: false,
    isWritable: false,
  };
  const rentAccount = {
    pubkey: SYSVAR_RENT_PUBKEY,
    isSigner: false,
    isWritable: false,
  };
  const clockAccount = {
    pubkey: SYSVAR_CLOCK_PUBKEY,
    isSigner: false,
    isWritable: false,
  };
  const metaplexmetadataAccount = {
    pubkey: metaplexMetadataID,
    isSigner: false,
    isWritable: false,
  };
  const [mintAuthorityPDA, mint_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('avatar_mint_authority_pda')],
    avatarProgramID
  );
  const [avatarDataPDA, avatar_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('avatar_data_pda'), mintAccount.pubkey.toBuffer()],
    avatarProgramID
  );
  const [salesPDA, sales_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('dsol_avatar_sales_pda')],
    avatarProgramID
  );
  const [metadataPDA, metadata_nonce] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      metaplexMetadataID.toBuffer(),
      mintAccount.pubkey.toBuffer(),
    ],
    metaplexMetadataID
  );
  const mintauthAccount = {
    pubkey: mintAuthorityPDA,
    isSigner: false,
    isWritable: false,
  };
  const avatardataAccount = {
    pubkey: avatarDataPDA,
    isSigner: false,
    isWritable: true,
  };
  const salesAccount = {
    pubkey: salesPDA,
    isSigner: false,
    isWritable: true,
  };
  const tokenmetadataAccount = {
    pubkey: metadataPDA,
    isSigner: false,
    isWritable: true,
  };
  const mintInstruction = new TransactionInstruction({
    keys: [
      payerAccount,
      payerDsolTokenAccount,
      vaultAccount,
      vaultDsolTokenAccount,
      mintAccount,
      rentAccount,
      assoctokenAccount,
      splprogramAccount,
      sysprogramAccount,
      mintauthAccount,
      avatardataAccount,
      salesAccount,
      tokenmetadataAccount,
      clockAccount,

      splprogramAccount,
      assocprogramAccount,
      splprogramAccount,
      splprogramAccount,
      metaplexmetadataAccount,
    ],
    data: Buffer.from([0]),
    programId: avatarProgramID,
  });
  try {
    const transaction = new Transaction();

    const tx = await transaction.add(mintInstruction);
    tx.feePayer = (await wallet.publicKey) as PublicKey;
    const blockhashObj = await connection.getLatestBlockhash();
    tx.recentBlockhash = await blockhashObj.blockhash;
    tx.sign(...[mintKeypair]);
    const signedTransaction = wallet.signTransaction
      ? await wallet?.signTransaction(tx)
      : null;
    const txn = signedTransaction?.serialize();

    const transactionId = await sendAndConfirmRawTransaction(
      connection,
      txn as Buffer
    );

    return transactionId;
  } catch (error) {
    throw new Error('' + error);
  }
};

export const getAvatarMintPrice = async () => {
  const connection = new Connection(CONNECTION_URL);

  const [salesPDA, sales_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('sales_pda')],
    avatarProgramID
  );
  const salesInfo = await connection.getAccountInfo(salesPDA);
  const salesData = deserializeAvatarSalesData(salesInfo?.data as Buffer);

  return salesData;
};

export const fetchGovernors = async (wallet: PublicKey) => {
  const governors = await fetchToken(
    wallet,
    deserializeGovernorData,
    governorProgramID,
    'governor_data_pda'
  );
  // Sanetize governors into the clean Governor Interface
  const finalGovernors: Array<Governor> = governors.map((governor: any) => {
    return {
      governor_id: governor?.mint?.toString(),
      governor_link: governor?.metadata?.tokenURIDATA?.image,
      name: governor?.data?.numeration,
      rarity: governor?.metadata?.tokenURIDATA?.collection?.family,
      minimum_listed_price: 500,
      governor_xp: governor?.data?.xp,
      governor_level: governor?.data?.level,
      is_blocked: governor?.isFrozen,
      is_on_marketplace: governor?.data?.on_market === 0 ? true : false,
      unlocks_on: governor?.data?.unlockable_date * 1000,
    };
  });
  return finalGovernors;
};

export const mintGovernors = async (wallet: WalletContextState) => {
  if (!wallet?.connected) return false;
  const connection = new Connection(CONNECTION_URL);

  // get all tokens account from wallet
  const parsedTokens = await connection.getParsedTokenAccountsByOwner(
    wallet.publicKey as PublicKey,
    { programId: TOKEN_PROGRAM_ID }
  );
  // extract token infos
  const tokenInfos = await parsedTokens.value.map((data) => {
    const token = data.account.data.parsed.info;
    return token;
  });
  const tokens = [];
  for (let i = 0; i < tokenInfos.length; i++) {
    const token = tokenInfos[i];

    // compute token data's account's pda
    const tokenDataPDA = await PublicKey.findProgramAddress(
      [Buffer.from('avatar_data_pda'), new PublicKey(token.mint).toBuffer()],
      avatarProgramID
    );
    tokens.push({ pda: tokenDataPDA[0], mint: token?.mint });
  }

  let avatar: any = '';
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    const tokenInfo = await connection.getAccountInfo(token?.pda);
    if (tokenInfo?.data) {
      avatar = new PublicKey(token?.mint);
      break;
    }
  }

  if (!avatar) {
    console.log('No avatar');
    return false;
  }

  const avatarAccount = {
    pubkey: avatar as PublicKey,
    isSigner: false,
    isWritable: false,
  };
  const [avatarMintAuthorityPDA, avatarmintauth_nonce] =
    await PublicKey.findProgramAddress(
      [Buffer.from('avatar_mint_authority_pda')],
      avatarProgramID
    );

  const [avatarMetadataPDA, avatarmetadata_nonce] =
    await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        metaplexMetadataID.toBuffer(),
        avatar.toBuffer(),
      ],
      metaplexMetadataID
    );

  const avatarmetadataAccount = {
    pubkey: avatarMetadataPDA,
    isSigner: false,
    isWritable: true,
  };

  const avatarassoctokenAccount = {
    pubkey: await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      avatar,
      wallet.publicKey as PublicKey
    ),
    isSigner: false,
    isWritable: true,
  };

  const avatarmintauthAccount = {
    pubkey: avatarMintAuthorityPDA,
    isSigner: false,
    isWritable: true,
  };

  const payerAccount = {
    pubkey: wallet.publicKey as PublicKey,
    isSigner: true,
    isWritable: true,
  };

  const vaultAccount = {
    pubkey: (await governorVaultID)[0],
    isSigner: false,
    isWritable: true,
  };
  const mintKeypair = Keypair.generate();
  const mintAccount = {
    pubkey: mintKeypair.publicKey,
    isSigner: true,
    isWritable: true,
  };

  const assoctokenAccount = {
    pubkey: await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mintAccount.pubkey,
      wallet.publicKey as PublicKey
    ),
    isSigner: false,
    isWritable: true,
  };
  const splprogramAccount = {
    pubkey: TOKEN_PROGRAM_ID,
    isSigner: false,
    isWritable: false,
  };
  const sysprogramAccount = {
    pubkey: SystemProgram.programId,
    isSigner: false,
    isWritable: false,
  };

  const rentAccount = {
    pubkey: SYSVAR_RENT_PUBKEY,
    isSigner: false,
    isWritable: false,
  };
  const clockAccount = {
    pubkey: SYSVAR_CLOCK_PUBKEY,
    isSigner: false,
    isWritable: false,
  };
  const metaplexmetadataAccount = {
    pubkey: metaplexMetadataID,
    isSigner: false,
    isWritable: false,
  };
  const [mintAuthorityPDA, mint_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('mint_authority')],
    governorProgramID
  );
  const [governorDataPDA, governor_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('governor_data_pda'), mintAccount.pubkey.toBuffer()],
    governorProgramID
  );
  const [salesPDA, sales_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('sales_pda'), governorProgramID.toBuffer()],
    governorProgramID
  );
  const [metadataPDA, metadata_nonce] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      metaplexMetadataID.toBuffer(),
      mintAccount.pubkey.toBuffer(),
    ],
    metaplexMetadataID
  );
  const mintauthAccount = {
    pubkey: mintAuthorityPDA,
    isSigner: false,
    isWritable: false,
  };
  const governordataAccount = {
    pubkey: governorDataPDA,
    isSigner: false,
    isWritable: true,
  };
  const salesAccount = {
    pubkey: salesPDA,
    isSigner: false,
    isWritable: true,
  };
  const tokenmetadataAccount = {
    pubkey: metadataPDA,
    isSigner: false,
    isWritable: true,
  };
  const assocprogramAccount = {
    pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
    isSigner: false,
    isWritable: false,
  };

  const mintInstruction = new TransactionInstruction({
    keys: [
      payerAccount,
      vaultAccount,
      mintAccount,
      rentAccount,
      assoctokenAccount,
      splprogramAccount,
      sysprogramAccount,
      mintauthAccount,
      governordataAccount,
      salesAccount,
      tokenmetadataAccount,
      clockAccount,
      avatarAccount,
      avatarmintauthAccount,
      avatarmetadataAccount,
      avatarassoctokenAccount,

      sysprogramAccount,
      sysprogramAccount,
      splprogramAccount,
      assocprogramAccount,
      splprogramAccount,
      metaplexmetadataAccount,
      metaplexmetadataAccount,
      sysprogramAccount,
      sysprogramAccount,
      sysprogramAccount,
    ],
    data: Buffer.from([0]),
    programId: governorProgramID,
  });

  try {
    const transaction = new Transaction();

    const tx = await transaction.add(mintInstruction);

    tx.feePayer = (await wallet.publicKey) as PublicKey;
    const blockhashObj = await connection.getLatestBlockhash();
    tx.recentBlockhash = await blockhashObj.blockhash;
    tx.sign(...[mintKeypair]);
    const signedTransaction = wallet.signTransaction
      ? await wallet?.signTransaction(tx)
      : null;
    const txn = signedTransaction?.serialize();

    const transactionId = await sendAndConfirmRawTransaction(
      connection,
      txn as Buffer
    );

    return transactionId;
  } catch (error) {
    throw new Error('' + error);
  }
};

export const unlockGovernor = async (
  wallet: WalletContextState,
  governorPublickey: PublicKey
) => {
  if (!wallet?.connected) return false;
  const connection = new Connection(CONNECTION_URL);

  const mintAccount = {
    pubkey: governorPublickey as PublicKey,
    isSigner: false,
    isWritable: true,
  };

  const assoctokenAccount = {
    pubkey: await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mintAccount.pubkey,
      wallet.publicKey as PublicKey
    ),
    isSigner: false,
    isWritable: true,
  };
  const splprogramAccount = {
    pubkey: TOKEN_PROGRAM_ID,
    isSigner: false,
    isWritable: false,
  };

  const clockAccount = {
    pubkey: SYSVAR_CLOCK_PUBKEY,
    isSigner: false,
    isWritable: false,
  };

  const [mintAuthorityPDA, mint_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('mint_authority')],
    governorProgramID
  );
  const [governorDataPDA, governor_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('governor_data_pda'), mintAccount.pubkey.toBuffer()],
    governorProgramID
  );

  const mintauthAccount = {
    pubkey: mintAuthorityPDA,
    isSigner: false,
    isWritable: false,
  };
  const governordataAccount = {
    pubkey: governorDataPDA,
    isSigner: false,
    isWritable: true,
  };

  const mintInstruction = new TransactionInstruction({
    keys: [
      mintAccount,
      assoctokenAccount,
      splprogramAccount,
      mintauthAccount,
      governordataAccount,
      clockAccount,

      splprogramAccount,
    ],
    data: Buffer.from([1]),
    programId: governorProgramID,
  });

  try {
    const transaction = new Transaction();

    const tx = await transaction.add(mintInstruction);

    tx.feePayer = (await wallet.publicKey) as PublicKey;
    const blockhashObj = await connection.getLatestBlockhash();
    tx.recentBlockhash = await blockhashObj.blockhash;
    const signedTransaction = wallet.signTransaction
      ? await wallet?.signTransaction(tx)
      : null;
    const txn = signedTransaction?.serialize();

    const transactionId = await sendAndConfirmRawTransaction(
      connection,
      txn as Buffer
    );

    return transactionId;
  } catch (error) {
    throw new Error('' + error);
  }
};

export const getGovernorMintPrice = async () => {
  const connection = new Connection(CONNECTION_URL);

  const [salesPDA, sales_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('sales_pda'), governorProgramID.toBuffer()],
    governorProgramID
  );
  const salesInfo = await connection.getAccountInfo(salesPDA);

  const salesData = deserializeGovernorSalesData(salesInfo?.data as Buffer);
  return salesData;
};

export const stakeSol = async (amount: number, wallet: any) => {
  const connection = new Connection(CONNECTION_URL);
  const { instructions, signers } = await depositSol(
    connection,
    stakePoolID,
    wallet.publicKey as PublicKey,
    amount * LAMPORTS_PER_SOL,
    undefined,
    undefined,
    undefined
  );

  try {
    const transaction = new Transaction();

    const tx = await transaction.add(...instructions);
    tx.feePayer = (await wallet.publicKey) as PublicKey;
    const blockhashObj = await connection.getLatestBlockhash();
    tx.recentBlockhash = await blockhashObj.blockhash;
    tx.sign(...signers);
    const signedTransaction = wallet.signTransaction
      ? await wallet?.signTransaction(tx)
      : null;
    const txn = signedTransaction?.serialize();

    const transactionId = await sendAndConfirmRawTransaction(
      connection,
      txn as Buffer
    );

    return transactionId;
  } catch (error) {
    throw new Error('' + error);
  }
};

export const getStakePoolTotalSol = async () => {
  const connection = new Connection(CONNECTION_URL);

  const stakepool = await getStakePoolAccount(connection, stakePoolID);
  console.log(stakepool);
};

export const getAvailableLiquidSol = async (wallet: WalletContextState) => {
  const connection = new Connection(CONNECTION_URL);

  const liquidSolInfo = await connection.getParsedTokenAccountsByOwner(
    wallet.publicKey as PublicKey,
    { mint: poolMintID }
  );

  const liquidSol =
    liquidSolInfo.value[0].account.data.parsed.info.tokenAmount.uiAmount;
  return liquidSol;
};

export const getStakePool = async () => {
  const connection = new Connection(CONNECTION_URL);

  try {
    const stakepool = await getStakePoolAccount(connection, stakePoolID);
    return stakepool;
  } catch (error) {
    throw new Error('Error from getStakePool: ' + error);
  }
};

export const withdrawUserSol = async (
  wallet: WalletContextState,
  amount: number
) => {
  const connection = new Connection(CONNECTION_URL);
  const { instructions, signers } = await withdrawSol(
    connection,
    stakePoolID,
    wallet.publicKey as PublicKey,
    wallet.publicKey as PublicKey,
    amount
  );
  try {
    const transaction = new Transaction();

    const tx = await transaction.add(...instructions);
    tx.feePayer = (await wallet.publicKey) as PublicKey;
    const blockhashObj = await connection.getLatestBlockhash();
    tx.recentBlockhash = await blockhashObj.blockhash;
    tx.sign(...signers);
    const signedTransaction = wallet.signTransaction
      ? await wallet?.signTransaction(tx)
      : null;
    const txn = signedTransaction?.serialize();

    const transactionId = await sendAndConfirmRawTransaction(
      connection,
      txn as Buffer
    );

    return transactionId;
  } catch (error) {
    throw new Error('Error from withdrawUserSol: ' + error);
  }
};

export const submitProposal = async (
  wallet: WalletContextState,
  governorMint: PublicKey,
  proposalInfo: any
) => {
  if (!wallet?.connected) return false;
  const connection = new Connection(CONNECTION_URL);

  let proposal = proposalInfo.proposal;

  let choices = proposalInfo.options.map(
    (option: { [index: string]: any }) => option['option']
  );
  const leftLength = 5 - choices.length;
  choices = choices.concat(Array(leftLength).fill(''));
  proposal = Array(500 - proposal.length)
    .fill(1)
    .reduce((acc, val) => acc + '\0', proposal);

  choices = choices.map((choice: any) => {
    return Array(30 - choice.length)
      .fill(1)
      .reduce((acc, val) => acc + '\0', choice);
  });

  const duration = proposalInfo.duration;
  const proposalsInfo = await connection.getAccountInfo((await proposalsID)[0]);

  const deserializedProposalsInfo = deserializeProposalsData(
    proposalsInfo?.data as Buffer
  );
  const payerAccount = {
    pubkey: wallet.publicKey as PublicKey,
    isSigner: true,
    isWritable: true,
  };

  const governorVaultAccount = {
    pubkey: (await governorVaultID)[0],
    isSigner: false,
    isWritable: true,
  };

  const governormintAccount = {
    pubkey: governorMint as PublicKey,
    isSigner: false,
    isWritable: false,
  };

  const governortokenAccount = {
    pubkey: await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      governorMint,
      wallet.publicKey as PublicKey
    ),
    isSigner: false,
    isWritable: false,
  };

  const [metadataPDA, metadata_nonce] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      metaplexMetadataID.toBuffer(),
      governorMint.toBuffer(),
    ],
    metaplexMetadataID
  );

  const governormetaAccount = {
    pubkey: metadataPDA,
    isSigner: false,
    isWritable: true,
  };

  const proposalsAccount = {
    pubkey: (await proposalsID)[0],
    isSigner: false,
    isWritable: true,
  };

  const [proposalPDA, proposal_nonce] = await PublicKey.findProgramAddress(
    [
      Buffer.from('Dsol_Dao_Governance'),
      toBytesInt32(deserializedProposalsInfo.proposal_id),
    ],
    daoID
  );
  const proposalAccount = {
    pubkey: proposalPDA,
    isSigner: false,
    isWritable: true,
  };

  const clockAccount = {
    pubkey: SYSVAR_CLOCK_PUBKEY,
    isSigner: false,
    isWritable: false,
  };
  const sysprogramAccount = {
    pubkey: SystemProgram.programId,
    isSigner: false,
    isWritable: false,
  };

  const instruction_data: Array<Buffer> = [];

  instruction_data.push(Buffer.from([1]));

  instruction_data.push(Buffer.from(proposal, 'ascii'));

  choices.forEach((choice: any) => {
    instruction_data.push(Buffer.from(choice, 'ascii'));
  });

  instruction_data.push(Buffer.from(create_num_cnt(duration)));

  const instruction = new TransactionInstruction({
    keys: [
      payerAccount,
      governormintAccount,
      proposalsAccount,
      proposalAccount,
      clockAccount,
      governormetaAccount,
      governortokenAccount,
      governorVaultAccount,

      sysprogramAccount,
      sysprogramAccount,
    ],
    data: Buffer.concat(instruction_data),
    programId: daoID,
  });

  try {
    const transaction = new Transaction();

    const tx = await transaction.add(instruction);
    tx.feePayer = (await wallet.publicKey) as PublicKey;
    const blockhashObj = await connection.getLatestBlockhash();
    tx.recentBlockhash = await blockhashObj.blockhash;
    const signedTransaction = wallet.signTransaction
      ? await wallet?.signTransaction(tx)
      : null;
    const txn = signedTransaction?.serialize();

    const transactionId = await sendAndConfirmRawTransaction(
      connection,
      txn as Buffer
    );

    return transactionId;
  } catch (error) {
    throw new Error('' + error);
  }
};

export const fetchProposals = async () => {
  const connection = new Connection(CONNECTION_URL);
  const proposalsInfo = await connection.getAccountInfo((await proposalsID)[0]);

  const deserializedProposalsInfo = deserializeProposalsData(
    proposalsInfo?.data as Buffer
  );
  const proposalCount = deserializedProposalsInfo.proposal_id;
  const proposalsPDAPromise = [];

  for (let i = 0; i < proposalCount; i++) {
    const promise = new Promise((resolve, reject) => {
      try {
        (async () => {
          const [proposalPDA, proposal_nonce] =
            await PublicKey.findProgramAddress(
              [Buffer.from('Dsol_Dao_Governance'), toBytesInt32(i)],
              daoID
            );
          resolve(proposalPDA);
        })();
      } catch (error) {
        reject(error);
      }
    });
    proposalsPDAPromise.push(promise);
  }

  const filteredPromiseData = await promiseAll(proposalsPDAPromise);

  const tokenData = filteredPromiseData.map(
    (token: any) =>
      new Promise((resolve, reject) => {
        (async () => {
          const tokenInfo = await connection.getAccountInfo(token);
          if (!tokenInfo?.data) {
            // if data null, token is not what we expect, delete it
            reject(false);
          } else {
            resolve({
              mint: token,
              data: tokenInfo?.data,
            });
          }
        })();
      })
  );

  const filteredTokensData = await promiseAll(tokenData);

  const tokenDeserializedData = [];
  for (let i = 0; i < filteredTokensData.length; i++) {
    const element = filteredTokensData[i];
    const value = element?.data;
    // deserialize buffer data into readable format
    const data = await deserializeProposalData(value);
    tokenDeserializedData.push({ ...element, data: data });
  }
  const finalProposals: Array<any> = tokenDeserializedData.map(
    (proposal: any) => {
      return {
        proposal_id: proposal?.mint?.toString(),
        proposal: proposal?.data?.proposal?.split('\0')[0],
        number_of_votes: proposal?.data?.votes?.length,
        ending_date: Number(proposal?.data?.ending_date?.toString()) * 1000,
        is_ongoing:
          Number(proposal?.data?.duration?.toString()) < 1
            ? true
            : new Date() <
              new Date(Number(proposal?.data?.ending_date?.toString()) * 1000),
        duration: Number(proposal?.data?.duration?.toString()),
      };
    }
  );
  return finalProposals;
};

export const fetchProposal = async (
  wallet: WalletContextState,
  proposal_id: string
  // governor: any
) => {
  const connection = new Connection(CONNECTION_URL);
  const proposalPubkey = new PublicKey(proposal_id);

  const proposalData = await connection.getAccountInfo(proposalPubkey);

  try {
    if (proposalData?.data) {
      const proposal = deserializeProposalData(proposalData?.data);
      const cleanProposal = {
        proposal_id: proposal_id,
        proposal: proposal?.proposal?.split('\0')[0],
        number_of_votes: proposal?.votes?.length,
        max_vote_bump: proposal?.max_vote_bump,
        votes: Object.assign(
          {},
          ...(proposal?.votes?.map((vote: any) => {
            return {
              [new PublicKey(vote?.mint_id).toString()]: {
                governor_id: new PublicKey(vote?.mint_id).toString(),
                choices: vote?.choice_bumps,
                proposal_id: new PublicKey(vote?.proposal_pda).toString(),
              },
            };
          }) ?? null)
        ),
        choices: proposal?.choices
          ?.split('\0')
          .filter((choice: string) => choice.length > 0),
        ending_date: Number(proposal?.ending_date?.toString()) * 1000,
        is_ongoing:
          Number(proposal?.duration?.toString()) < 1
            ? true
            : new Date() <
              new Date(Number(proposal?.ending_date?.toString()) * 1000),
        duration: Number(proposal?.duration?.toString()),
        result: proposal?.result,
      };
      return cleanProposal;
    }
    return new Error('No Data');
  } catch (error) {
    throw new Error('From FetchProposal : ' + error);
  }
};

export const submitVote = async (
  wallet: WalletContextState,
  governorsMint: PublicKey[],
  proposalInfo: any
) => {
  if (!wallet?.connected) return false;
  const connection = new Connection(CONNECTION_URL);

  const payerAccount = {
    pubkey: wallet.publicKey as PublicKey,
    isSigner: true,
    isWritable: true,
  };
  const proposalAccount = {
    pubkey: new PublicKey(proposalInfo?.proposal_id),
    isSigner: false,
    isWritable: true,
  };
  const accounts = [payerAccount, proposalAccount];
  for (let i = 0; i < governorsMint.length; i++) {
    const governorMint = governorsMint[i];

    const governormintAccount = {
      pubkey: governorMint as PublicKey,
      isSigner: false,
      isWritable: false,
    };

    const governortokenAccount = {
      pubkey: await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        governorMint,
        wallet.publicKey as PublicKey
      ),
      isSigner: false,
      isWritable: false,
    };

    const [metadataPDA, metadata_nonce] = await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        metaplexMetadataID.toBuffer(),
        governorMint.toBuffer(),
      ],
      metaplexMetadataID
    );

    const governormetaAccount = {
      pubkey: metadataPDA,
      isSigner: false,
      isWritable: true,
    };

    accounts.push(
      governormintAccount,
      governormetaAccount,
      governortokenAccount
    );
  }

  const sysprogramAccount = {
    pubkey: SystemProgram.programId,
    isSigner: false,
    isWritable: false,
  };

  accounts.push(sysprogramAccount, sysprogramAccount);
  let choices = proposalInfo.options.map((option: any) => option.user_vote);
  const leftLength = 5 - choices.length;
  choices = choices.concat(Array(leftLength).fill(0));
  const instruction_data = Buffer.from([
    2,
    governorsMint.length,
    ...choices,
    create_num_cnt(proposalInfo?.max_vote_bump),
  ]);

  const instruction = new TransactionInstruction({
    keys: accounts,
    data: Buffer.from(instruction_data),
    programId: daoID,
  });

  try {
    const transaction = new Transaction();

    const tx = await transaction.add(instruction);
    tx.feePayer = (await wallet.publicKey) as PublicKey;
    const blockhashObj = await connection.getLatestBlockhash();
    tx.recentBlockhash = await blockhashObj.blockhash;
    const signedTransaction = wallet.signTransaction
      ? await wallet?.signTransaction(tx)
      : null;
    const txn = signedTransaction?.serialize();

    const transactionId = await sendAndConfirmRawTransaction(
      connection,
      txn as Buffer
    );

    return transactionId;
  } catch (error) {
    throw new Error('' + error);
  }
};

export const processProposalResult = async (
  wallet: WalletContextState,
  proposal_id: string
) => {
  const connection = new Connection(CONNECTION_URL);

  const proposalAccount = {
    pubkey: new PublicKey(proposal_id),
    isSigner: false,
    isWritable: true,
  };

  const instruction = new TransactionInstruction({
    keys: [proposalAccount],
    data: Buffer.from([4]),
    programId: daoID,
  });

  try {
    const transaction = new Transaction();

    const tx = await transaction.add(instruction);
    tx.feePayer = (await wallet.publicKey) as PublicKey;
    const blockhashObj = await connection.getLatestBlockhash();
    tx.recentBlockhash = await blockhashObj.blockhash;
    const signedTransaction = wallet.signTransaction
      ? await wallet?.signTransaction(tx)
      : null;
    const txn = signedTransaction?.serialize();

    const transactionId = await sendAndConfirmRawTransaction(
      connection,
      txn as Buffer
    );

    console.log(transactionId);
    const proposal = await fetchProposal(wallet, proposal_id);
    return proposal;
  } catch (error) {
    throw new Error('' + error);
  }
};

export const takeLoan = async (
  wallet: WalletContextState,
  amount: number,
  governorMint: string
) => {
  if (!wallet?.connected) return false;
  const connection = new Connection(CONNECTION_URL);

  const payerAccount = {
    pubkey: wallet.publicKey as PublicKey,
    isSigner: true,
    isWritable: true,
  };
  const governormintAccount = {
    pubkey: new PublicKey(governorMint),
    isSigner: false,
    isWritable: false,
  };

  const [salesPDA, sales_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('sales_pda'), governorProgramID.toBuffer()],
    governorProgramID
  );

  const salesAccount = {
    pubkey: salesPDA,
    isSigner: false,
    isWritable: false,
  };
  const governortokenAccount = {
    pubkey: await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(governorMint),
      wallet.publicKey as PublicKey
    ),
    isSigner: false,
    isWritable: true,
  };
  const [allLoansPDA, allLoans_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('All Governor Loans')],
    governorProgramID
  );

  const allLoansAccount = {
    pubkey: allLoansPDA,
    isSigner: false,
    isWritable: true,
  };

  const governorvaultAccount = {
    pubkey: (await governorVaultID)[0],
    isSigner: false,
    isWritable: true,
  };
  const [governorDataPDA, governor_data_nonce] =
    await PublicKey.findProgramAddress(
      [
        Buffer.from('governor_data_pda'),
        new PublicKey(governorMint).toBuffer(),
      ],
      governorProgramID
    );

  const governordataAccount = {
    pubkey: governorDataPDA,
    isSigner: false,
    isWritable: true,
  };

  const splprogramAccount = {
    pubkey: TOKEN_PROGRAM_ID,
    isSigner: false,
    isWritable: false,
  };
  const sysprogramAccount = {
    pubkey: SystemProgram.programId,
    isSigner: false,
    isWritable: false,
  };
  const assocprogramAccount = {
    pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
    isSigner: false,
    isWritable: false,
  };
  const rentAccount = {
    pubkey: SYSVAR_RENT_PUBKEY,
    isSigner: false,
    isWritable: false,
  };
  const clockAccount = {
    pubkey: SYSVAR_CLOCK_PUBKEY,
    isSigner: false,
    isWritable: false,
  };

  let bump = 0;
  let found = '';
  while (found == '') {
    const [storagePDA, storage_nonce] = await PublicKey.findProgramAddress(
      [
        Buffer.from('Loan_Storage'),
        payerAccount.pubkey.toBuffer(),
        toBytesInt32(bump),
      ],
      governorProgramID
    );
    const storageData = await connection.getAccountInfo(storagePDA);

    if (storageData?.data) {
      bump += 1;
      found = '';
    } else {
      found = storagePDA.toString();
      break;
    }
  }

  const storageAccount = {
    pubkey: new PublicKey(found),
    isSigner: false,
    isWritable: true,
  };

  const storagetokenAccount = {
    pubkey: await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      governormintAccount.pubkey,
      new PublicKey(found),
      true
    ),
    isSigner: false,
    isWritable: true,
  };

  const lowerDigit = create_num_cnt(Math.round(amount * 1000) % 1000);

  const upperDigit = create_num_cnt(
    Math.round((amount * 1000 - (Math.round(amount * 1000) % 1000)) / 1000)
  );

  const instruction = new TransactionInstruction({
    keys: [
      payerAccount,
      governormintAccount,
      salesAccount,
      governortokenAccount,
      allLoansAccount,
      storageAccount,
      storagetokenAccount,
      governorvaultAccount,
      governordataAccount,
      splprogramAccount,
      sysprogramAccount,
      rentAccount,
      clockAccount,

      assocprogramAccount,
      splprogramAccount,
      sysprogramAccount,
    ],
    data: Buffer.from([
      2,
      ...upperDigit,
      ...lowerDigit,
      ...create_num_cnt(bump),
    ]),
    programId: governorProgramID,
  });

  try {
    const transaction = new Transaction();

    const tx = await transaction.add(instruction);
    tx.feePayer = (await wallet.publicKey) as PublicKey;
    const blockhashObj = await connection.getLatestBlockhash();
    tx.recentBlockhash = await blockhashObj.blockhash;
    const signedTransaction = wallet.signTransaction
      ? await wallet?.signTransaction(tx)
      : null;
    const txn = signedTransaction?.serialize();

    const transactionId = await sendAndConfirmRawTransaction(
      connection,
      txn as Buffer
    );

    return transactionId;
  } catch (error) {
    throw new Error('' + error);
  }
};

export const fetchLoanHistory = async (wallet: WalletContextState) => {
  if (!wallet.connected) {
    console.log('Wallet not connected');
    return;
  }
  const connection = new Connection(CONNECTION_URL);
  const [allLoansPDA, allLoans_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('All Governor Loans')],
    governorProgramID
  );

  const allLoansInfo = await connection.getAccountInfo(allLoansPDA);
  let allLoansData = deserializeallLoansData(allLoansInfo?.data as Buffer);

  allLoansData = allLoansData?.all_loans?.filter((loanLoc: any) => {
    return (
      new PublicKey(loanLoc?.payer).toString() === wallet.publicKey?.toString()
    );
  });
  const allLoansPromise = [];

  for (let i = 0; i < allLoansData.length; i++) {
    const promise = new Promise((resolve, reject) => {
      try {
        (async () => {
          const [loanPDA, loan_nonce] = await PublicKey.findProgramAddress(
            [
              Buffer.from('Loan_Storage'),
              wallet?.publicKey?.toBuffer() as Buffer,
              toBytesInt32(allLoansData[i]?.bump),
            ],
            governorProgramID
          );
          const loanInfo = await connection.getAccountInfo(loanPDA);
          if (!loanInfo?.data) throw new Error('No data in loanPDA');

          const data = deserializeLoanData(loanInfo?.data as Buffer);
          resolve({ ...data, bump: allLoansData[i]?.bump });
        })();
      } catch (error) {
        reject(error);
      }
    });
    allLoansPromise.push(promise);
  }

  const filteredPromiseData = await promiseAll(allLoansPromise);

  const salesData = await getGovernorMintPrice();
  const governorPrice =
    Number(salesData?.vault_total.toString()) / 10 ** 9 / salesData?.counter;

  const finalLoans: Array<any> = filteredPromiseData.map((loan: any) => {
    return {
      governor_id: new PublicKey(loan?.mint).toString(),
      governor_backing: governorPrice,
      image_ref: '',
      loan_amount: Number(loan?.initial_amount.toString()) / 10 ** 9,
      loan_date: new Date(loan?.initial_loan_date * 1000).toLocaleDateString(),
      interate_rate:
        loan?.monthly_interest_numerator / loan?.monthly_interest_denominator,
      unpaid_loan: loan?.amount_left / 10 ** 9,
      is_blocked: Boolean(loan?.is_loan_active),
      bump: loan?.bump,
    };
  });
  return finalLoans;
};

export const payLoan = async (
  wallet: WalletContextState,
  amount: number,
  governorMint: string,
  bump: number
) => {
  if (!wallet?.connected) return false;
  const connection = new Connection(CONNECTION_URL);

  const payerAccount = {
    pubkey: wallet.publicKey as PublicKey,
    isSigner: true,
    isWritable: true,
  };
  const governormintAccount = {
    pubkey: new PublicKey(governorMint),
    isSigner: false,
    isWritable: false,
  };

  const governortokenAccount = {
    pubkey: await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      new PublicKey(governorMint),
      wallet.publicKey as PublicKey
    ),
    isSigner: false,
    isWritable: true,
  };
  const [allLoansPDA, allLoans_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('All Governor Loans')],
    governorProgramID
  );

  const allLoansAccount = {
    pubkey: allLoansPDA,
    isSigner: false,
    isWritable: true,
  };

  const governorvaultAccount = {
    pubkey: (await governorVaultID)[0],
    isSigner: false,
    isWritable: true,
  };

  const [salesPDA, sales_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('sales_pda'), governorProgramID.toBuffer()],
    governorProgramID
  );

  const salesAccount = {
    pubkey: salesPDA,
    isSigner: false,
    isWritable: true,
  };
  const splprogramAccount = {
    pubkey: TOKEN_PROGRAM_ID,
    isSigner: false,
    isWritable: false,
  };
  const sysprogramAccount = {
    pubkey: SystemProgram.programId,
    isSigner: false,
    isWritable: false,
  };
  const assocprogramAccount = {
    pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
    isSigner: false,
    isWritable: false,
  };

  const clockAccount = {
    pubkey: SYSVAR_CLOCK_PUBKEY,
    isSigner: false,
    isWritable: false,
  };
  const [storagePDA, storage_nonce] = await PublicKey.findProgramAddress(
    [
      Buffer.from('Loan_Storage'),
      payerAccount.pubkey.toBuffer(),
      toBytesInt32(bump),
    ],
    governorProgramID
  );

  const storageAccount = {
    pubkey: storagePDA,
    isSigner: false,
    isWritable: true,
  };

  const storagetokenAccount = {
    pubkey: await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      governormintAccount.pubkey,
      storagePDA,
      true
    ),
    isSigner: false,
    isWritable: true,
  };

  const lowerDigit = create_num_cnt(Math.round(amount * 1000) % 1000);

  const upperDigit = create_num_cnt(
    Math.round((amount * 1000 - (Math.round(amount * 1000) % 1000)) / 1000)
  );

  const instruction = new TransactionInstruction({
    keys: [
      payerAccount,
      governortokenAccount,
      allLoansAccount,
      storageAccount,
      storagetokenAccount,
      governorvaultAccount,
      clockAccount,
      salesAccount,
      splprogramAccount,

      sysprogramAccount,
      assocprogramAccount,
      splprogramAccount,
      sysprogramAccount,
    ],
    data: Buffer.from([
      4,
      ...upperDigit,
      ...lowerDigit,
      ...create_num_cnt(bump),
    ]),
    programId: governorProgramID,
  });

  try {
    const transaction = new Transaction();

    const tx = await transaction.add(instruction);
    tx.feePayer = (await wallet.publicKey) as PublicKey;
    const blockhashObj = await connection.getLatestBlockhash();
    tx.recentBlockhash = await blockhashObj.blockhash;
    const signedTransaction = wallet.signTransaction
      ? await wallet?.signTransaction(tx)
      : null;
    const txn = signedTransaction?.serialize();

    const transactionId = await sendAndConfirmRawTransaction(
      connection,
      txn as Buffer
    );

    return transactionId;
  } catch (error) {
    throw new Error('' + error);
  }
};

export const borrowMoreLoan = async (
  wallet: WalletContextState,
  amount: number,
  governorMint: string,
  bump: number
) => {
  if (!wallet?.connected) return false;
  const connection = new Connection(CONNECTION_URL);

  const payerAccount = {
    pubkey: wallet.publicKey as PublicKey,
    isSigner: true,
    isWritable: true,
  };

  const [salesPDA, sales_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('sales_pda'), governorProgramID.toBuffer()],
    governorProgramID
  );

  const salesAccount = {
    pubkey: salesPDA,
    isSigner: false,
    isWritable: false,
  };

  const [allLoansPDA, allLoans_nonce] = await PublicKey.findProgramAddress(
    [Buffer.from('All Governor Loans')],
    governorProgramID
  );

  const governorvaultAccount = {
    pubkey: (await governorVaultID)[0],
    isSigner: false,
    isWritable: true,
  };
  const [governorDataPDA, governor_data_nonce] =
    await PublicKey.findProgramAddress(
      [
        Buffer.from('governor_data_pda'),
        new PublicKey(governorMint).toBuffer(),
      ],
      governorProgramID
    );

  const splprogramAccount = {
    pubkey: TOKEN_PROGRAM_ID,
    isSigner: false,
    isWritable: false,
  };
  const sysprogramAccount = {
    pubkey: SystemProgram.programId,
    isSigner: false,
    isWritable: false,
  };
  const assocprogramAccount = {
    pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
    isSigner: false,
    isWritable: false,
  };

  const clockAccount = {
    pubkey: SYSVAR_CLOCK_PUBKEY,
    isSigner: false,
    isWritable: false,
  };
  const [storagePDA, storage_nonce] = await PublicKey.findProgramAddress(
    [
      Buffer.from('Loan_Storage'),
      payerAccount.pubkey.toBuffer(),
      toBytesInt32(bump),
    ],
    governorProgramID
  );

  const storageAccount = {
    pubkey: storagePDA,
    isSigner: false,
    isWritable: true,
  };

  const lowerDigit = create_num_cnt(Math.round(amount * 1000) % 1000);

  const upperDigit = create_num_cnt(
    Math.round((amount * 1000 - (Math.round(amount * 1000) % 1000)) / 1000)
  );

  const instruction = new TransactionInstruction({
    keys: [
      payerAccount,
      storageAccount,
      governorvaultAccount,
      salesAccount,
      clockAccount,

      sysprogramAccount,
      assocprogramAccount,
      splprogramAccount,
      sysprogramAccount,
    ],
    data: Buffer.from([
      6,
      ...upperDigit,
      ...lowerDigit,
      ...create_num_cnt(bump),
    ]),
    programId: governorProgramID,
  });

  try {
    const transaction = new Transaction();

    const tx = await transaction.add(instruction);
    tx.feePayer = (await wallet.publicKey) as PublicKey;
    const blockhashObj = await connection.getLatestBlockhash();
    tx.recentBlockhash = await blockhashObj.blockhash;
    const signedTransaction = wallet.signTransaction
      ? await wallet?.signTransaction(tx)
      : null;
    const txn = signedTransaction?.serialize();

    const transactionId = await sendAndConfirmRawTransaction(
      connection,
      txn as Buffer
    );

    return transactionId;
  } catch (error) {
    throw new Error('' + error);
  }
};
