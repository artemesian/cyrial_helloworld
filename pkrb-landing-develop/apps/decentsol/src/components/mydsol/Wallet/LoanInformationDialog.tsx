import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router';
import { injectIntl, IntlShape } from 'react-intl';

export function LoanInformationDialog({
  intl: { formatMessage },
  isDialogOpen,
  closeDialog,
}: {
  intl: IntlShape;
  isDialogOpen: boolean;
  closeDialog: () => void;
}) {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Dialog
      open={isDialogOpen}
      sx={{
        '& .MuiPaper-root': {
          background: 'rgba(46, 57, 61, 1)',
        },
      }}
    >
      <DialogTitle>
        <Typography
          variant="h2"
          sx={{ textAlign: 'center', color: theme.common.label }}
        >
          {formatMessage({ id: 'loanReminder' })}
        </Typography>
      </DialogTitle>
      <DialogContent
        sx={{
          marginTop: theme.spacing(4),
          marginBottom: theme.spacing(2),
          color: theme.common.placeholder,
          textAlign:"center"
        }}
      >
        The deadline for one of your loans is fast approaching. failure to pay
        the interest on the loan will cause the system to take possesion of the
        Govenor.
        {/*TODO: make formatMessage for this dialog */}
      </DialogContent>
      <DialogActions sx={{display: "grid", justifyContent:"center"}}>
        <Button
          onClick={()=>{
              closeDialog()
              localStorage.setItem("activeWalletTab", "2")
              navigate("/mydsol/wallet")
          }}
          fullWidth={false}
          size="large"
          color="primary"
          variant="contained"
        >
          {formatMessage({ id: 'repayNow' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default injectIntl(LoanInformationDialog);
