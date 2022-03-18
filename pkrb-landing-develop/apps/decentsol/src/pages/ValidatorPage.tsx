import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { injectIntl, IntlShape } from 'react-intl';
import { useState, useEffect } from 'react';
import ValidatorTable from '../components/mydsol/Validator/ValidatorTable';
import Scrollbars from 'react-custom-scrollbars-2';
import { ValidatorLine } from '../components/mydsol/Validator/ValidatorLine';

export function ValidatorPage({
  intl: { formatMessage },
}: {
  intl: IntlShape;
}) {
  const theme = useTheme();
  const [validatorPublicKey, setValidatorPublicKey] = useState<
    string | undefined
  >(undefined);
  const [isAddingValidator, setIsAddingValidator] = useState<boolean>(false);

  const [validators, setValidators] = useState<ValidatorLine[]>([]);
  const [isValidatorsLoading, setIsValidatorsLoading] = useState<boolean>(true);

  useEffect(() => {
    //TODO: FETCH DATA WITH RESPECT TO THE VALIDATORS HERE
    const validators_example: ValidatorLine[] = [
      {
        id: '#0DDF34DFHLTYFDS$@$#4352',
        location: 'Cameroun',
        amount_delegated: 72000,
      },
      {
        id: '#0DDF34DFHJTYFDS$@$#4352',
        location: 'Nigeria',
        amount_delegated: 100,
      },
      {
        id: '#0DDF34DFHUTYFDS$@$#4352',
        location: 'Siberia',
        amount_delegated: 720,
      },
      {
        id: '#0DDF34DFHJTNFDS$@$#4352',
        location: 'Senegal',
        amount_delegated: 0,
      },
    ];

    setTimeout(() => {
      setValidators(validators_example);
      setIsValidatorsLoading(false);
    }, 3000);
  }, []);

  const handleAddValidator = () => {
    //TODO: FETCH API TO ADD VALIDATORS HERE use the validatorPublicKey
    if (validatorPublicKey && validatorPublicKey !== '') {
      setIsAddingValidator(true);
      alert(`user tried to add validator with key: ${validatorPublicKey}`);
      setTimeout(() => {
        /*
                TODO: after adding the validator, 
                return an object that respects the ValidatorLine interface. 

                then add it to the top of the list so the user sees it directly

                setValidators([newValidator, ...validators])
                */
        setIsAddingValidator(false);
      }, 3000);
    } else alert('cannot add validator with an empty public key');
  };

  return (
    <Box
      sx={{
        padding: '0% 5%',
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto auto auto auto auto 1fr',
      }}
    >
      <Typography variant="h1" sx={{ marginTop: '3%' }}>
        {formatMessage({ id: 'createValidator' })}
      </Typography>
      <Typography
        variant="h4"
        sx={{
          fontFamily: 'lato',
          color: theme.common.placeholder,
        }}
      >
        {formatMessage({ id: 'joinStakepool' })}
      </Typography>
      <Typography
        variant="h4"
        sx={{
          marginTop: theme.spacing(10),
          marginBottom: theme.spacing(0.5),
        }}
      >
        {formatMessage({ id: 'validatorPublicKey' })}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr' }}>
        <TextField
          value={validatorPublicKey}
          onChange={(event) => setValidatorPublicKey(event.target.value)}
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
        <Button
          color="primary"
          variant="contained"
          size="large"
          disabled={isAddingValidator}
          onClick={handleAddValidator}
        >
          {isAddingValidator && (
            <CircularProgress size="40px" color="primary" />
          )}
          {isAddingValidator
            ? formatMessage({ id: 'adding...' })
            : formatMessage({ id: 'add' })}
        </Button>
      </Box>

      <Typography
        variant="h3"
        sx={{
          marginTop: theme.spacing(10),
          marginBottom: theme.spacing(0.5),
        }}
      >
        {formatMessage({ id: 'allValidators' })}
      </Typography>
      <Box sx={{ height: '100%', backgroundColor: 'rgba(39, 47, 50, 0.6)' }}>
        <Scrollbars autoHide>
          <ValidatorTable rows={isValidatorsLoading ? undefined : validators} />
        </Scrollbars>
      </Box>
    </Box>
  );
}

export default injectIntl(ValidatorPage);
