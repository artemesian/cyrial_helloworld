import {
  Box,
  useTheme,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Popper,
  Fade,
} from '@mui/material';
import {
  LockOpenOutlined,
  LockOutlined,
  SwapHorizontalCircleRounded,
  TimelapseOutlined,
  SensorsOutlined,
  MoreVertRounded,
} from '@mui/icons-material';
import { injectIntl, IntlShape, FormattedRelativeTime } from 'react-intl';
import DSOLTOKEN from '../../../assets/images/dsol_token.png';
import moment from 'moment';
import React, { useState } from 'react';
import { Avatar } from '@temp-workspace/dsol/util-interfaces';

export function AvatarCard({
  intl: { formatMessage },
  avatar: {
    avatar_id,
    avatar_link,
    name,
    rarity,
    minimum_listed_price,
    avatar_xp,
    is_owned,
    avatar_level,
    is_on_marketplace,
    lease_end_date,
  },
}: {
  intl: IntlShape;
  avatar: Avatar;
}): JSX.Element {
  const theme = useTheme();
  const IS_BLOCKED =
    is_on_marketplace ||
    (is_owned && !is_on_marketplace && lease_end_date !== undefined);
  const IS_RENTED = !is_on_marketplace && lease_end_date !== undefined;

  const handleAvatarDelist = (avatar_id: string) => {
    //TODO: call blockchain and backend api for avatar delisting here
    console.log(avatar_id);
    setIsMenuOpen(false);
  };

  const handleAvatarSale = (avatar_id: string) => {
    //TODO: call blockchain and backend api for avatar sale here
    console.log(avatar_id);
    setIsMenuOpen(false);
  };

  const handleAvatarLease = (avatar_id: string) => {
    //TODO: call blockchain and backend api for avatar leasing here
    console.log(avatar_id);
    setIsMenuOpen(false);
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorElement, setAnchorElement] = useState<any>(null);

  const openAvatarMoreMenu = (event: React.MouseEvent, avatar_id: string) => {
    setAnchorElement(event.currentTarget);
    setIsMenuOpen(!isMenuOpen);
    //TODO: open avatar card for avatar_id passed in parameters
  };

  return (
    <Box
      sx={{
        position: 'relative',
        color: theme.common.label,
        width: '400px',
        padding: '15px 0',
        marginTop: '75px',
        borderRadius: '9px',
        transition: 'ease-in 0.4s',
        backgroundColor: 'rgba(16, 19, 26, 0.75)',
        boxSizing: 'border-box',
        '&:hover': {
          transition: 'ease-in 0.4s',
          boxShadow: '0px 0px 12px rgba(243, 182, 68, 0.9)',
        },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          width: '100%',
          columnGap: '150px',
          gridTemplateColumns: '87px 150px',
        }}
      >
        <Tooltip
          arrow
          title={formatMessage({ id: IS_BLOCKED ? 'blocked' : 'open' })}
        >
          <IconButton
            size="small"
            sx={{ alignSelf: 'center', justifySelf: 'center' }}
          >
            {IS_BLOCKED ? (
              <LockOutlined
                fontSize="small"
                sx={{
                  color: theme.common.offWhite,
                  padding: '10px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '100%',
                }}
              />
            ) : (
              <LockOpenOutlined
                fontSize="small"
                sx={{
                  color: theme.common.offWhite,
                  padding: '10px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '100%',
                }}
              />
            )}
          </IconButton>
        </Tooltip>
        <Box sx={{ position: 'absolute', left: '74px', top: '-75px' }}>
          <Box sx={{ position: 'relative' }}>
            <img
              src={avatar_link}
              alt="nft game"
              height="150px"
              width="125px"
              style={{ borderRadius: '15px', objectFit: 'cover' }}
            />
            <Typography
              sx={{
                position: 'absolute',
                left: '5px',
                top: '5px',
                backgroundColor: 'black',
                borderRadius: '100%',
                height: '20px',
                width: '20px',
                display: 'grid',
                justifyContent: 'center',
              }}
            >
              {avatar_level}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ alignSelf: 'center' }}>
          {IS_RENTED ? (
            <>
              <Box
                component="span"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  alignItems: 'center',
                }}
              >
                <Tooltip arrow title={formatMessage({ id: 'timeLeft' })}>
                  <IconButton size="small">
                    <TimelapseOutlined
                      fontSize="small"
                      sx={{ color: theme.common.offWhite }}
                    />
                  </IconButton>
                </Tooltip>
                <Typography sx={{ color: theme.common.offWhite }}>
                  <FormattedRelativeTime
                    value={Number(
                      moment(new Date(lease_end_date))
                        .diff(new Date(), 'seconds')
                        .toString()
                    )}
                    numeric="auto"
                    updateIntervalInSeconds={1}
                  />
                </Typography>
              </Box>
              <Box
                component="span"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  alignItems: 'center',
                }}
              >
                <Tooltip arrow title={formatMessage({ id: 'rentedNFT' })}>
                  <IconButton size="small">
                    <SwapHorizontalCircleRounded
                      fontSize="small"
                      sx={{ color: theme.common.offWhite }}
                    />
                  </IconButton>
                </Tooltip>
                <Typography sx={{ color: theme.common.offWhite }}>
                  {formatMessage({ id: 'rented' })}
                </Typography>
              </Box>
            </>
          ) : is_on_marketplace ? (
            <Box sx={{ justifySelf: 'end', display: 'grid' }}>
              <Tooltip title={formatMessage({ id: 'more' })} arrow>
                <IconButton
                  onClick={(event) => openAvatarMoreMenu(event, avatar_id)}
                  size="small"
                  sx={{ justifySelf: 'end' }}
                >
                  <MoreVertRounded
                    sx={{
                      transform: 'rotate(90deg)',
                      color: theme.common.offWhite,
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Popper open={isMenuOpen} anchorEl={anchorElement} transition>
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
                      <Button
                        onClick={() => handleAvatarDelist(avatar_id)}
                        sx={{
                          color: theme.common.offWhite,
                          '&:hover': {
                            color: theme.common.yellow,
                          },
                        }}
                      >
                        {formatMessage({ id: 'delist' })}
                      </Button>
                    </Box>
                  </Fade>
                )}
              </Popper>
              <Box
                component="span"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  alignItems: 'center',
                  justifySelf: 'end',
                }}
              >
                <Typography sx={{ color: theme.common.offWhite }}>
                  {formatMessage({ id: 'onMarketplace' })}
                </Typography>
                <Tooltip arrow title={formatMessage({ id: 'onMarketplace' })}>
                  <IconButton size="small">
                    <SensorsOutlined
                      fontSize="small"
                      sx={{ color: theme.common.offWhite }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'grid' }}>
              <Tooltip title={formatMessage({ id: 'more' })} arrow>
                <IconButton
                  onClick={(event) => openAvatarMoreMenu(event, avatar_id)}
                  size="small"
                  sx={{ justifySelf: 'end' }}
                >
                  <MoreVertRounded
                    sx={{
                      transform: 'rotate(90deg)',
                      color: theme.common.offWhite,
                    }}
                  />
                </IconButton>
              </Tooltip>
              <Popper open={isMenuOpen} anchorEl={anchorElement} transition>
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
                      <Button
                        size="small"
                        onClick={() => handleAvatarLease(avatar_id)}
                        sx={{
                          color: theme.common.offWhite,
                          '&:hover': {
                            color: theme.common.yellow,
                          },
                        }}
                      >
                        {formatMessage({ id: 'lease' })}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleAvatarSale(avatar_id)}
                        sx={{
                          color: theme.common.offWhite,
                          '&:hover': {
                            color: theme.common.yellow,
                          },
                        }}
                      >
                        {formatMessage({ id: 'sell' })}
                      </Button>
                    </Box>
                  </Fade>
                )}
              </Popper>
            </Box>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto auto',
          gap: '10px',
          alignItems: 'center',
          marginTop: '7px',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            justifyItems: 'center',
            gap: '10px',
            marginTop: '30px',
          }}
        >
          <Typography sx={{ fontSize: '1.5rem', color: theme.common.offWhite }}>
            {name}
          </Typography>
          <Chip
            label={formatMessage({ id: rarity })}
            size="small"
            sx={{
              backgroundColor: theme.common.line,
              color: theme.common.offWhite,
            }}
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '10px',
            }}
          >
            <img
              src={DSOLTOKEN}
              alt="dsol_token_symbol"
              style={{ height: '100%', objectFit: 'cover' }}
            />
            <Box>
              <Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>
                {formatMessage({ id: 'minimumListedPrice' })}
              </Typography>
              <Typography
                sx={{ color: theme.common.offWhite }}
              >{`${minimum_listed_price} ${formatMessage({
                id: 'dsolTokens',
              })}`}</Typography>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: 'grid',
            justifyItems: 'center',
            gap: '8px',
          }}
        >
          <Typography sx={{ fontSize: 'larger', color: theme.common.offWhite }}>
            {`${avatar_xp} ${formatMessage({ id: 'XP' })}`}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: '5px',
              gridTemplateColumns: 'auto 1fr',
              marginTop: '10px',
            }}
          >
            <Typography component="span" sx={{ color: theme.common.offWhite }}>
              {formatMessage({ id: 'statut' })}
            </Typography>
            <Typography component="span" sx={{ color: 'rgb(243,182,68,0.6)' }}>
              {is_owned
                ? formatMessage({ id: 'owned' })
                : formatMessage({ id: 'borrowed' })}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default injectIntl(AvatarCard);
