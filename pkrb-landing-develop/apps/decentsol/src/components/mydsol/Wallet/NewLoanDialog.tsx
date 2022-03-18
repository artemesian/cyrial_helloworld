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
import newLoanImage from '../../../assets/images/newLoanImage.png';
import { LoanLine } from './LoanHistoryTable';

export function NewLoanDialog({
  intl: { formatMessage, formatNumber },
  isDialogOpen,
  closeDialog,
  submitNewLoan,
  isTakingNewLoan,
  loanDetails,
}: {
  intl: IntlShape;
  isDialogOpen: boolean;
  closeDialog: () => void;
  submitNewLoan: (newLoanAmount: number, bump: number) => void;
  isTakingNewLoan: boolean;
  loanDetails: LoanLine;
}) {
  const theme = useTheme();
  const [newLoanAmount, setNewLoanAmount] = useState<number>(0);
  const { governor_backing, unpaid_loan } = loanDetails;

  const handleNewLoan = () => {
    if (newLoanAmount <= (70 / 100) * governor_backing - unpaid_loan) {
      submitNewLoan(newLoanAmount, Number(loanDetails?.bump));
      setNewLoanAmount(0);
    } else
      alert(
        "You can't take a loan higher than 70% of the total Governor backing."
      );
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
          {formatMessage({ id: 'loanRequest' })}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ marginTop: theme.spacing(4), display: 'grid' }}>
        <img
          src={newLoanImage}
          alt={formatMessage({ id: 'repayingLoan' })}
          style={{
            justifySelf: 'center',
            marginBottom: theme.spacing(8),
            height: '120px',
          }}
        />

        <Typography
          variant="h6"
          sx={{
            color: theme.common.placeholder,
          }}
        >
          {`${formatMessage({ id: 'loanAmount' })} (${formatMessage({
            id: 'maximumAmount',
          })}: ${formatNumber(
            (70 / 100) * governor_backing - unpaid_loan
          )} SOL)`}
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          variant="outlined"
          type="number"
          value={newLoanAmount}
          onChange={(event) => setNewLoanAmount(Number(event.target.value))}
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
          {unpaid_loan > 0
            ? `
          Due to your previous loan of ${unpaid_loan}, the maximum loan available is ${
                (70 / 100) * governor_backing - unpaid_loan
              }`
            : `You can only take a loan of up to ${
                (70 / 100) * governor_backing - unpaid_loan
              }. This corresponds to 70% of your governor's total backing value.`}
          {/*TODO: Translate these texts*/}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={isTakingNewLoan}
          onClick={handleNewLoan}
          fullWidth
          size="large"
          color="primary"
          variant="contained"
        >
          {isTakingNewLoan && (
            <CircularProgress
              color="primary"
              size="30px"
              sx={{
                padding: theme.spacing(0.5),
                marginRight: theme.spacing(0.5),
              }}
            />
          )}
          {formatMessage({
            id: isTakingNewLoan ? 'submitting...' : 'submit',
          })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default injectIntl(NewLoanDialog);
