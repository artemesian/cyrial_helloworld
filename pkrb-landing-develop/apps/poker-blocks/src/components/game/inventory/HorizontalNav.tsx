import { Box, TextField, useTheme } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { injectIntl, IntlShape } from 'react-intl';
import { lighten } from '@mui/system';
import { NavLink } from 'react-router-dom';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { AccountBalanceWalletTwoTone } from '@mui/icons-material';

const useStyles = makeStyles((theme: any) => ({
  navLink: {
    cursor: 'pointer',
    textDecoration: 'none',
    justifySelf: 'center',
    color: theme.common.offWhite,
    '&.active': {
      color: '#F3B644',
      textShadow: '0px 0px 16px #F3B644',
    },
  },
  wallet: {
    justifySelf: 'center',
    margin: 'auto',
    color: theme.common.yellow,
    borderRadius: '5px',
    border: '2px solid #FF3334',
    transition: 'all ease-in 0.5s',
    '& .MuiButton-startIcon svg g rect': {
      transition: 'fill 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      fill: theme.common.yellow,
    },
    '&:hover .MuiButton-startIcon svg g rect': {
      transition: 'all ease-in 0.5s',
      fill: lighten('#F3B644', 0.2),
    },
    '&:hover': {
      transition: 'all ease-in 0.5s',
      color: lighten('#F3B644', 0.2),
    },
  },
}));

export function InventoryNavLink({
  linkName,
  href,
}: {
  linkName: string;
  href: string;
}): JSX.Element {
  const classes = useStyles();
  return (
    <NavLink to={href} className={classes.navLink}>
      {linkName}
    </NavLink>
  );
}

export function HorizontalNav({ intl }: { intl: IntlShape }): JSX.Element {
  const { formatMessage } = intl;
  const theme = useTheme();
  const classes = useStyles();
  const inventoryTabs: string[] = ['avatars', 'tables', 'DSolWallet'];

  return (
    <Box
      sx={{
        display: 'grid',
        gridAutoFlow: 'column',
        alignItems: 'center',
        columnGap: '5px',
        padding: '14px 2%',
        borderBottom: `1px solid ${theme.common.line}`,
      }}
    >
      <TextField
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
        size="small"
        placeholder={formatMessage({ id: 'searchAvatarId' })}
      />
      {inventoryTabs.map((linkName, index) => (
        <InventoryNavLink
          linkName={formatMessage({ id: linkName })}
          href={linkName}
          key={index}
        />
      ))}
      <WalletMultiButton
        startIcon={
          <AccountBalanceWalletTwoTone style={{ color: theme.common.yellow }} />
        }
        className={classes.wallet}
      ></WalletMultiButton>
    </Box>
  );
}

export default injectIntl(HorizontalNav);
