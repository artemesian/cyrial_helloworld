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
import { ExpandMoreRounded } from '@mui/icons-material';
import Scrollbars from 'react-custom-scrollbars-2';
import GovernorCard from '../components/mydsol/Governor/GovernorCard';
import GovernorSkeleton from '../components/mydsol/Governor/GovernorSkeleton';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  fetchGovernors,
  mintGovernors,
  getGovernorMintPrice,
  unlockGovernor,
} from '@temp-workspace/blockchain/dsol-chain';

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

export function GovernorPage({ intl: { formatMessage } }: { intl: IntlShape }) {
  const [governors, setGovernors] = useState<Governor[]>([]);
  const [isGovernorsLoading, setIsGovernorsLoading] = useState<boolean>(true);

  const [rarities, setRarities] = useState<string[]>([]);
  const [isRaritiesLoading, setIsRaritiesLoading] = useState<boolean>(true);
  const [selectedRarity, setSelectedRarity] = useState<string>('');
  const [governorMintAmount, setGovernorMintAmount] = useState<number>(5.2);
  const [isGovernorMintAmountLoading, setIsGovernorMintAmountLoading] =
    useState(true);
  const [raritiesCount, setRaritiesCount] = useState<{
    [index: string]: number;
  }>({});

  const wallet = useWallet();

  const loadGovernors = async () => {
    setIsGovernorsLoading(true);
    setIsRaritiesLoading(true);
    setIsGovernorMintAmountLoading(true);
    try {
      const governors = await fetchGovernors(wallet?.publicKey as PublicKey);
      const rarities = new Set();

      const salesData = await getGovernorMintPrice();
      const governorPrice =
        ((Number(salesData?.vault_total.toString()) / 10 ** 9) * 1.25) /
        salesData?.counter;

      rarities.add('');
      const _raritiesCount: {
        [index: string]: number;
      } = {};

      _raritiesCount['allRarities'] = governors.length;
      governors.forEach((governor) => {
        rarities.add(governor.rarity);
        if (_raritiesCount[governor?.rarity] >= 1) {
          _raritiesCount[governor?.rarity] += 1;
        } else {
          _raritiesCount[governor?.rarity] = 1;
        }
      });

      setRaritiesCount(_raritiesCount);
      setRarities(Array.from(rarities) as string[]);

      setGovernors(governors);
      setGovernorMintAmount(Number(governorPrice.toFixed(4)));
    } catch (error) {
      throw new Error('Error from Governor-page' + error);
    }
    setIsRaritiesLoading(false);
    setIsGovernorsLoading(false);
    setIsGovernorMintAmountLoading(false);
  };

  useEffect(() => {
    //TODO: FETCH GOVERNOR DATA FOR THE PARTICULAR USER

    if (!wallet.connected) {
      setIsGovernorsLoading(false);
      setIsGovernorMinting(false);
      setGovernors([]);
      console.log('wallet not connected');
      return;
    }

    loadGovernors();
  }, [wallet?.connected]);

  const theme = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [anchorElement, setAnchorElement] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const [isGovernorMinting, setIsGovernorMinting] = useState<boolean>(false);

  const handleGovernorMint = async () => {
    //TODO: FETCH THE API TO MINT GOVERNOR HERE
    setIsGovernorMinting(true);
    const signature = await mintGovernors(wallet);
    if (signature === false) {
      console.log('Error: ', signature);
    } else {
      loadGovernors();
    }
    setIsGovernorMinting(false);
  };

  const thawGovernor = async (governor: any) => {
    const governorPublickey = new PublicKey(governor.governor_id);
    setIsGovernorsLoading(true);
    try {
      await unlockGovernor(wallet, governorPublickey);
      await loadGovernors();
    } catch (error) {
      console.log(error);
    }
    setIsGovernorsLoading(false);
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
          {formatMessage({ id: 'mintGovernor' })}
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
              onClick={handleGovernorMint}
              variant="contained"
              color="primary"
              size="large"
            >
              {isGovernorMinting && (
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
              {isGovernorMintAmountLoading ? (
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
                <span> {governorMintAmount} SOL </span>
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
          {formatMessage({ id: 'myGovernors' })}
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
          {isGovernorsLoading ? (
            [...new Array(4)].map((_, index) => (
              <GovernorSkeleton key={index} />
            ))
          ) : governors.length > 0 ? (
            governors.map((player_governor, index) =>
              selectedRarity === player_governor.rarity ||
              selectedRarity === '' ? (
                <GovernorCard
                  governor={player_governor}
                  key={index}
                  thawGovernor={() => thawGovernor(player_governor)}
                />
              ) : null
            )
          ) : (
            <Typography>
              {formatMessage({ id: 'youHaveNoGovernors' })}
            </Typography>
          )}
        </Box>
      </Scrollbars>
    </Box>
  );
}

export default injectIntl(GovernorPage);
