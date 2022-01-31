import "./App.css";
import { useEffect, useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import {
  Connection,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { DEVNET_CONNECTION_URL } from "./constants";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as bs58 from "bs58";

/* create an account  */
const baseAccount = Keypair.generate();
const opts = {
  preflightCommitment: "confirmed",
};
const programID = new PublicKey("2phudof8deCE1L4pKpKhXyTuoBof77cMofTXxLqhHizn");

const App = () => {
  const wallet = useWallet();
  const [isAirdropping, setIsAirdropping] = useState(false);

  const establishConnection = () => {
    const network = DEVNET_CONNECTION_URL;
    const connection = new Connection(network, opts.preflightCommitment);
    console.log("Connection to cluster established:", network);
    return connection;
  };

  const requestAirdrop = async () => {
    setIsAirdropping(true);
    try {
      let connection = establishConnection();
      let airdropSignature = await connection.requestAirdrop(
        wallet.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      connection
        .confirmTransaction(airdropSignature)
        .then((response) => {
          console.log("Response from Airdrop: ", response);
          console.log(
            `${wallet.publicKey} has received ${2 * LAMPORTS_PER_SOL}`
          );
        })
        .catch()
        .finally(() => setIsAirdropping(false));
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  useEffect(() => {
    establishConnection();
  }, []);

  const mintAvatar = async () => {
    let payerAccount = {
      pubkey: wallet.publicKey,
      isSigner: true,
      isWritable: true,
    };
    let vaultAccount = {
      pubkey: Keypair.generate(),
      isSigner: false,
      isWritable: true,
    };
    let mintAccount = {
      pubkey: Keypair.generate(),
      isSigner: false,
      isWritable: false,
    };
    let splprogramAccount = {
      pubkey: TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };
    let sysprogramAccount = {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    };
    let assocprogramAccount = {
      pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
      isSigner: false,
      isWritable: false,
    };
    let rentAccount = {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    };
    let [mintAuthority, bump] = await PublicKey.findProgramAddress(
      [Buffer.from("cyrial_pda")],
      programID
    );

    let mintauthAccount = {
      pubkey: mintAuthority,
      isSigner: false,
      isWritable: false,
    };

    console.log(mintAuthority);
    // let mintInstruction = TransactionInstruction({
    //   keys: [{}],
    // });
    //   accounts = [
    //     # program_id_account_meta,
    //     payer_account_meta,
    //     vault_account_meta,
    //     mint_account_meta,
    //     rent_account_meta,
    //     associated_account_meta,
    //     spl_program_meta,
    //     AccountMeta(SYS_PROGRAM_ID, False, False),
    //     AccountMeta(mint_authority, False, False),

    //     spl_program_meta,
    //     AccountMeta(ASSOCIATED_TOKEN_PROGRAM_ID, False, False),
    //     spl_program_meta,
    //     ]

    // transaction = Transaction()
    // transaction.add(TransactionInstruction(
    //     accounts,
    //     program_id,
    //     bytes([])
    // ))
    // client.send_transaction(transaction, payer_keypair, mint_account)
  };

  // async function createCounter() {
  //   const provider = await getProvider();
  //   /* create the program interface combining the idl, program ID, and provider */
  //   const program = new Program(idl, programID, provider);
  //   try {
  //     /* interact with the program via rpc */
  //     await program.rpc.create({
  //       accounts: {
  //         baseAccount: baseAccount.publicKey,
  //         user: provider.wallet.publicKey,
  //         systemProgram: SystemProgram.programId,
  //       },
  //       signers: [baseAccount],
  //     });

  //     const account = await program.account.baseAccount.fetch(
  //       baseAccount.publicKey
  //     );
  //     console.log("account: ", account);
  //     setValue(account.count.toString());
  //   } catch (err) {
  //     console.log("Transaction error: ", err);
  //   }
  // }

  // async function increment() {
  //   const provider = await getProvider();
  //   const program = new Program(idl, programID, provider);
  //   await program.rpc.increment({
  //     accounts: {
  //       baseAccount: baseAccount.publicKey,
  //     },
  //   });

  //   const account = await program.account.baseAccount.fetch(
  //     baseAccount.publicKey
  //   );
  //   console.log("account: ", account);
  //   setValue(account.count.toString());
  // }

  return (
    <div className="App">
      <Box padding={1.75} display={"flex"} justifyContent={"flex-end"}>
        <WalletMultiButton />
      </Box>
      <Box>
        <Container>
          <Typography component={"h4"} variant={"h4"}>
            My Avatars
          </Typography>
          <Box
            width={"100%"}
            minHeight={"500px"}
            height={"auto"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            margin={"20px 0"}
            backgroundColor={"#e0e0e099"}
            borderRadius={"15px"}
          >
            No avatar yet minted
          </Box>
        </Container>
        <Box>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => mintAvatar()}
          >
            Mint an Avatar
          </Button>
          <Button onClick={() => requestAirdrop()}>
            {isAirdropping ? "Airdropping..." : "Airdrop 2 SOL"}
          </Button>
        </Box>
      </Box>
    </div>
  );
};

export default App;
