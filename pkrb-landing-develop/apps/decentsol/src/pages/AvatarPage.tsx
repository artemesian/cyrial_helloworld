import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  useTheme,
  lighten,
  Popper,
  Fade,
  Button,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import { injectIntl, IntlShape } from 'react-intl';
import { Avatar } from '@temp-workspace/dsol/util-interfaces';
import AvatarCard from '../components/mydsol/Avatar/AvatarCard';
import AvatarSkeleton from '../components/mydsol/Avatar/AvatarSkeleton';
import { ExpandMoreRounded } from '@mui/icons-material';
import Scrollbars from 'react-custom-scrollbars-2';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  fetchAvatars,
  mintAvatar,
  getAvatarMintPrice,
} from '@temp-workspace/blockchain/dsol-chain';

export function AvatarPage({ intl: { formatMessage } }: { intl: IntlShape }) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [isAvatarsLoading, setIsAvatarsLoading] = useState<boolean>(true);

  const [rarities, setRarities] = useState<string[]>([]);
  const [isRaritiesLoading, setIsRaritiesLoading] = useState<boolean>(true);
  const [isAvatarMintAmountLoading, setIsAvatarMintAmountLoading] =
    useState<boolean>(true);
  const [selectedRarity, setSelectedRarity] = useState<string>('');
  const [raritiesCount, setRaritiesCount] = useState<{
    [index: string]: number;
  }>({});
  const [avatarMintAmount, setAvatarMintAmount] = useState<number>(0);
  const wallet = useWallet();

  const loadAvatars = async () => {
    setIsAvatarsLoading(true);
    setIsRaritiesLoading(true);
    setIsAvatarMintAmountLoading(true);

    try {
      const users = await fetchAvatars(wallet?.publicKey as PublicKey);
      const salesData = await getAvatarMintPrice();
      const Z = 100;
      const x = salesData?.counter;
      const rarities = new Set();
      const avatarPrice =
        15 *
        Math.floor(
          (Z +
            270 * (Math.exp(0.08 * x - 10) / (1 + Math.exp(0.08 * x - 10))) +
            x ** 0.6) /
            15
        );
      rarities.add('');
      const _raritiesCount: {
        [index: string]: number;
      } = {};

      _raritiesCount['allRarities'] = users.length;
      users.forEach((avatar) => {
        rarities.add(avatar.rarity);
        if (_raritiesCount[avatar?.rarity] >= 1) {
          _raritiesCount[avatar?.rarity] += 1;
        } else {
          _raritiesCount[avatar?.rarity] = 1;
        }
      });

      setRaritiesCount(_raritiesCount);
      setRarities(Array.from(rarities) as string[]);
      setAvatars(users);
      setAvatarMintAmount(avatarPrice);
    } catch (error) {
      console.log('Error from Avatar-page: ', error);
    }
    setIsRaritiesLoading(false);
    setIsAvatarsLoading(false);
    setIsAvatarMintAmountLoading(false);
  };

  useEffect(() => {
    //TODO: FETCH AVATAR DATA FOR THE PARTICULAR USER

    if (!wallet.connected) {
      setIsAvatarsLoading(false);
      setAvatars([]);
      console.log('wallet not connected');
      return;
    }

    loadAvatars();
  }, [wallet?.connected]);

  const theme = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [anchorElement, setAnchorElement] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const [isAvatarMinting, setIsAvatarMinting] = useState<boolean>(false);

  const handleAvatarMint = async () => {
    //TODO: FETCH THE API TO MINT AVATAR HERE
    setIsAvatarMinting(true);
    const signature = await mintAvatar(wallet);
    if (signature === false) {
      console.log('Error: ', signature);
    } else {
      setIsAvatarMinting(false);
      loadAvatars();
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          padding: '0 2%',
          margin: `${theme.spacing(5)} 0`,
          alignItems: 'center',
        }}
      >
        <Typography sx={{ ...theme.typography.h2 }}>
          {formatMessage({ id: 'mintAvatar' })}
        </Typography>
        <Box
          sx={{
            justifySelf: 'end',
            display: 'grid',
            justifyItems: 'center',
            gap: theme.spacing(0.5),
          }}
        >
          {wallet?.connected && (
            <Button
              onClick={handleAvatarMint}
              variant="contained"
              color="primary"
              size="large"
            >
              {isAvatarMinting && (
                <CircularProgress
                  color="secondary"
                  size="30px"
                  sx={{
                    padding: theme.spacing(0.5),
                    marginRight: theme.spacing(0.5),
                  }}
                />
              )}
              {formatMessage({ id: 'mint' })}
              {' ( '}
              {isAvatarMintAmountLoading ? (
                <Skeleton
                  animation="pulse"
                  variant="text"
                  width="30px"
                  height="100%"
                  sx={{
                    backgroundColor: lighten(theme.palette.grey[900], 0.2),
                  }}
                />
              ) : (
                <span> {avatarMintAmount} Dsol </span>
              )}
              {' )'}
            </Button>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto auto 1fr',
          alignItems: 'center',
          position: 'relative',
          width: 'fit-content',
          gap: theme.spacing(1),
          transition: 'all ease-in 0.3s',
          marginBottom: theme.spacing(2),
          padding: '0 0 0 2%',
          ':hover .allRarities': {
            transition: 'all ease-in 0.3s',
            color: lighten(theme.palette.primary.main, 0.5),
          },
          ':hover .MuiSvgIcon-colorPrimary': {
            transition: 'all ease-in 0.3s',
            fill: lighten(theme.palette.primary.main, 0.5),
          },
        }}
      >
        <Typography sx={{ ...theme.typography.h2 }} component="span">
          {formatMessage({ id: 'myAvatars' })}
        </Typography>
        <Box
          sx={{ cursor: 'pointer' }}
          onClick={(event) => {
            setAnchorElement(event.currentTarget);
            setIsMenuOpen((previuosValue) => !previuosValue);
          }}
        >
          <Typography
            sx={{
              ...theme.typography.h2,
              color: theme.palette.primary.main,
            }}
            className="allRarities"
            component="span"
          >
            {formatMessage({
              id: selectedRarity === '' ? 'allRarities' : selectedRarity,
            })}
            (
            {
              raritiesCount[
                selectedRarity === '' ? 'allRarities' : selectedRarity
              ]
            }
            )
          </Typography>
          <Typography
            sx={{
              ...theme.typography.h2,
              position: 'absolute',
              top: '-10%',
              right: '-40px',
            }}
            className="expandMore"
            component="span"
          >
            <ExpandMoreRounded color="primary" sx={{ fontSize: '50px' }} />
          </Typography>
        </Box>
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
                {isRaritiesLoading ? (
                  [...new Array(4)].map((_, index) => (
                    <Skeleton
                      variant="rectangular"
                      height="20px"
                      width="100px"
                      sx={{ borderRadius: '10px' }}
                    />
                  ))
                ) : rarities.length > 0 ? (
                  rarities.map((rarity, index) => (
                    <Button
                      key={index}
                      onClick={() => {
                        setSelectedRarity(rarity);
                        setAnchorElement(null);
                        setIsMenuOpen(false);
                      }}
                      sx={{
                        color:
                          selectedRarity === rarity
                            ? theme.palette.primary.main
                            : theme.common.offWhite,
                        '&:hover': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      {formatMessage({
                        id: rarity === '' ? 'allRarities' : rarity,
                      })}
                      ({raritiesCount[rarity === '' ? 'allRarities' : rarity]})
                    </Button>
                  ))
                ) : (
                  <Button disabled>
                    {formatMessage({ id: 'noRarities' })}
                  </Button>
                )}
              </Box>
            </Fade>
          )}
        </Popper>
      </Box>

      <Scrollbars>
        <Box
          sx={{
            height: '100%',
            display: 'grid',
            gap: '25px',
            justifyContent: 'center',
            gridTemplateColumns: 'repeat(auto-fill, minmax(auto, 400px))',
            gridTemplateRows: 'repeat(auto-fit, 320px)',
          }}
        >
          {isAvatarsLoading ? (
            [...new Array(4)].map((_, index) => <AvatarSkeleton key={index} />)
          ) : avatars.length > 0 ? (
            avatars.map((player_avatar, index) =>
              selectedRarity === player_avatar.rarity ||
              selectedRarity === '' ? (
                <AvatarCard avatar={player_avatar} key={index} />
              ) : null
            )
          ) : (
            <Typography>{formatMessage({ id: 'youHaveNoAvatars' })}</Typography>
          )}
        </Box>
      </Scrollbars>
    </Box>
  );
}

export default injectIntl(AvatarPage);
