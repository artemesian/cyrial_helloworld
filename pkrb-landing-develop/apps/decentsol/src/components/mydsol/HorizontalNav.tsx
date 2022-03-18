import {
  Box,
  Button,
  CircularProgress,
  TextField,
  useTheme,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { injectIntl, IntlShape } from 'react-intl';
import { lighten } from '@mui/system';
import { useLocation } from 'react-router';
import { NavLink } from 'react-router-dom';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AccountBalanceWalletTwoTone } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { Connection } from '@metaplex/js';
import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const useStyles = makeStyles((theme: any) => ({
  navLink: {
    cursor: 'pointer',
    textDecoration: 'none',
    justifySelf: 'center',
    color: theme.common.offWhite,
    '&.active': {
      color: '#F3B644',
      textShadow: '0px 0px 16px #F3B644',
    },
  },
  wallet: {
    justifySelf: 'right',
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
    color: theme.common.green,
    borderRadius: '5px',
    backgroundColor: 'transparent',
    border: '2px solid #6BBE16',
    transition: 'all ease-in 0.5s',
    '& .MuiButton-startIcon svg g rect': {
      transition: 'fill 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      fill: theme.common.green,
    },
    '&:hover .MuiButton-startIcon svg g rect': {
      transition: 'all ease-in 0.5s',
      fill: lighten('#6BBE16', 0.2),
    },
    '&:hover': {
      transition: 'all ease-in 0.5s',
      color: lighten('#6BBE16', 0.2),
    },
  },
}));

export function InventoryNavLink({
  linkName,
  href,
}: {
  linkName: string;
  href: string;
}): JSX.Element {
  const classes = useStyles();
  return (
    <NavLink to={href} className={classes.navLink}>
      {linkName}
    </NavLink>
  );
}

export function HorizontalNav({ intl }: { intl: IntlShape }): JSX.Element {
  const { formatMessage } = intl;
  const theme = useTheme();
  const [searchValue, setSearchValue] = useState<string>('');
  const [isRequestingAirdrop, setIsRequestingAirdrop] = useState(false);
  const classes = useStyles();
  const wallet = useWallet();

  const handleSearchStakepool = () => {
    //TODO: HANDLE SEARCH OF THE STAKEPOOL HERE
    console.log(`user tried to search "${searchValue}" in stakepool`);
  };
  const handleSearchAvatar = () => {
    //TODO: HANDLE SEARCH OF AVATARS HERE
    console.log(`User tried to searh "${searchValue}" in avatars`);
  };
  const handleSearchGovernor = () => {
    //TODO: HANDLE SEARCH OF GOVERNORS HERE
    console.log(`user tried to search "${searchValue}" in Governors`);
  };
  const handleSearchProposal = () => {
    //TODO: HANDLE SEARCH OF PROPOSALS HERE
    console.log(`user tried to search "${searchValue}" in proposals`);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearchValidator = () => {
    //TODO: HANDLE SEARCH OF VALIDATORS HERE
    console.log(`tried to search in "${searchValue}" validators`);
  };

  const location = useLocation();
  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  useEffect(() => {
    if (searchValue !== '') {
      switch (location.pathname) {
        case '/mydsol/stakepool':
          return handleSearchStakepool();
        case '/mydsol/avatar':
          return handleSearchAvatar();
        case '/mydsol/governor':
          return handleSearchGovernor();
        case '/mydsol/proposal':
          return handleSearchProposal();
        case '/mydsol/validator':
          return handleSearchValidator();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const requestAirdrop = async () => {
    if (!wallet.connected) {
      alert('Please connect your wallet');
      return;
    }
    const connection = new Connection('devnet');
    setIsRequestingAirdrop(true);
    await connection.requestAirdrop(
      wallet?.publicKey as PublicKey,
      2 * LAMPORTS_PER_SOL
    );
    setIsRequestingAirdrop(false);
  };

  useEffect(() => {
    setSearchValue('');
  }, [location.pathname]);

  return (
    <Box
      sx={{
        display: 'grid',
        gridAutoFlow: 'column',
        alignItems: 'center',
        columnGap: '5px',
        padding: '14px 2%',
        borderBottom: `1px solid ${theme.common.line}`,
      }}
    >
      <TextField
        onChange={(event) => {
          handleSearch(event.target.value);
        }}
        value={searchValue}
        sx={{
          width: '75%',
          '& .MuiOutlinedInput-root': {
            color: 'white',
          },
          '&:hover .MuiInputBase-colorPrimary': {
            border: `0.5px solid ${theme.common.line}`,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: `0.5px solid ${theme.common.line}`,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: `0.5px solid ${theme.common.line}`,
          },
        }}
        size="small"
        placeholder={formatMessage({ id: 'searchAvatarId' })}
      />
      <Box
        style={{
          marginLeft: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Button size="large" onClick={() => requestAirdrop()}>
          {isRequestingAirdrop && <CircularProgress size="30px" />}
          Airdrop 2 SOL
        </Button>
        &nbsp; &nbsp;
        <WalletMultiButton
          startIcon={
            <AccountBalanceWalletTwoTone
              style={{ color: theme.common.green }}
            />
          }
          className={classes.wallet}
        ></WalletMultiButton>
      </Box>
    </Box>
  );
}

export default injectIntl(HorizontalNav);
