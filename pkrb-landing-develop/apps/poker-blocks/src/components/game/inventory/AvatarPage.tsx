import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { injectIntl, IntlShape } from 'react-intl';
import { Avatar } from '@temp-workspace/dsol/util-interfaces';
import AvatarCard from './AvatarCard';
import AvatarSkeleton from './AvatarSkeleton';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { fetchAvatars } from '@temp-workspace/blockchain/dsol-chain';

export function AvatarPage({ intl: { formatMessage } }: { intl: IntlShape }) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [isAvatarsLoading, setIsAvatarsLoading] = useState<boolean>(true);
  const wallet = useWallet();

  useEffect(() => {
    //TODO: FETCH DATA WITH RESPECT TO THE ACTIVE_INVENTORY_TAB FOR THE PARTICULAR USER

    if (!wallet.connected) {
      setIsAvatarsLoading(false);
      setAvatars([]);
      console.log('wallet not connected');
      return;
    }

    (async () => {
      setIsAvatarsLoading(true);
      const users = await fetchAvatars(wallet?.publicKey as PublicKey);
      setAvatars(users);
      setIsAvatarsLoading(false);
    })();
  }, [wallet?.connected]);

  return (
    <>
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
        {isAvatarsLoading
          ? [...new Array(4)].map((_, index) => <AvatarSkeleton key={index} />)
          : avatars.map((player_avatar: Avatar, index: number) => (
              <AvatarCard avatar={player_avatar} key={7} />
            ))}
      </Box>
    </>
  );
}

export default injectIntl(AvatarPage);
