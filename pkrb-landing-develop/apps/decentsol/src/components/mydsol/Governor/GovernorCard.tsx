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
  SensorsOutlined,
  MoreVertRounded,
} from '@mui/icons-material';
import { FormattedRelativeTime, injectIntl, IntlShape } from 'react-intl';
import DSOLTOKEN from '../../../assets/images/dsol_token.png';
import React, { useState } from 'react';
import moment from 'moment';

export interface Governor {
  governor_id: string;
  governor_link: string;
  name: string;
  rarity: string;
  minimum_listed_price: number;
  is_blocked: boolean;
  is_on_marketplace: boolean;
  unlocks_on: Date | string | undefined;
}

export function GovernorCard({
  intl: { formatMessage },
  governor: {
    governor_id,
    governor_link,
    name,
    rarity,
    minimum_listed_price,
    is_blocked,
    is_on_marketplace,
    unlocks_on,
  },
  thawGovernor,
}: {
  thawGovernor: any;
  intl: IntlShape;
  governor: Governor;
}): JSX.Element {
  const theme = useTheme();
  const IS_BLOCKED = is_on_marketplace || is_blocked;

  const handleGovernorDelist = (governor_id: string) => {
    //TODO: call blockchain and backend api for governor delisting here
    console.log(governor_id);
    setIsMenuOpen(false);
  };

  const handleGovernorSale = (governor_id: string) => {
    //TODO: call blockchain and backend api for governor sale here
    console.log(governor_id);
    setIsMenuOpen(false);
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [anchorElement, setAnchorElement] = useState<any>(null);

  const openMoreMenu = (event: React.MouseEvent, governor_id: string) => {
    setAnchorElement(event.currentTarget);
    setIsMenuOpen(!isMenuOpen);
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
          boxShadow: '0px 0px 12px rgba(107, 190, 22, 0.5)',
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
          title={formatMessage({ id: IS_BLOCKED ? 'locked' : 'unlocked' })}
        >
          <IconButton
            size="small"
            sx={{ alignSelf: 'center', justifySelf: 'center' }}
            onClick={() => {
              if (is_blocked) {
                thawGovernor();
              }
            }}
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
        <img
          src={governor_link}
          alt="nft game"
          height="150px"
          width="125px"
          style={{
            borderRadius: '15px',
            position: 'absolute',
            left: '74px',
            top: '-75px',
            objectFit: 'cover',
          }}
        />
        <Box sx={{ alignSelf: 'center' }}>
          {is_on_marketplace ? (
            <Box sx={{ justifySelf: 'end', display: 'grid' }}>
              <Tooltip title={formatMessage({ id: 'more' })} arrow>
                <IconButton
                  onClick={(event) => openMoreMenu(event, governor_id)}
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
                        onClick={() => handleGovernorDelist(governor_id)}
                        sx={{
                          color: theme.common.offWhite,
                          '&:hover': {
                            color: theme.palette.primary.main,
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
          ) : is_blocked ? (
            new Date() < new Date(unlocks_on as number | string) ? (
              <Box
                component="span"
                style={{
                  display: 'grid',
                  justifySelf: 'end',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Typography sx={{ color: theme.common.offWhite }}>
                  {formatMessage({ id: 'unlocks' })}
                </Typography>
                <Typography sx={{ color: theme.common.offWhite }}>
                  <FormattedRelativeTime
                    value={Number(
                      moment(new Date(unlocks_on as number | string))
                        .diff(new Date(), 'seconds')
                        .toString()
                    )}
                    numeric="auto"
                    updateIntervalInSeconds={1}
                  />
                </Typography>
              </Box>
            ) : (
              <Typography
                sx={{ color: theme.common.green, textAlign: 'right' }}
              >
                {formatMessage({ id: 'unlockable' })}
              </Typography>
            )
          ) : (
            <Box sx={{ display: 'grid' }}>
              <Tooltip title={formatMessage({ id: 'more' })} arrow>
                <IconButton
                  onClick={(event) => openMoreMenu(event, governor_id)}
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
                        onClick={() => handleGovernorSale(governor_id)}
                        sx={{
                          color: theme.common.offWhite,
                          '&:hover': {
                            color: theme.palette.primary.main,
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
            Governor #{name}
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
              style={{ height: '36px', objectFit: 'cover' }}
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
      </Box>
    </Box>
  );
}

export default injectIntl(GovernorCard);
