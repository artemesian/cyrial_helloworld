import {
  Avatar,
  Box,
  Button,
  Fade,
  IconButton,
  Popper,
  Skeleton,
  Tooltip,
  useTheme,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { injectIntl, IntlShape } from 'react-intl';
import { MoreHorizRounded } from '@mui/icons-material';
import { useState } from 'react';
import RepayLoanDialog from './RepayLoanDialog';
import NewLoanDialog from './NewLoanDialog';
import SelectGovernorDialog from './SelectGovernorDialog';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  borrowMoreLoan,
  payLoan,
  takeLoan,
} from '@temp-workspace/blockchain/dsol-chain';

export interface LoanLine {
  governor_id: string;
  governor_backing: number;
  image_ref: string;
  loan_amount: number;
  loan_date: string | Date;
  interate_rate: number;
  unpaid_loan: number;
  is_blocked: boolean;
  bump: number | undefined;
}

export function LoanHistoryTable({
  intl: { formatMessage, formatNumber },
  rows,
  setIsSelectGovernorDialogOpen,
  isSelectGovernorDialogOpen,
  setIsMakingLoan,
  fetchHistory,
}: {
  intl: IntlShape;
  rows: LoanLine[] | undefined;
  setIsSelectGovernorDialogOpen: (newState: boolean) => void;
  isSelectGovernorDialogOpen: boolean;
  setIsMakingLoan: (newState: boolean) => void;
  fetchHistory: () => void;
}) {
  const theme = useTheme();
  const headers = [
    formatMessage({ id: '#' }),
    formatMessage({ id: 'pledgedGovernor' }),
    formatMessage({ id: 'loanDate' }),
    formatMessage({ id: 'loanAmount' }),
    formatMessage({ id: 'interestRate/month' }),
    formatMessage({ id: 'amountUnpaid' }),
    '',
  ];
  const wallet = useWallet();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [anchorElement, setAnchorElement] = useState<any>(null);
  const [actionnedGovernor, setActionnedGovernor] = useState<
    string | undefined
  >();

  const [loanDetails, setLoanDetails] = useState<LoanLine>({
    image_ref: '',
    loan_amount: 0,
    loan_date: '',
    interate_rate: 0,
    unpaid_loan: 0,
    governor_id: '',
    governor_backing: 1000,
    is_blocked: false,
    bump: undefined,
  });

  const openMoreMenu = (event: React.MouseEvent, governor_id: string) => {
    if (actionnedGovernor === governor_id) {
      setActionnedGovernor(undefined);
    } else {
      const details = rows?.find(
        (history) => history.governor_id === governor_id
      );
      if (details) setLoanDetails(details);
      setAnchorElement(event.currentTarget);
      setActionnedGovernor(governor_id);
    }
  };

  const [isRepayDialogOpen, setIsRepayDialogOpen] = useState<boolean>(false);
  const [isRepayingLoan, setIsRepayingLoan] = useState<boolean>(false);

  const repayLoan = async (repayAmount: number, loan: LoanLine) => {
    //TODO: FETCH API HERE TO REPAY LOAN
    setIsRepayingLoan(true);
    try {
      const response = await payLoan(
        wallet,
        repayAmount,
        loan.governor_id as string,
        loan.bump as number
      );
      console.log(response);
    } catch (error) {
      throw new Error('' + error);
    }
    setIsRepayingLoan(false);
    setIsRepayDialogOpen(false);
    setActionnedGovernor(undefined);
    fetchHistory();
  };

  const [isNewLoanDialogOpen, setIsNewLoanDialogOpen] = useState(false);
  const [isTakingNewLoan, setIsTakingNewLoan] = useState(false);
  const [isPrimaryLoanRequest, setIsPrimaryLoanRequest] =
    useState<boolean>(false);

  const takeNewLoan = async (increaseAmount: number, bump: number) => {
    //TODO: FETCH API HERE TO TAKE LOAN
    console.log(actionnedGovernor, increaseAmount);
    if (isPrimaryLoanRequest) {
      setIsMakingLoan(true);
      try {
        const response = await takeLoan(
          wallet,
          increaseAmount,
          actionnedGovernor as string
        );
        console.log(response);
      } catch (error) {
        throw new Error('' + error);
      }
      setIsMakingLoan(false);
      setIsPrimaryLoanRequest(false);
    } else {
      setIsTakingNewLoan(true);
      try {
        const response = await borrowMoreLoan(
          wallet,
          increaseAmount,
          actionnedGovernor as string,
          bump
        );
        console.log(response);
      } catch (error) {
        throw new Error('' + error);
      }
      setIsTakingNewLoan(false);
    }

    setActionnedGovernor(undefined);
    setIsNewLoanDialogOpen(false);
    fetchHistory();
  };

  return (
    <>
      <RepayLoanDialog
        isDialogOpen={isRepayDialogOpen}
        closeDialog={() => {
          setIsRepayDialogOpen(false);
          setActionnedGovernor(undefined);
        }}
        repayLoan={repayLoan}
        isRepayingLoan={isRepayingLoan}
        loanDetails={loanDetails}
      />
      <NewLoanDialog
        isDialogOpen={isNewLoanDialogOpen}
        closeDialog={() => {
          setIsNewLoanDialogOpen(false);
          setIsPrimaryLoanRequest(false);
          setActionnedGovernor(undefined);
        }}
        submitNewLoan={takeNewLoan}
        isTakingNewLoan={isTakingNewLoan}
        loanDetails={loanDetails}
      />
      <SelectGovernorDialog
        isDialogOpen={isSelectGovernorDialogOpen}
        closeDialog={() => {
          setIsSelectGovernorDialogOpen(false);
          setIsPrimaryLoanRequest(false);
        }}
        submitSelectedGovernor={(selectedGovernor) => {
          console.log(selectedGovernor);
          setLoanDetails(selectedGovernor);
          setActionnedGovernor(selectedGovernor.governor_id);
          setIsPrimaryLoanRequest(true);
          setIsSelectGovernorDialogOpen(false);
          setIsNewLoanDialogOpen(true);
        }}
      />
      <TableContainer component={Box}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell
                  sx={{ color: theme.common.placeholder }}
                  key={index}
                  align={index === 0 ? 'left' : 'center'}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows && rows.length === 0 && (
              <TableRow sx={{ '& td, & th': { borderBottom: 0 } }}>
                <TableCell
                  sx={{
                    color: theme.common.placeholder,
                    ...theme.typography.h4,
                  }}
                  component="th"
                  scope="row"
                  colSpan={7}
                  align="center"
                >
                  {formatMessage({ id: 'youHaveNoLoan' })}
                </TableCell>
              </TableRow>
            )}
            {!rows &&
              [...new Array(5)].map((_, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '& td, & th': {
                      borderBottom: `0.5px solid ${theme.common.line}`,
                    },
                  }}
                >
                  {[...new Array(7)].map((_, index) => (
                    <TableCell
                      sx={{ color: theme.common.placeholder }}
                      align="center"
                    >
                      <Skeleton key={index} animation="wave" height="20px" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {rows &&
              rows.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '& td, & th': {
                      borderBottom: `0.5px solid ${theme.common.line}`,
                    },
                  }}
                >
                  <TableCell
                    sx={{ color: theme.common.placeholder }}
                    component="th"
                    scope="row"
                  >
                    {index + 1}
                  </TableCell>
                  <TableCell
                    sx={{ color: theme.common.placeholder }}
                    align="center"
                  >
                    {row.governor_id}
                    {/* <Avatar
                      src={row.image_ref}
                      alt="table avatar"
                      sx={{
                        width: 'initial',
                        '& img': {
                          width: '40px',
                          borderRadius: '100%',
                        },
                      }}
                    /> */}
                  </TableCell>
                  <TableCell
                    sx={{ color: theme.common.placeholder }}
                    align="center"
                  >
                    {row.loan_date}
                  </TableCell>
                  <TableCell
                    sx={{ color: theme.common.placeholder }}
                    align="center"
                  >
                    {`${formatNumber(row.loan_amount)} SOL`}
                  </TableCell>
                  <TableCell
                    sx={{ color: theme.common.placeholder }}
                    align="center"
                  >
                    {formatNumber(row.interate_rate, {
                      style: 'percent',
                    })}
                  </TableCell>
                  <TableCell
                    sx={{ color: theme.common.placeholder }}
                    align="center"
                  >
                    {`${formatNumber(row.unpaid_loan)} SOL`}
                  </TableCell>
                  <TableCell
                    sx={{ color: theme.common.placeholder }}
                    align="center"
                  >
                    {actionnedGovernor === row.governor_id &&
                    (isRepayingLoan || isTakingNewLoan) ? (
                      <CircularProgress
                        color="primary"
                        size="30px"
                        sx={{
                          padding: theme.spacing(0.5),
                          marginRight: theme.spacing(0.5),
                        }}
                      />
                    ) : (
                      <Tooltip arrow title={formatMessage({ id: 'actions' })}>
                        <IconButton
                          size="small"
                          onClick={(event) =>
                            openMoreMenu(event, row.governor_id)
                          }
                        >
                          <MoreHorizRounded
                            fontSize="small"
                            sx={{ color: theme.common.label }}
                          />
                          {console.log(
                            row.governor_backing,
                            (70 / 100) * row.governor_backing,
                            row.unpaid_loan
                          )}
                        </IconButton>
                      </Tooltip>
                    )}
                    <Popper
                      open={
                        actionnedGovernor === row.governor_id &&
                        (((!isRepayDialogOpen || isRepayingLoan) &&
                          !isNewLoanDialogOpen) ||
                          isTakingNewLoan)
                      }
                      anchorEl={anchorElement}
                      transition
                    >
                      {({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={350}>
                          <Box
                            sx={{
                              backgroundColor: 'rgb(26 32 43)',
                              padding: '10px',
                              borderRadius: '10px',
                              display: 'grid',
                              rowGap: '5px',
                            }}
                          >
                            {row.unpaid_loan > 0 && (
                              <Button
                                onClick={() => {
                                  setIsRepayDialogOpen(true);
                                  setLoanDetails(row);
                                }}
                                sx={{
                                  color: theme.common.offWhite,
                                  '&:hover': {
                                    color: theme.palette.primary.main,
                                  },
                                }}
                              >
                                {formatMessage({ id: 'repayLoan' })}
                              </Button>
                            )}
                            {(70 / 100) * row.governor_backing -
                              row.unpaid_loan >
                              0 && (
                              <Button
                                onClick={() => setIsNewLoanDialogOpen(true)}
                                sx={{
                                  color: theme.common.offWhite,
                                  '&:hover': {
                                    color: theme.palette.primary.main,
                                  },
                                }}
                              >
                                {formatMessage({ id: 'increaseLoan' })}
                              </Button>
                            )}
                          </Box>
                        </Fade>
                      )}
                    </Popper>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
export default injectIntl(LoanHistoryTable);
