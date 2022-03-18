import { AddCircleRounded, DeleteRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Proposal } from '../../../pages/ProposalPage';
import { useState } from 'react';
import { injectIntl, IntlShape } from 'react-intl';
import { v4 as uuidv4 } from 'uuid';

export function NewProposalDialog({
  intl: { formatMessage },
  isDialogOpen,
  closeDialog,
  createProposal,
  isCreatingProposal,
}: {
  intl: IntlShape;
  isDialogOpen: boolean;
  closeDialog: () => void;
  createProposal: (propd: Proposal) => void;
  isCreatingProposal: boolean;
}) {
  const theme = useTheme();

  const [userProposal, setUserProposal] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const [newOption, setNewOption] = useState<string>('');
  const [options, setOptions] = useState<{ id: string; option: string }[]>([]);

  const handleCreateProposal = () => {
    if (userProposal.length > 0 && options.length >= 2) {
      closeDialog();
      createProposal({
        proposal_id: uuidv4(),
        proposal: userProposal,
        number_of_votes: 0,
        created_at: new Date(),
        ending_date: new Date(),
        is_ongoing: false,
        options,
        duration: duration,
      });
      setOptions([]);
      setUserProposal('');
      setDuration(0);
    } else alert('cannot create an empty proposal');
  };

  const handleAddNewOption = () => {
    setOptions([...options, { id: uuidv4(), option: newOption }]);
    setNewOption('');
  };

  const removeOption = (id: string) => {
    const newOptions = options.filter((_) => _.id !== id);
    setOptions(newOptions);
  };

  /*TODO: ADD TOAST TO THE WHOLE PLATFORM AFTER EVERY ACTION
    TELL THE USER IF THEIR ACTION HAS BEEN SUCCESSFULL OR NOT
*/

  return (
    <Dialog
      open={isDialogOpen}
      onClose={closeDialog}
      fullWidth
      sx={{
        '& .MuiPaper-root': {
          background: 'rgba(46, 57, 61, 1)',
        },
      }}
    >
      <DialogTitle>
        <Typography
          variant="h2"
          sx={{ textAlign: 'center', color: theme.common.placeholder }}
        >
          {formatMessage({ id: 'proposal' })}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ marginTop: theme.spacing(2) }}>
        <Typography
          variant="h4"
          sx={{
            color: theme.common.placeholder,
          }}
        >
          {formatMessage({ id: 'proposalDescription' })}
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          fullWidth
          variant="outlined"
          value={userProposal}
          onChange={(event) => setUserProposal(event.target.value)}
          multiline
          rows={6}
          inputProps={{ maxLength: 500 }}
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
          }}
        >
          {`${formatMessage({ id: 'characterCount' })} ${userProposal.length}/`}
        </Typography>
        <Typography
          variant="h4"
          sx={{
            color: theme.common.placeholder,
            marginTop: theme.spacing(3),
          }}
        >
          {formatMessage({ id: 'duration' })}
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          type={'number'}
          value={duration}
          inputProps={{ maxLength: 50 }}
          onChange={(event) => setDuration(Number(event.target.value))}
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
          variant="h4"
          sx={{
            color: theme.common.placeholder,
            marginTop: theme.spacing(3),
          }}
        >
          {formatMessage({ id: 'choices' })}
        </Typography>

        <Box>
          {options.map((option, index) => (
            <Box
              key={index}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: theme.spacing(2),
              }}
            >
              <Typography sx={{ color: theme.common.placeholder }}>
                {String.fromCharCode(65 + index) + '.'}
              </Typography>
              <Typography sx={{ color: theme.common.placeholder }}>
                {option.option}
              </Typography>
              <Tooltip arrow title={formatMessage({ id: 'removeOption' })}>
                <IconButton
                  size="small"
                  onClick={() => removeOption(option.id)}
                >
                  <DeleteRounded color="error" fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>

        {options.length < 5 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              alignItems: 'center',
            }}
          >
            <Tooltip arrow title={formatMessage({ id: 'add' })}>
              <IconButton
                color="primary"
                disabled={newOption.length === 0}
                onClick={handleAddNewOption}
              >
                <AddCircleRounded color="primary" fontSize="large" />
              </IconButton>
            </Tooltip>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              value={newOption}
              inputProps={{ maxLength: 50 }}
              onChange={(event) => setNewOption(event.target.value)}
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
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          disabled={isCreatingProposal}
          onClick={handleCreateProposal}
          fullWidth
          size="large"
          color="primary"
          variant="contained"
        >
          {isCreatingProposal && (
            <CircularProgress
              color="primary"
              size="30px"
              sx={{
                padding: theme.spacing(0.5),
                marginRight: theme.spacing(0.5),
              }}
            />
          )}
          {formatMessage({ id: isCreatingProposal ? 'creating...' : 'create' })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default injectIntl(NewProposalDialog);
