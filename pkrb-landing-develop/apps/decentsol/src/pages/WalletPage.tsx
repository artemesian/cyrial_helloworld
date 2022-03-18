import {
  alpha,
  Box,
  Button,
  CircularProgress,
  lighten,
  Skeleton,
  styled,
  Typography,
  useTheme,
} from '@mui/material';
import { useState, useEffect } from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import { injectIntl, IntlShape } from 'react-intl';
import { LoanLine } from '../components/mydsol/Wallet/LoanHistoryTable';
import LoanHistoryTable from '../components/mydsol/Wallet/LoanHistoryTable';
import WalletTable from '../components/mydsol/Wallet/WalletTable';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchLoanHistory } from '@temp-workspace/blockchain/dsol-chain';

export interface AssetLine {
  image_ref: string;
  asset_id: string;
  unclaimed_rewards: number;
}

export function WalletPage({
  intl: { formatMessage, formatNumber },
}: {
  intl: IntlShape;
}) {
  const theme = useTheme();
  const wallet = useWallet();

  /*
        const totalUnclaimedRewards = Object.keys(unclaimedRewards).reduce((total, key)=>{
            return total += unclaimedRewards[key]
        })
        isLoading = isUnclaimedRewardsLoading

        claimAllButtonDisabled = isUnclaimedRewardsLoading
    */

  interface UnclaimedRewards {
    avatar: number;
    table: number;
    stakepool: number;
  }

  const [unclaimedRewards, setUnclaimedRewards] = useState<UnclaimedRewards>({
    avatar: 0,
    table: 0,
    stakepool: 0,
  });
  const [isUnclaimedRewardsLoading, setIsUnclaimedRewardsLoading] =
    useState<boolean>(true);
  const [avatars, setAvatars] = useState<AssetLine[] | undefined>(undefined);
  const [tables, setTables] = useState<AssetLine[] | undefined>(undefined);

  //TODO: GO TO AVATAR_CARD, GOVERNOR_CARD, STAKEPOOL (STAKE & WITHDRAW) and use formatNumber there instead of plain figures

  const [totalUnclaimedRewards, setTotalUnclaimedRewards] = useState<number>(0);

  useEffect(() => {
    setTotalUnclaimedRewards(
      unclaimedRewards.avatar +
        unclaimedRewards.table +
        unclaimedRewards.stakepool
    );
  }, [unclaimedRewards]);

  const [isClaimingRewards, setIsClaimingRewards] = useState<boolean>(false);

  const handleClaimAllRewards = () => {
    //TODO: FETCH API HERE TO CLAIM ALL REWARDS
    setIsClaimingRewards(true);
    alert('user tried to claim all their rewards');
    setTimeout(() => {
      setIsClaimingRewards(false);
    }, 3000);
  };

  const TabLink = styled(Typography)(() => ({
    ...theme.typography.h4,
    color: alpha(String(theme.common.placeholder), 0.5),
    transition: 'color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    position: 'relative',
    marginInline: '4px',
    textDecoration: 'none',
    height: 'fit-content',
    justifySelf: 'center',
    cursor: 'pointer',
    '&::after': {
      position: 'absolute',
      bottom: '-10px',
      left: '0px',
      right: '0px',
      transform: 'scaleX(1.5)',
      content: '""',
      height: '0px',
      backgroundColor: theme.palette.primary.main,
      borderRadius: '100px 100px 0px 0px',
    },
    '&:hover': {
      color: theme.palette.primary.main,
    },
    '&:hover::after': {},
    '&.active': {
      color: theme.palette.primary.main,
    },
    '&.active::after': {
      height: '4px',
    },
  }));

  const RewardLine = ({
    colored,
    title,
    value,
    first,
    isLoan,
  }: {
    title: string;
    colored?: boolean;
    value: number;
    first?: boolean;
    isLoan?: boolean;
  }) => {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: theme.spacing(2),
          marginTop: first ? theme.spacing(2) : colored ? theme.spacing(4) : 0,
        }}
      >
        <Typography
          variant={colored ? 'h3' : 'h5'}
          sx={{ color: theme.common.placeholder }}
        >
          {formatMessage({ id: title })}
        </Typography>
        {(activeTab.tab_id === 1 && isUnclaimedRewardsLoading) ||
        (activeTab.tab_id === 2 && isLoanLoading) ? (
          <Skeleton
            animation="pulse"
            variant="text"
            width="80%"
            height="100%"
            sx={{
              backgroundColor: lighten(theme.palette.grey[900], 0.2),
            }}
          />
        ) : (
          <Typography
            variant={colored ? 'h3' : 'h5'}
            sx={{
              color: colored
                ? theme.palette.primary.main
                : theme.common.placeholder,
            }}
          >
            {`${formatNumber(value)} ${formatMessage({
              id: isLoan ? 'Sol' : 'Dsol',
            })}`}
          </Typography>
        )}
      </Box>
    );
  };

  interface walletTab {
    tab_id: number;
    tab_name: string;
  }

  const tabs: walletTab[] = [
    { tab_id: 1, tab_name: formatMessage({ id: 'wallet' }) },
    { tab_id: 2, tab_name: formatMessage({ id: 'loan' }) },
  ];

  const [activeTab, setActiveTab] = useState<walletTab>(
    tabs.find(
      (tab) => tab.tab_id === Number(localStorage.getItem('activeWalletTab'))
    ) || {
      tab_id: 1,
      tab_name: formatMessage({ id: 'wallet' }),
    }
  );

  const [loan, setLoan] = useState<{ owing: number; refunded: number }>({
    owing: 0,
    refunded: 0,
  });
  const [isLoanLoading, setIsLoanLoading] = useState<boolean>(false);

  const [isMakingLoan, setIsMakingLoan] = useState<boolean>(false);

  const [loanHistory, setLoanHistory] = useState<LoanLine[] | undefined>();

  const loadLoansHistory = async () => {
    setLoanHistory(undefined);
    setIsLoanLoading(true);
    try {
      const loanHistory = await fetchLoanHistory(wallet);
      setLoanHistory(loanHistory);
      setLoan({
        owing: loanHistory?.reduce(
          (totalLoan, loan) => totalLoan + loan?.loan_amount,
          0
        ),
        refunded:
          loanHistory?.reduce(
            (totalLoan, loan) => totalLoan + loan?.loan_amount,
            0
          ) -
          loanHistory?.reduce(
            (unpaidLoan, loan) => unpaidLoan + loan?.unpaid_loan,
            0
          ),
      });
    } catch (error) {
      throw new Error('' + error);
    }

    setIsLoanLoading(false);
  };
  useEffect(() => {
    if (!wallet.connected) {
      console.log('Wallet not connected');
      return;
    }
    switch (activeTab.tab_id) {
      case 1: {
        //TODO: FETCH AVATAR, TABLE AND STAKEPOOL UNCLAIMED REWARDS API HERE
        setIsUnclaimedRewardsLoading(true);
        setTimeout(() => {
          const unclaimedRewards_example: UnclaimedRewards = {
            avatar: 50000,
            table: 200,
            stakepool: 0,
          };
          setUnclaimedRewards(unclaimedRewards_example);
          setIsUnclaimedRewardsLoading(false);
        }, 3000);

        //TODO: FETCH DATA WITH RESPECT TO USER AVATARS HERE
        setAvatars(undefined);
        setTimeout(() => {
          const avatars_example: AssetLine[] = [
            {
              asset_id: 'ksoine-skeils-ss',
              image_ref: 'https://mediaeyenft.com/img/main_slider/1.jpg',
              unclaimed_rewards: 900,
            },
            {
              asset_id: 'ksoine-skeilsd-ss',
              image_ref:
                'https://www.momsall.com/wp-content/uploads/2021/04/How-to-Create-NFT-Art-and-What-Comes-Next-768x429.jpg',
              unclaimed_rewards: 7000,
            },
            {
              asset_id: 'ksoine-skeilfs-ss',
              image_ref:
                'https://i.pinimg.com/736x/da/69/15/da6915bc5d8ce95a1ff4b085677be884.jpg',
              unclaimed_rewards: 600,
            },
            {
              asset_id: 'ksoine-skeilfs-ssd',
              image_ref:
                'https://i.pinimg.com/736x/da/69/15/da6915bc5d8ce95a1ff4b085677be884.jpg',
              unclaimed_rewards: 2000,
            },
          ];

          setAvatars(avatars_example);
        }, 3000);

        //TODO: FETCH DATA WITH RESPECT TO USER TABLES HERE
        setTables(undefined);
        setTimeout(() => {
          const tables_example: AssetLine[] = [
            {
              asset_id: 'ksoine-skeils-ss',
              image_ref: 'https://mediaeyenft.com/img/main_slider/1.jpg',
              unclaimed_rewards: 900,
            },
            {
              asset_id: 'ksoine-skeilsd-ss',
              image_ref:
                'https://www.momsall.com/wp-content/uploads/2021/04/How-to-Create-NFT-Art-and-What-Comes-Next-768x429.jpg',
              unclaimed_rewards: 7000,
            },
            {
              asset_id: 'ksoine-skeilfs-ss',
              image_ref:
                'https://i.pinimg.com/736x/da/69/15/da6915bc5d8ce95a1ff4b085677be884.jpg',
              unclaimed_rewards: 600,
            },
            {
              asset_id: 'ksoine-skeilfs-ssd',
              image_ref:
                'https://i.pinimg.com/736x/da/69/15/da6915bc5d8ce95a1ff4b085677be884.jpg',
              unclaimed_rewards: 2000,
            },
          ];

          setTables(tables_example);
        }, 3000);
        break;
      }
      case 2: {
        //TODO: FETCH LOAN HISTORY API HERE
        loadLoansHistory();
      }
    }
  }, [activeTab, wallet.connected]);

  const [isSelectGovernorDialogOpen, setIsSelectGovernorDialogOpen] =
    useState<boolean>(false);

  return (
    <Box
      sx={{
        height: '100%',
        padding: '0 5%',
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr',
        gap: theme.spacing(7),
      }}
    >
      {activeTab.tab_id === 1 ? (
        <Box
          sx={{
            paddingTop: '3%',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              alignItems: 'center',
            }}
          >
            <Typography variant="h1">
              {formatMessage({ id: 'DsolWallet' })}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ justifySelf: 'end' }}
              onClick={handleClaimAllRewards}
              disabled={isClaimingRewards}
            >
              {isClaimingRewards && (
                <CircularProgress
                  color="primary"
                  size="30px"
                  sx={{
                    padding: theme.spacing(0.5),
                    marginRight: theme.spacing(0.5),
                  }}
                />
              )}
              {formatMessage({ id: 'claimAllRewards' })}
            </Button>
          </Box>
          <RewardLine
            title="totalReward"
            colored={true}
            value={totalUnclaimedRewards}
          />
          <RewardLine
            title="totalAvatarReward"
            first
            value={unclaimedRewards.avatar}
          />
          <RewardLine title="totalTableReward" value={unclaimedRewards.table} />
          <RewardLine
            title="totalStakeReward"
            value={unclaimedRewards.stakepool}
          />
        </Box>
      ) : (
        <Box
          sx={{
            paddingTop: '3%',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              alignItems: 'center',
            }}
          >
            <Typography variant="h1">
              {formatMessage({ id: 'loans' })}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ justifySelf: 'end' }}
              onClick={() => setIsSelectGovernorDialogOpen(true)}
              disabled={isMakingLoan}
            >
              {isMakingLoan && (
                <CircularProgress
                  color="primary"
                  size="30px"
                  sx={{
                    padding: theme.spacing(0.5),
                    marginRight: theme.spacing(0.5),
                  }}
                />
              )}
              {formatMessage({ id: 'askForNewLoan' })}
            </Button>
          </Box>
          <RewardLine
            title="totalLoan"
            colored={true}
            isLoan
            value={loan.owing}
          />
          <RewardLine
            title="totalDeptRefunded"
            isLoan
            first
            value={loan.refunded}
          />
        </Box>
      )}
      <Box
        sx={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'auto auto 1fr',
          gap: theme.spacing(1),
          '&::after': {
            position: 'absolute',
            bottom: '-10px',
            left: '0px',
            right: '0px',
            transform: 'scaleX(1.5)',
            content: '""',
            height: '1px',
            backgroundColor: theme.common.placeholder,
            boxShadow: '0px 0px 30px #FF3334',
            borderRadius: '100px 100px 0px 0px',
          },
        }}
      >
        {tabs.map(({ tab_id, tab_name }) => (
          <TabLink
            className={activeTab.tab_id === tab_id ? 'active' : ''}
            onClick={() => {
              setActiveTab({ tab_id, tab_name });
              localStorage.setItem('activeWalletTab', String(tab_id));
            }}
            key={tab_id}
          >
            {tab_name}
          </TabLink>
        ))}
      </Box>

      {activeTab.tab_id === 1 ? (
        <Box
          sx={{
            height: '98%',
            display: 'grid',
            gridAutoFlow: 'column',
            gap: theme.spacing(4),
          }}
        >
          <Box
            sx={{
              height: '100%',
              display: 'grid',
              gridTemplateRows: 'auto 1fr',
            }}
          >
            <Typography variant="h3" sx={{ marginBottom: theme.spacing(0.5) }}>
              {formatMessage({ id: 'avatars' })}
            </Typography>
            <Box sx={{ background: 'rgba(46, 57, 61, 1)', height: '100%' }}>
              <Scrollbars autoHide>
                <WalletTable rows={avatars} usage="avatars" />
              </Scrollbars>
            </Box>
          </Box>

          <Box
            sx={{
              height: '100%',
              display: 'grid',
              gridTemplateRows: 'auto 1fr',
            }}
          >
            <Typography variant="h3" sx={{ marginBottom: theme.spacing(0.5) }}>
              {formatMessage({ id: 'tables' })}
            </Typography>
            <Box sx={{ background: 'rgba(46, 57, 61, 1)', height: '100%' }}>
              <Scrollbars autoHide>
                <WalletTable rows={tables} usage="tables" />
              </Scrollbars>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{ height: '98%', display: 'grid', gridTemplateRows: 'auto 1fr' }}
        >
          <Typography variant="h3" sx={{ marginBottom: theme.spacing(0.5) }}>
            {formatMessage({ id: 'loanHistory' })}
          </Typography>
          <Box sx={{ background: 'rgba(46, 57, 61, 1)', height: '100%' }}>
            <Scrollbars autoHide>
              <LoanHistoryTable
                fetchHistory={loadLoansHistory}
                rows={loanHistory}
                setIsSelectGovernorDialogOpen={setIsSelectGovernorDialogOpen}
                isSelectGovernorDialogOpen={isSelectGovernorDialogOpen}
                setIsMakingLoan={setIsMakingLoan}
              />
            </Scrollbars>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default injectIntl(WalletPage);
