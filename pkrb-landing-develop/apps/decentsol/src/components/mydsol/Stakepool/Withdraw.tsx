import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Typography,
  useTheme,
} from '@mui/material';
import { injectIntl, IntlShape } from 'react-intl';
import DSOL_TOKEN from '../../../assets/images/dsol_token.png';
import SOLANA_LOGO from '../../../assets/images/sol_logo.png';
import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  getAvailableLiquidSol,
  getStakePool,
  withdrawUserSol,
} from '@temp-workspace/blockchain/dsol-chain';

export function Withdraw({ intl: { formatMessage } }: { intl: IntlShape }) {
  const theme = useTheme();

  const [liquidSolAmount, setLiquidSolAmount] = useState<number | undefined>(
    undefined
  );
  const [isLiquidSolAmountLoading, setIsLiquidSolAmountLoading] =
    useState<boolean>(true);

  const [rewardsAmount, setRewardsAmount] = useState<number | undefined>(
    undefined
  );
  const [isRewardsAmountLoading, setIsRewardsAmountLoading] =
    useState<boolean>(true);

  const [solValue, setSolValue] = useState<number | undefined>(undefined);
  const [isSolValueLoading, setIsSolValueLoading] = useState<boolean>(true);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);

  const wallet = useWallet();

  const getUserLiquidSol = async () => {
    setIsLiquidSolAmountLoading(true);
    setIsSolValueLoading(true);
    const availableLiquidSol = await getAvailableLiquidSol(wallet);
    const liquidSolRatio = await getLiquidSolToSolRatio();

    setSolValue(liquidSolRatio * availableLiquidSol);
    setLiquidSolAmount(availableLiquidSol);
    setIsLiquidSolAmountLoading(false);
    setIsSolValueLoading(false);
  };

  const getLiquidSolToSolRatio = async () => {
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
    return result;
  };

  const withdrawSol = async () => {
    setIsWithdrawing(true);
    await withdrawUserSol(wallet, liquidSolAmount as number);
    await getUserLiquidSol();
    setIsWithdrawing(false);
  };

  useEffect(() => {
    if (!wallet.connected) {
      console.log('Connect wallet');
      return;
    }
    getUserLiquidSol();
  }, [wallet.connected]);

  useEffect(() => {
    setTimeout(() => {
      //TODO: FETCH AMOUNT OF USER REWARDS HERE
      const rewardsAmount_example = 30;
      setRewardsAmount(rewardsAmount_example);
      setIsRewardsAmountLoading(false);
    }, 3000);
  }, []);

  const handleStakeWithdraw = () => {
    //TODO: FETCH API TO STAKE HERE the value staked is "stakeValue"
    withdrawSol();
  };

  return (
    <Box sx={{ padding: '0 7%', textAlign: 'center' }}>
      <Typography
        variant="h1"
        sx={{ textAlign: 'center', marginTop: theme.spacing(5) }}
      >
        {formatMessage({ id: 'withdrawSol' })}
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
        variant="h4"
        sx={{
          textAlign: 'center',
          fontFamily: 'lato',
          marginTop: theme.spacing(3),
        }}
      >
        Withdraw your Staked SOL and DSOL Tokens
        {/* {formatMessage({ id: "withdrawmessage" })} */}
      </Typography>
      {isRewardsAmountLoading ? (
        <Box
          sx={{
            display: 'grid',
            justifyContent: 'center',
            marginBottom: theme.spacing(0.5),
          }}
        >
          <Skeleton
            variant="circular"
            sx={{
              marginTop: theme.spacing(7),
              height: '50px',
              width: '50px',
            }}
          />
        </Box>
      ) : (
        <Typography
          sx={{
            color: theme.common.placeholder,
            textAlign: 'center',
            marginTop: theme.spacing(7),
          }}
          variant="h2"
        >
          {rewardsAmount}
        </Typography>
      )}
      <Typography variant="h4" sx={{ color: theme.common.placeholder }}>
        {formatMessage({ id: 'dsolTokenRewards' })}
      </Typography>
      <Typography
        variant="h5"
        sx={{ color: theme.common.placeholder, fontFamily: 'lato' }}
      >
        {formatMessage({ id: 'sinceLastClaim' })}
      </Typography>

      {isLiquidSolAmountLoading ? (
        <Box
          sx={{
            display: 'grid',
            justifyContent: 'center',
            marginBottom: theme.spacing(0.5),
          }}
        >
          <Skeleton
            variant="circular"
            sx={{
              marginTop: theme.spacing(7),
              height: '50px',
              width: '50px',
            }}
          />
        </Box>
      ) : (
        <Typography
          variant="h1"
          sx={{
            marginTop: theme.spacing(7),
          }}
        >
          {liquidSolAmount}
        </Typography>
      )}

      <Typography variant="h4" sx={{ fontFamily: 'lato' }}>
        {formatMessage({ id: 'liquidSol' })}
      </Typography>
      {isSolValueLoading ? (
        <Box
          sx={{
            display: 'grid',
            justifyContent: 'center',
            marginBottom: theme.spacing(0.5),
          }}
        >
          <Skeleton variant="text" width="200px" height="20px" />
        </Box>
      ) : (
        <Typography
          variant="h5"
          sx={{ color: theme.common.placeholder, fontFamily: 'lato' }}
        >
          {`${formatMessage({ id: 'liquidSolEquivalence' })} ${solValue} SOL`}
        </Typography>
      )}

      <Button
        variant="contained"
        size="large"
        fullWidth
        sx={{ marginTop: theme.spacing(10) }}
        onClick={handleStakeWithdraw}
        disabled={isWithdrawing || isLiquidSolAmountLoading}
      >
        {isWithdrawing && (
          <CircularProgress
            color="primary"
            size="30px"
            sx={{
              padding: theme.spacing(0.5),
              marginRight: theme.spacing(0.5),
            }}
          />
        )}
        {isWithdrawing
          ? formatMessage({ id: 'withdrawing...' })
          : formatMessage({ id: 'withdrawSol' })}
      </Button>
    </Box>
  );
}

export default injectIntl(Withdraw);
