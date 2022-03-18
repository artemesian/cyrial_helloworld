import {
  Box,
  Typography,
  useTheme,
  alpha,
  styled,
  lighten,
} from '@mui/material';
import Scrollbars from 'react-custom-scrollbars-2';
import { injectIntl, IntlShape } from 'react-intl';
import { useState, useEffect } from 'react';
import Stake from '../components/mydsol/Stakepool/Stake';
import Withdraw from '../components/mydsol/Stakepool/Withdraw';
import LoanInformationDialog from '../components/mydsol/Wallet/LoanInformationDialog';
import { LoanLine } from '../components/mydsol/Wallet/LoanHistoryTable';
import moment from 'moment';

export function StakepoolPage({
  intl: { formatMessage },
}: {
  intl: IntlShape;
}) {
  const theme = useTheme();

  const TabLink = styled(Typography)(() => ({
    ...theme.typography.h3,
    color: alpha(String(theme.common.label), 0.5),
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
      boxShadow: '0px 0px 30px #FF3334',
      borderRadius: '100px 100px 0px 0px',
    },
    '&:hover': {
      color: lighten(theme.palette.primary.main, 0.3),
    },
    '&:hover::after': {},
    '&.active': {
      color: theme.palette.primary.main,
      textShadow: `0px 0px 16px ${theme.palette.primary.main}`,
    },
    '&.active::after': {
      height: '4px',
    },
  }));

  const [activeTab, setActiveTab] = useState<string>('stake');
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState<boolean>(false);

  const [loanHistories, setLoanHistories] = useState<LoanLine[]>([]);

  useEffect(() => {
    const closeLoans = loanHistories.filter(({ unpaid_loan, loan_date }) => {
      return (
        unpaid_loan > 0 &&
        30 -
          (Number(moment(new Date()).diff(new Date(loan_date), 'days')) % 30) <=
          7 &&
        Number(new Date(loan_date)) < Date.now()
      );
    });
    setIsLoanDialogOpen(closeLoans.length > 0);
  }, [loanHistories]);

  useEffect(() => {
    //TODO: FETCH API HERE TO LOAD LOAN HISTORIES
    setTimeout(() => {
      const loanHistories_example: LoanLine[] = [
        {
          image_ref: 'https://mediaeyenft.com/img/main_slider/1.jpg',
          loan_amount: 1000,
          loan_date: '12/17/2022',
          interate_rate: 1,
          unpaid_loan: 980,
          governor_id: '1',
          governor_backing: 1000,
          is_blocked: true,
          bump: undefined,
        },
        {
          image_ref: 'https://mediaeyenft.com/img/main_slider/1.jpg',
          loan_amount: 1000,
          loan_date: '02/12/2022',
          interate_rate: 1,
          unpaid_loan: 80,
          governor_id: '2',
          governor_backing: 1000,
          is_blocked: true,
          bump: undefined,
        },
      ];
      setLoanHistories(loanHistories_example);
    }, 3000);
  }, []);

  return (
    <>
      <LoanInformationDialog
        isDialogOpen={isLoanDialogOpen}
        closeDialog={() => setIsLoanDialogOpen(false)}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '2.5fr 1.5fr',
          height: '100%',
        }}
      >
        <Box sx={{ padding: ' 7% 5%' }}>
          <Typography variant="h1">
            Stake Sol to Receive Both LiquidSol and Dsol Tokens
          </Typography>
          <Typography variant="h5" sx={{ marginTop: theme.spacing(2) }}>
            Upon Staking, You will receive and equivalent dollar value worth of
            Liquisol as your Sol, which you can later Redeem for sol, But the
            Liquid nature of LiquidSol allows you to both accrue in the Interest
            of Staked Sol, and Also use your LiquidSol in Defi applications to
            earn additional interest.
          </Typography>
          <Typography variant="h5" sx={{ marginTop: theme.spacing(5) }}>
            Ownership of LiquidSol entitles you to Earning Dsol on an Epoch
            Frequency, Which could later be used in the Dsol Gaming Ecosystem to
            accrue even more Value.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            padding: '5% 5%',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto auto',
              gap: theme.spacing(5),
            }}
          >
            <TabLink
              onClick={() => setActiveTab('stake')}
              className={activeTab === 'stake' ? 'active' : ''}
              sx={{ justifySelf: 'end' }}
            >
              {formatMessage({ id: 'stake' })}
            </TabLink>
            <TabLink
              onClick={() => setActiveTab('withdraw')}
              className={activeTab === 'withdraw' ? 'active' : ''}
              sx={{ justifySelf: 'start' }}
            >
              {formatMessage({ id: 'withdraw' })}
            </TabLink>
          </Box>
          <Box
            sx={{
              marginTop: theme.spacing(2),
              background: 'rgba(46, 57, 61, 1)',
              height: '100%',
              borderRadius: theme.spacing(3),
            }}
          >
            <Scrollbars autoHide>
              {activeTab === 'stake' ? <Stake /> : <Withdraw />}
            </Scrollbars>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default injectIntl(StakepoolPage);
