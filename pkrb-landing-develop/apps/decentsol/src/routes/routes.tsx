import { Navigate } from 'react-router';
import { Typography } from '@mui/material';
import MyDsol from '../pages/MyDsol.page';
import AvatarPage from '../pages/AvatarPage';
import GovernorPage from '../pages/GovernorPage';
import StakepoolPage from '../pages/StakepoolPage';
import ValidatorPage from '../pages/ValidatorPage';
import WalletPage from '../pages/WalletPage';
import ProposalPage from '../pages/ProposalPage';
import ProposalVote from '../components/mydsol/Proposal/ProposalVote';

export const routes = [
  { path: '/', element: <Navigate to="/mydsol/stakepool" /> },
  { path: '/mydsol', element: <Navigate to="/mydsol/stakepool" /> },
  {
    path: '/mydsol',
    element: <MyDsol />,
    children: [
      { path: 'wallet', element: <WalletPage /> },
      { path: 'validator', element: <ValidatorPage /> },
      { path: 'proposal', element: <ProposalPage /> },
      { path: 'proposal/:proposal_id', element: <ProposalVote /> },
      { path: 'governor', element: <GovernorPage /> },
      { path: 'avatar', element: <AvatarPage /> },
      {
        path: 'stakepool',
        element: <StakepoolPage />,
      },
      {
        path: '*',
        element: <Typography>Route not found</Typography>,
      },
    ],
  },
  {
    path: '*',
    element: <Typography>Route not found</Typography>,
  },
];
