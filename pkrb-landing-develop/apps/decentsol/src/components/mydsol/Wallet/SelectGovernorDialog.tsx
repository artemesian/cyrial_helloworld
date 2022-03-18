import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Typography,
  useTheme,
} from '@mui/material';
import { Box } from '@mui/system';
import { useState, useEffect } from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import { injectIntl, IntlShape } from 'react-intl';
import { LoanLine } from './LoanHistoryTable';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  fetchGovernors,
  getGovernorMintPrice,
} from '@temp-workspace/blockchain/dsol-chain';

export function SelectGovernorDialog({
  intl: { formatMessage },
  isDialogOpen,
  closeDialog,
  submitSelectedGovernor,
}: {
  intl: IntlShape;
  isDialogOpen: boolean;
  closeDialog: () => void;
  submitSelectedGovernor: (governor_id: LoanLine) => void;
}) {
  const theme = useTheme();
  const [isGovernorsLoading, setIsGovernorsLoading] = useState<boolean>(true);
  const [governors, setGovernors] = useState<LoanLine[]>([]);
  const [selectedGovernor, setSelectedGovernor] = useState<LoanLine>({
    governor_id: '',
    image_ref: '',
    is_blocked: false,
    governor_backing: 0,
    loan_amount: 0,
    loan_date: '',
    interate_rate: 0,
    unpaid_loan: 0,
    bump: undefined,
  });

  const wallet = useWallet();

  const loadGovernor = async () => {
    if (isDialogOpen) {
      setIsGovernorsLoading(true);
      try {
        let governors: any = await fetchGovernors(
          wallet.publicKey as PublicKey
        );

        const salesData = await getGovernorMintPrice();
        const governorPrice =
          Number(salesData?.vault_total.toString()) /
          10 ** 9 /
          salesData?.counter;

        governors = governors.map((governor: any) => ({
          governor_id: governor.governor_id,
          image_ref: governor.governor_link,
          governor_backing: governorPrice,
          is_blocked: governor.is_blocked,
          loan_amount: 0,
          loan_date: '',
          interate_rate: 0,
          unpaid_loan: 0,
        }));

        setGovernors(governors);
      } catch (error) {
        throw new Error('' + error);
      }
      setIsGovernorsLoading(false);
    }
  };
  useEffect(() => {
    //TODO: FETCH USERS'S GOVERNORS HERE
    if (!wallet.connected) {
      console.log('Wallet not Connected');
      return;
    }
    loadGovernor();
  }, [isDialogOpen]);

  const submitGovernor = () => {
    if (selectedGovernor.governor_id !== '') {
      closeDialog();
      submitSelectedGovernor(selectedGovernor);
      setGovernors([]);
      setSelectedGovernor({
        governor_id: '',
        image_ref: '',
        is_blocked: false,
        governor_backing: 0,
        loan_amount: 0,
        loan_date: '',
        interate_rate: 0,
        unpaid_loan: 0,
        bump: undefined,
      });
    } else alert('you must select a governor to proceed');
  };

  const handleClose = () => {
    closeDialog();
    setGovernors([]);
    setSelectedGovernor({
      governor_id: '',
      image_ref: '',
      is_blocked: false,
      governor_backing: 0,
      loan_amount: 0,
      loan_date: '',
      interate_rate: 0,
      unpaid_loan: 0,
      bump: undefined,
    });
  };

  return (
    <Dialog
      open={isDialogOpen}
      onClose={handleClose}
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
          {formatMessage({ id: 'selectGovernor' })}
        </Typography>
      </DialogTitle>
      <DialogContent
        sx={{
          minWidth: '30vw',
          marginTop: theme.spacing(4),
          height: '50vh',
        }}
      >
        <Scrollbars autoHide>
          <Box
            sx={{
              display: 'grid',
              gap: '25px',
              justifyContent: 'center',
              gridTemplateColumns: `repeat(auto-fit, minmax(${theme.spacing(
                10
              )}, ${theme.spacing(10)}))`,
            }}
          >
            {isGovernorsLoading &&
              [...new Array(5)].map((_, index) => (
                <Box key={index}>
                  <Skeleton
                    animation="wave"
                    variant="circular"
                    sx={{
                      height: theme.spacing(10),
                      width: theme.spacing(10),
                    }}
                  />
                  <Skeleton animation="wave" variant="text" />
                </Box>
              ))}
            {!isGovernorsLoading &&
              governors.map((governor, index) => (
                <Box key={index}>
                  <Avatar
                    onClick={() =>
                      governor.is_blocked ? null : setSelectedGovernor(governor)
                    }
                    src={governor.image_ref}
                    alt={`my governor number ${index + 1}`}
                    sx={{
                      height: theme.spacing(10),
                      width: theme.spacing(10),
                      opacity: governor.is_blocked ? 0.35 : 1,
                      boxShadow:
                        selectedGovernor.governor_id === governor.governor_id
                          ? '0px 0px 12px rgba(107, 190, 22, 0.5)'
                          : 'none',
                      border:
                        selectedGovernor.governor_id === governor.governor_id
                          ? `4px solid ${theme.common.green}`
                          : `4px solid ${theme.common.placeholder}`,
                    }}
                  />

                  {governor.governor_id.length <= 12 ? (
                    <Typography
                      sx={{
                        color:
                          selectedGovernor.governor_id === governor.governor_id
                            ? theme.common.green
                            : theme.common.placeholder,
                        width: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {governor.governor_id}
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns:
                          governor.governor_id.length > 12 ? '1fr auto' : '1fr',
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            selectedGovernor.governor_id ===
                            governor.governor_id
                              ? theme.common.green
                              : theme.common.placeholder,
                          width: '100%',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {governor.governor_id.slice(0, 12)}
                      </Typography>
                      <Typography
                        sx={{
                          color:
                            selectedGovernor.governor_id ===
                            governor.governor_id
                              ? theme.common.green
                              : theme.common.placeholder,
                          width: '100%',
                        }}
                      >
                        {`${governor.governor_id.slice(
                          governor.governor_id.length - 4
                        )}`}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ))}
          </Box>
        </Scrollbars>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={submitGovernor}
          disabled={
            !governors.find(
              (governor) =>
                governor.governor_id === selectedGovernor.governor_id
            )
          }
          fullWidth
          size="large"
          color="primary"
          variant="contained"
        >
          {formatMessage({ id: 'next' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default injectIntl(SelectGovernorDialog);
