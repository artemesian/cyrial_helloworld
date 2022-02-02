import "./App.css";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  CardActions,
  CardMedia,
  CardContent,
} from "@mui/material";
import {
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { Connection, programs } from "@metaplex/js";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Token,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const programID = new PublicKey("9qm7AEJFHQ8SqJrmfofWK6maWRwKvQwK8uy8w3PVZLQw");
const metaplexMetadataID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const App = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isAirdropping, setIsAirdropping] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [tokens, setTokens] = useState([]);

  const requestAirdrop = async () => {
    if (wallet.publicKey === null) {
      console.log("Connect your wallet first");
      return false;
    }
    setIsAirdropping(true);
    try {
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
      setIsAirdropping(false);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, [wallet]);

  const fetchNFTs = async () => {
    setIsFetching(true);
    const {
      metadata: { Metadata },
    } = programs;
    const connection = new Connection("devnet");
    let finalTokens = [];

    let response = await connection.getParsedTokenAccountsByOwner(
      wallet.publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );
    let tokens = response.value.map((data) => {
      let token = data.account.data.parsed.info;
      return token;
    });
    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      var metadata;
      try {
        const metadataPDA = await Metadata.getPDA(new PublicKey(token.mint));
        metadata = await Metadata.load(connection, metadataPDA);
      } catch (error) {
        console.log("Error When Fetching Metadata: ", error);
      }
      let metadataURI = metadata.data.data.uri;

      let tokenURIDATA = await fetch(metadataURI);
      tokenURIDATA = await tokenURIDATA.json();

      finalTokens.push({
        ...token,
        metadata: tokenURIDATA,
      });
    }
    setTokens(finalTokens);
    setIsFetching(false);
  };

  const mintAvatar = async () => {
    let payerAccount = {
      pubkey: wallet.publicKey,
      isSigner: true,
      isWritable: true,
    };
    let vaultAccount = {
      pubkey: new PublicKey("G473EkeR5gowVn8CRwTSDop3zPwaNixwp62qi7nyVf4z"),
      isSigner: false,
      isWritable: true,
    };
    let mintKeypair = Keypair.generate();
    let mintAccount = {
      pubkey: mintKeypair.publicKey,
      isSigner: true,
      isWritable: true,
    };
    let assoctokenAccount = {
      pubkey: await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mintAccount.pubkey,
        wallet.publicKey
      ),
      isSigner: false,
      isWritable: true,
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
    let clockAccount = {
      pubkey: SYSVAR_CLOCK_PUBKEY,
      isSigner: false,
      isWritable: false,
    };
    let metaplexmetadataAccount = {
      pubkey: SYSVAR_CLOCK_PUBKEY,
      isSigner: false,
      isWritable: false,
    };
    let [mintAuthorityPDA, mint_nonce] = await PublicKey.findProgramAddress(
      [Buffer.from("cyrial_pda")],
      programID
    );
    let [avatarDataPDA, avatar_nonce] = await PublicKey.findProgramAddress(
      [
        Buffer.from("avatar_data_pda"),
        mintAccount.pubkey.toBuffer(),
        assoctokenAccount.pubkey.toBuffer(),
      ],
      programID
    );
    let [salesPDA, sales_nonce] = await PublicKey.findProgramAddress(
      [Buffer.from("sales_pda"), programID.toBuffer()],
      programID
    );
    let [metadataPDA, metadata_nonce] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        metaplexMetadataID.toBuffer(),
        mintAccount.pubkey.toBuffer(),
      ],
      metaplexMetadataID
    );
    let mintauthAccount = {
      pubkey: mintAuthorityPDA,
      isSigner: false,
      isWritable: false,
    };
    let avatardataAccount = {
      pubkey: avatarDataPDA,
      isSigner: false,
      isWritable: true,
    };
    let salesAccount = {
      pubkey: salesPDA,
      isSigner: false,
      isWritable: true,
    };
    let tokenmetadataAccount = {
      pubkey: metadataPDA,
      isSigner: false,
      isWritable: true,
    };
    let mintInstruction = new TransactionInstruction({
      keys: [
        payerAccount,
        vaultAccount,
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
      programId: programID,
    });
    let transaction = new Transaction();
    // let transactionSig = await sendAndConfirmTransaction(
    //   connection,
    //   mintTransaction,
    //   [wallet]
    // );
    let tx = await transaction.add(mintInstruction);
    // console.log(
    //   payerAccount.pubkey.toBase58(),
    //   mintAccount.pubkey.toBase58(),
    //   mintKeypair.publicKey.toBase58()
    // );
    tx.feePayer = await wallet.publicKey;
    let blockhashObj = await connection.getRecentBlockhash();
    tx.recentBlockhash = await blockhashObj.blockhash;
    tx.sign(...[wallet, mintKeypair]);
    const signedTransaction = await wallet.signTransaction(tx);
    var test = signedTransaction.serialize();
    const transactionId = await connection.sendRawTransaction(test);
    console.log(transactionId);
    // const signature = await wallet.sendTransaction(transaction, connection, {
    //   signers: [wallet, mintKeypair],
    // });
    // await connection.confirmTransaction(signature, "processed");
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
            padding={"20px 0"}
          >
            <Container>
              {isFetching ? (
                "Fetching...."
              ) : tokens.length === 0 ? (
                "No avatar yet minted"
              ) : (
                <Box
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"flex-start"}
                  flexWrap={"wrap"}
                >
                  {tokens.map((token, index) => (
                    <Box key={index} margin={"10px"}>
                      <Card sx={{ width: 250 }}>
                        <CardMedia
                          component="img"
                          height="100%"
                          image={token.metadata.image}
                          alt="green iguana"
                        />
                        <CardContent style={{ textAlign: "left" }}>
                          <Typography gutterBottom variant="h5" component="div">
                            {token.metadata.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <span
                              style={{
                                fontWeight: "bold",
                                paddingRight: "1px",
                              }}
                            >
                              Symbol:{" "}
                            </span>
                            {token.metadata.symbol} <br />
                            <span
                              style={{
                                fontWeight: "bold",
                                paddingRight: "1px",
                              }}
                            >
                              Collection:
                            </span>
                            {token.metadata.collection.name}
                            <br />
                            <span
                              style={{
                                fontWeight: "bold",
                                paddingRight: "1px",
                              }}
                            >
                              Description:
                            </span>
                            {token.metadata.description}
                            <br />
                          </Typography>
                        </CardContent>
                        <CardActions>
                          {token.state === "frozen" ? (
                            <Button size="small" color="error">
                              <span style={{ color: "gray" }}>state:</span>{" "}
                              LOCKED
                            </Button>
                          ) : (
                            <Button size="small" color="success">
                              <span style={{ color: "gray" }}>state:</span>{" "}
                              UNLOCKED
                            </Button>
                          )}
                        </CardActions>
                      </Card>
                    </Box>
                  ))}
                </Box>
              )}
            </Container>
          </Box>
        </Container>
        <Box marginBottom={"50px"}>
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
