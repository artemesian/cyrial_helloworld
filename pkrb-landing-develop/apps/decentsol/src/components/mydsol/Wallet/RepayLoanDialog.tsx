import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { injectIntl, IntlShape } from 'react-intl';
import repayLoanImage from '../../../assets/images/repayLoanImage.png';
import { LoanLine } from './LoanHistoryTable';

export function RepayLoanDialog({
  intl: { formatMessage, formatNumber },
  isDialogOpen,
  closeDialog,
  repayLoan,
  isRepayingLoan,
  loanDetails,
}: {
  intl: IntlShape;
  isDialogOpen: boolean;
  closeDialog: () => void;
  repayLoan: (repayAmount: number, loan: LoanLine) => void;
  isRepayingLoan: boolean;
  loanDetails: LoanLine;
}) {
  const theme = useTheme();
  const [repayAmount, setRepayAmount] = useState<number>(0);
  const { interate_rate, unpaid_loan } = loanDetails;

  const handleRepayLoan = () => {
    if (repayAmount >= Math.ceil(unpaid_loan * interate_rate * 1000) / 1000) {
      repayLoan(repayAmount, loanDetails);
      setRepayAmount(0);
    } else alert('You must pay at least the interest on the remaining loan');
  };

  return (
    <Dialog
      open={isDialogOpen}
      onClose={closeDialog}
      sx={{
        '& .MuiPaper-root': {
          background: 'rgba(46, 57, 61, 1)',
        },
      }}
    >
      <DialogTitle>
        <Typography
          variant="h1"
          sx={{ textAlign: 'center', color: theme.common.label }}
        >
          {formatMessage({ id: 'repayLoan' })}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ marginTop: theme.spacing(4), display: 'grid' }}>
        <img
          src={repayLoanImage}
          alt={formatMessage({ id: 'repayingLoan' })}
          style={{
            justifySelf: 'center',
            marginBottom: theme.spacing(8),
            height: '100px',
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: theme.common.placeholder,
          }}
        >
          {`${formatMessage({ id: 'refundAmount' })} (${formatMessage({
            id: 'minimumAmount',
          })}: ${formatNumber(
            Math.ceil(unpaid_loan * interate_rate * 1000) / 1000
          )} SOL)`}
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          variant="outlined"
          type="number"
          value={repayAmount}
          onChange={(event) => setRepayAmount(Number(event.target.value))}
          sx={{
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
        />
        <Typography
          variant="h6"
          sx={{
            color: theme.common.placeholder,
            textAlign: 'center',
            marginTop: theme.spacing(3),
          }}
        >
          The value in the filled in field is the minimum to be repaid on each
          payment due date, but you can modify it if you wish to pay more.
          {/*TODO: {formatMessage({id:"repayLoanMessage"})} */}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={isRepayingLoan}
          onClick={handleRepayLoan}
          fullWidth
          size="large"
          color="primary"
          variant="contained"
        >
          {isRepayingLoan && (
            <CircularProgress
              color="primary"
              size="30px"
              sx={{
                padding: theme.spacing(0.5),
                marginRight: theme.spacing(0.5),
              }}
            />
          )}
          {formatMessage({ id: isRepayingLoan ? 'confirming...' : 'confirm' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default injectIntl(RepayLoanDialog);
