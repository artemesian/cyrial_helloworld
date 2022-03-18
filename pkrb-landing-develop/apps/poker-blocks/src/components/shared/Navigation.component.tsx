import React, { useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  alpha,
  Button,
  Grid,
  AppBar,
  Toolbar,
  Box,
  IconButton,
  SwipeableDrawer,
  Modal,
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { injectIntl, IntlShape } from 'react-intl';
import { lighten, styled } from '@mui/system';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import anime from 'animejs';
import logo from '../../assets/images/pkrb_nav_logo.png';
import { ReactComponent as ConnectWallet } from '../../assets/icons/Connect wallet.svg';
import { ReactComponent as BurgerMenuIcon } from '../../assets/icons/burger_menu.svg';

const useStyles = makeStyles((theme: any) => ({
  burgerLink: {
    padding: 1,
    textDecoration: 'none',
    display: 'flex',
    textAlign: 'center',
    color: alpha(String(theme.common.label), 0.24),
    ...theme.typography.h2SemiBold,
    transition: 'color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    '&:hover': {
      color: lighten('#FF3334', 0.3),
    },
    '&.active': {
      color: '#FF3334',
    },
  },
}));

function Navigation({ intl }: { intl: IntlShape }): JSX.Element {
  const theme = useTheme();

  const classes = useStyles();

  const { formatMessage } = intl;

  const [openDrawer, setOpenDrawer] = useState(false);

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const handleDrawerClose = (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift' ||
        (event as React.KeyboardEvent).key === 'Enter')
    ) {
      return;
    }
    setOpenDrawer(false);
  };

  const HeaderLink = styled(NavLink)(() => ({
    ...theme.typography.body1Regular,
    color: alpha(String(theme.common.label), 0.5),
    fontFamily: 'Righteous',
    transition: 'color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    position: 'relative',
    marginInline: '4px',
    textDecoration: 'none',
    '&::after': {
      position: 'absolute',
      bottom: '-21px',
      left: '0px',
      right: '0px',
      transform: 'scaleX(1.5)',
      content: '""',
      height: '0px',
      backgroundColor: '#FF3334',
      boxShadow: '0px 0px 30px #FF3334',
      borderRadius: '100px 100px 0px 0px',
    },
    '&:hover': {
      color: lighten('#FF3334', 0.3),
    },
    '&:hover::after': {},
    '&.active': {
      color: '#FF3334',
    },
    '&.active::after': {
      height: '4px',
    },
  }));

  interface InavigationLink {
    name: string;
    href: string;
  }
  const navigationLinks: InavigationLink[] = [
    { name: formatMessage({ id: 'Home' }), href: '/home' },
    { name: formatMessage({ id: 'Games' }), href: '/games' },
    {
      name: formatMessage({ id: 'Wiki-Get started' }),
      href: '/wiki-get-started',
    },
    { name: '', href: '#' },
    { name: formatMessage({ id: 'White-paper' }), href: '/white-paper' },
    { name: formatMessage({ id: 'Roadmap' }), href: '/roadmap' },
    { name: formatMessage({ id: 'Our Team' }), href: '/our-team' },
  ];

  const animationRef: React.MutableRefObject<anime.AnimeInstance | null> =
    useRef(null);
  useEffect(() => {
    animationRef.current = anime({
      targets: '.nav',
      translateY: [-64, 0],
      opacity: [0, 1],
      easing: 'easeInSine',
      delay: 700,
    });
  }, []);

  const handleConnectWallet = () => {
    //TODO: WORK ON WALLET CONNECTION HERE
    console.log('user tried to connect wallet');
  };

  return (
    <React.Fragment>
      <Box
        sx={{
          mb: { xs: 6, sm: 8 },
        }}
      >
        <AppBar position="fixed" sx={{ backgroundColor: '#1C1C1C' }}>
          <Toolbar className="nav">
            <Box
              sx={{
                display: {
                  md: 'none',
                  sm: 'flex',
                  position: 'relative',
                  width: '80px',
                },
              }}
            >
              <NavLink to="/">
                <img
                  src={logo}
                  alt={formatMessage({ id: 'poker blocks logo' })}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: '-73px',
                  }}
                />
              </NavLink>
            </Box>
            <Grid
              container
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                display: { md: 'flex', xs: 'none' },
                ml: { md: 13, lg: 19, xl: 28 },
              }}
            >
              {navigationLinks.map(({ name, href }, index) =>
                href === '#' ? (
                  <div
                    style={{ position: 'relative', width: '80px' }}
                    key={index}
                  >
                    <NavLink to="/">
                      <img
                        src={logo}
                        alt={formatMessage({ id: 'poker blocks logo' })}
                        style={{
                          position: 'absolute',
                          left: 0,
                          right: 0,
                          bottom: '-73px',
                        }}
                      />
                    </NavLink>
                  </div>
                ) : (
                  <Grid item key={index}>
                    <HeaderLink to={href}>{name}</HeaderLink>
                  </Grid>
                )
              )}
            </Grid>
            <Grid
              item
              container
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
              flexWrap="nowrap"
              md={3}
              lg={2.5}
              xl={2}
            >
              <Grid item>
                <Button
                  onClick={handleConnectWallet}
                  variant="outlined"
                  size="small"
                  startIcon={<ConnectWallet />}
                  sx={{
                    border: '1.5px solid #FF3334',
                    borderRadius: '5px',
                    color: theme.common.label,
                    '& .MuiButton-startIcon svg g rect': {
                      transition: 'fill 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                      fill: theme.common.label,
                    },
                    '&:hover .MuiButton-startIcon svg g rect': {
                      fill: lighten('#FF3334', 0.2),
                    },
                    '&:hover': {
                      color: lighten('#FF3334', 0.2),
                      border: '1.5px solid',
                      borderColor: theme.palette.primary.light,
                    },
                  }}
                >
                  {formatMessage({ id: 'Connect wallet' })}
                </Button>
              </Grid>
              <Grid
                item
                sx={{
                  display: { md: 'none', xs: 'flex' },
                }}
              >
                <IconButton
                  aria-label="open drawer"
                  edge="end"
                  onClick={handleDrawerOpen}
                  sx={{
                    ...(openDrawer && { display: 'none' }),
                    '&.MuiButtonBase-root.MuiIconButton-root.MuiIconButton-edgeEnd.MuiIconButton-sizeMedium svg path':
                      {
                        transition:
                          'fill 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
                        fill: theme.common.label,
                      },
                    '&:hover.MuiButtonBase-root.MuiIconButton-root.MuiIconButton-edgeEnd.MuiIconButton-sizeMedium svg path':
                      {
                        fill: '#FF3334',
                      },
                  }}
                >
                  <BurgerMenuIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      </Box>
      <Modal
        open={openDrawer}
        onClose={handleDrawerClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <SwipeableDrawer
          sx={{
            '& .MuiDrawer-paper': {
              backgroundColor: '#1C1C1C',
            },
          }}
          variant="persistent"
          anchor="right"
          open={openDrawer}
          onOpen={handleDrawerOpen}
          onClose={handleDrawerClose}
        >
          <Box
            sx={{ width: 275, height: '100vh' }}
            role="presentation"
            onClick={handleDrawerClose}
            onKeyDown={handleDrawerClose}
          >
            <Grid
              container
              direction="column"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                height: '100%',
                py: 8,
              }}
            >
              {navigationLinks
                .filter(({ href }) => href !== '#')
                .map(({ name, href }, index) => (
                  <Grid item key={index}>
                    <NavLink
                      onClick={handleDrawerClose}
                      to={href}
                      className={classes.burgerLink}
                    >
                      {name}
                    </NavLink>
                  </Grid>
                ))}
            </Grid>
          </Box>
        </SwipeableDrawer>
      </Modal>
    </React.Fragment>
  );
}

export default injectIntl(Navigation);
