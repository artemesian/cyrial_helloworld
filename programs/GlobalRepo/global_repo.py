from solana.publickey import PublicKey
from spl.token.instructions import get_associated_token_address


GOVERNOR_PROGRAM_ID = PublicKey("8Ga7yNCYJiJ6HLTZMu14iNh6una9AGZvuM4n9napx1v3")
GOVERNOR_VAULT_ID = PublicKey("25N4Q6k5PPFmeqAco84y7UuM1w9bNmyJdssoJLJ9GqXv")
VAULT = PublicKey("G473EkeR5gowVn8CRwTSDop3zPwaNixwp62qi7nyVf4z")
AVATAR_PROGRAM_ID = PublicKey("ASV3UahwSK3oRmNkkbyhFNSRSaccL2jJvAYCYQa8RSgG")
DAO_PROGRAM_ID = PublicKey("DrSryh4M2nYyRSqgDNMiASK73LSoZrN56oHWXaAcnmCt")
DSOL_PROGRAM_ID = PublicKey("4zTDFeuFhdevrJ8rnoZum8m9dgoLqdMEFnPhgDhRCG16")
TABLES_PROGRAM_ID = PublicKey("7fmmvCJ1uH4sfLCdZrDAjJnfHejwtFbYL7aG8nnNR6Yz")
MARKETPLACE_PROGRAM_ID = PublicKey("5hLihu5RjNSTPFFGP2nurV3xnJCeLj12WJXgphRDVMvE")
DSOL_MINT_ID = PublicKey("HSYdApQF2FKVNnX6FQ1ySYstGLe5Gp8NseHVFavWye66")
VAULT_DSOL_ASSOCIATED_ID = get_associated_token_address(VAULT, DSOL_MINT_ID)
METAPLEX_PROGRAM_ID = PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")