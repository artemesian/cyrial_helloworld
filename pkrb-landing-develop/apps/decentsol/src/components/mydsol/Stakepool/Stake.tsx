import {
  Box,
  Typography,
  useTheme,
  Avatar,
  AvatarGroup,
  Skeleton,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { injectIntl, IntlShape } from 'react-intl';
import DSOL_TOKEN from '../../../assets/images/dsol_token.png';
import SOLANA_LOGO from '../../../assets/images/sol_logo.png';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Connection } from '@metaplex/js';
import {
  stakeSol,
  getStakePoolTotalSol,
  getStakePool,
} from '@temp-workspace/blockchain/dsol-chain';

export function Stake({ intl: { formatMessage } }: { intl: IntlShape }) {
  const theme = useTheme();
  const [userSol, setUserSol] = useState<number>(4.25);
  const [isUserSolLoading, setIsUserSolLoading] = useState<boolean>(true);
  const [isStakePoolSolLoading, setIsStakePoolSolLoading] =
    useState<boolean>(true);

  const [stakeValue, setStakeValue] = useState<number | undefined>(undefined);
  const [stakePoolValue, setStakePoolValue] = useState<number | undefined>(
    undefined
  );
  const wallet = useWallet();
  const connection = new Connection('devnet');

  const getBalance = async () => {
    setIsUserSolLoading(true);
    const balance = await connection.getBalance(wallet.publicKey as PublicKey);
    setUserSol(Number((balance / 10 ** 9).toFixed(2)));
    setIsUserSolLoading(false);
  };

  const getLiquidSolToSolRatio = async () => {
    setIsStakePoolSolLoading(true);
    const stakepool = await getStakePool();
    const Tsol = Number(stakepool.account.data.totalLamports.toString());
    const TLsol = Number(stakepool.account.data.totalLamports.toString());
    const denominator = Number(
      stakepool.account.data.solWithdrawalFee.denominator.toString()
    );
    const numerator = Number(
      stakepool.account.data.solWithdrawalFee.numerator.toString()
    );

    const result = (Tsol / TLsol) * (1 - numerator / denominator);
    setStakePoolValue(result);
    setIsStakePoolSolLoading(false);
  };

  useEffect(() => {
    //TODO: FETCH THE USER SOL HERE
    if (!wallet.connected) {
      console.log('Connect wallet');
      return;
    }
    console.log('Total: ', getStakePoolTotalSol());
    getBalance();
    getLiquidSolToSolRatio();
  }, [wallet.connected]);

  const [isStaking, setIsStaking] = useState<boolean>(false);

  const handleUserStake = async () => {
    //TODO: FETCH API TO STAKE HERE the value staked is "stakeValue"
    if (stakeValue && stakeValue > 0) {
      setIsStaking(true);
      const stake = await stakeSol(stakeValue, wallet);
      console.log(stake);
      await getBalance();
      setIsStaking(false);
    } else alert('your stake must be greater than 0');
  };

  return (
    <Box sx={{ padding: '0 7%' }}>
      <Typography
        variant="h1"
        sx={{ textAlign: 'center', marginTop: theme.spacing(5) }}
      >
        {formatMessage({ id: 'startStaking' })}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          justifyContent: 'center',
          marginTop: theme.spacing(5),
        }}
      >
        <AvatarGroup
          max={4}
          sx={{
            '& .MuiAvatar-root': {
              border: 'none',
              marginLeft: 0,
            },
            '& .MuiAvatar-root:first-child': {
              zIndex: 1,
              marginLeft: '-12px',
            },
          }}
        >
          <Avatar
            sx={{ width: '55px', height: '55px' }}
            alt="Dsol tokens"
            src={DSOL_TOKEN}
          />
          <Avatar
            sx={{ width: '55px', height: '55px' }}
            alt="Solana"
            src={SOLANA_LOGO}
          />
        </AvatarGroup>
      </Box>
      <Typography
        sx={{
          textAlign: 'center',
          fontFamily: 'lato',
          marginTop: theme.spacing(3),
          ...theme.typography.h4Regular,
        }}
      >
        Stake SOL to earn LiquidSOL and DSOL Tokens
        {/* {formatMessage({ id: "stakeMessage" })} */}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: theme.spacing(1),
          marginTop: theme.spacing(8),
        }}
      >
        <Typography variant="h4">
          {formatMessage({ id: 'enterAmount' })}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            justifySelf: 'end',
            gridTemplateColumns: 'auto 1fr',
            gap: theme.spacing(1),
          }}
        >
          <Typography variant="h4" sx={{ color: theme.common.placeholder }}>
            {formatMessage({ id: 'solAvailable' })}
          </Typography>
          {isUserSolLoading ? (
            <Skeleton variant="text" />
          ) : (
            <Typography variant="h4">
              {`${userSol} ${formatMessage({ id: 'sol' })}`}
            </Typography>
          )}
        </Box>
      </Box>
      <TextField
        variant="outlined"
        fullWidth
        type="number"
        placeholder={formatMessage({ id: 'stakePlaceholder' })}
        onChange={(event) => setStakeValue(Number(event.target.value))}
        value={stakeValue}
        sx={{
          marginTop: theme.spacing(1),
          marginBottom: theme.spacing(1),
          '& .MuiOutlinedInput-root': {
            color: 'white',
          },
          '&:hover .MuiInputBase-colorPrimary': {
            border: `1px solid ${theme.common.line}`,
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: `2px solid ${theme.common.line}`,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: `1px solid ${theme.common.line}`,
          },
        }}
      />
      <Box
        sx={{
          display: 'grid',
          justifySelf: 'end',
          gridTemplateColumns: 'auto 1fr',
          gap: theme.spacing(1),
        }}
      >
        <Typography variant="h6" sx={{ color: theme.common.placeholder }}>
          {formatMessage({ id: 'liquidSolToReceive' })}
        </Typography>
        {isStakePoolSolLoading ? (
          <Skeleton variant="text" />
        ) : (
          <Typography variant="h6">
            {`${
              stakeValue ? stakeValue * (stakePoolValue ?? 0) : 0
            } ${formatMessage({
              id: 'liquidSol',
            })}`}
          </Typography>
        )}
      </Box>
      <Button
        variant="contained"
        size="large"
        fullWidth
        sx={{ marginTop: theme.spacing(5) }}
        onClick={handleUserStake}
        disabled={isStaking}
      >
        {isStaking && (
          <CircularProgress
            color="primary"
            size="30px"
            sx={{
              padding: theme.spacing(0.5),
              marginRight: theme.spacing(0.5),
            }}
          />
        )}
        {isStaking
          ? formatMessage({ id: 'staking...' })
          : formatMessage({ id: 'stakeNow' })}
      </Button>
    </Box>
  );
}

export default injectIntl(Stake);
