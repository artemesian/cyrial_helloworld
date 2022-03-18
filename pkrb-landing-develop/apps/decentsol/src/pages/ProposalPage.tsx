import {
  Box,
  Typography,
  Button,
  useTheme,
  CircularProgress,
  Popper,
  Fade,
  Skeleton,
  lighten,
} from '@mui/material';
import { injectIntl, IntlShape } from 'react-intl';
import { useState, useEffect } from 'react';
import { ExpandMoreRounded } from '@mui/icons-material';
import Scrollbars from 'react-custom-scrollbars-2';
import ProposalTable from '../components/mydsol/Proposal/ProposalTable';
import NewProposalDialog from '../components/mydsol/Proposal/NewProposalDialog';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  fetchGovernors,
  submitProposal,
  fetchProposals,
} from '@temp-workspace/blockchain/dsol-chain';

export interface Proposal {
  proposal_id: string;
  proposal: string;
  number_of_votes: number;
  created_at: string | Date;
  ending_date: string | Date;
  is_ongoing: boolean;
  options: { id: string; option: string }[];
  duration: number;
}

export function ProposalPage({
  intl: { formatMessage, formatNumber },
}: {
  intl: IntlShape;
}) {
  interface Governor {
    governor_id: string;
    image_ref: string;
  }

  const theme = useTheme();
  const [isCreatingProposal, setIsCreatingProposal] = useState<boolean>(false);
  const [isProposalCreationDialogOpen, setIsProposalCreationDialogOpen] =
    useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [anchorElement, setAnchorElement] = useState<
    (EventTarget & HTMLDivElement) | null
  >(null);
  const [selectedProposalType, setSelectedProposalType] = useState<string>('');
  const [proposalTypes, setProposalTypes] = useState<string[] | undefined>([
    '',
  ]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isProposalsLoading, setIsProposalsLoading] = useState<boolean>(true);
  const [isGovernorsLoading, setIsGovernorsLoading] = useState<boolean>(true);
  const [governors, setGovernors] = useState<Governor[]>([]);
  const wallet = useWallet();

  const loadAvailableGovernors = async () => {
    try {
      const governors = await fetchGovernors(wallet.publicKey as PublicKey);
      setGovernors(
        governors.map((governor: any) => ({
          governor_id: governor.governor_id,
          image_ref: governor.governor_link,
        }))
      );
    } catch (error) {
      throw new Error(' ' + error);
    }
    setIsGovernorsLoading(false);
  };

  const loadProposals = async () => {
    if (!isProposalsLoading) setIsProposalsLoading(true);

    try {
      const proposals = await fetchProposals();
      setProposals(proposals);
    } catch (error) {
      throw new Error('' + error);
    }

    setIsProposalsLoading(false);
  };

  useEffect(() => {
    setIsProposalsLoading(true);
    if (!wallet.connected) {
      console.log('Wallet not connected');
      setIsProposalsLoading(false);
      return;
    }
    (async () => {
      await loadAvailableGovernors();
      await loadProposals();
    })();
  }, [wallet.connected]);

  const createProposal = async (propd: Proposal) => {
    if (governors.length > 0) {
      //TODO: FETCH API TO CREATE PROPOSAL HERE
      setIsCreatingProposal(true);
      const rand = Math.round(Math.random() * (governors.length - 1));
      const randomGovernor = new PublicKey(governors[rand].governor_id);
      const response = await submitProposal(wallet, randomGovernor, propd);
      setIsCreatingProposal(false);
      console.log(response);
      loadProposals();
    } else alert("cannot create proposal if you don't have a governor");
  };

  return (
    <>
      <NewProposalDialog
        isDialogOpen={isProposalCreationDialogOpen}
        closeDialog={() => setIsProposalCreationDialogOpen(false)}
        createProposal={createProposal}
        isCreatingProposal={isCreatingProposal}
      />
      <Box
        sx={{
          height: '100%',
          padding: '0 5%',
          display: 'grid',
          gridTemplateRows: 'auto auto 1fr',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            alignItems: 'center',
            paddingTop: '3%',
          }}
        >
          <Typography variant="h1">
            {formatMessage({
              id:
                isGovernorsLoading || governors.length === 0
                  ? 'dsolDaoProposals'
                  : 'createAProposal',
            })}
          </Typography>
          {governors.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{
                justifySelf: 'end',
                '&.Mui-disabled': {
                  color: 'white',
                },
              }}
              onClick={() => setIsProposalCreationDialogOpen(true)}
              disabled={
                isCreatingProposal ||
                isGovernorsLoading ||
                governors.length === 0
              }
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
              {formatMessage({
                id: isGovernorsLoading
                  ? 'Loading Governors'
                  : isCreatingProposal
                  ? 'creating...'
                  : 'createProposal',
              })}
            </Button>
          )}
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
            marginTop: theme.spacing(10),
            marginBottom: theme.spacing(1),
            ':hover .types': {
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
            {formatMessage({ id: 'proposals' })}
          </Typography>
          <Box
            sx={{ cursor: 'pointer' }}
            onClick={(event) => {
              setAnchorElement(event.currentTarget);
              setIsMenuOpen((previousValue) => !previousValue);
            }}
          >
            <Typography
              sx={{
                ...theme.typography.h2,
                color: theme.palette.primary.main,
              }}
              className="types"
              component="span"
            >
              {formatMessage({
                id: selectedProposalType === '' ? 'all' : selectedProposalType,
              })}
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
                  {!proposalTypes ? (
                    [...new Array(4)].map((_, index) => (
                      <Skeleton
                        variant="rectangular"
                        height="20px"
                        key={index}
                        width="100px"
                        sx={{ borderRadius: '10px' }}
                      />
                    ))
                  ) : proposalTypes.length > 0 ? (
                    proposalTypes.map((proposal, index) => (
                      <Button
                        key={index}
                        onClick={() => {
                          setSelectedProposalType(proposal);
                          setIsProposalsLoading(true);
                          setAnchorElement(null);
                          setIsMenuOpen(false);
                        }}
                        sx={{
                          color:
                            selectedProposalType === proposal
                              ? theme.palette.primary.main
                              : theme.common.offWhite,
                          '&:hover': {
                            color: theme.palette.primary.main,
                          },
                        }}
                      >
                        {formatMessage({
                          id: proposal === '' ? 'all' : proposal,
                        })}
                      </Button>
                    ))
                  ) : (
                    <Button
                      disabled
                      sx={{
                        backgroundColor: theme.common.line,
                      }}
                    >
                      {formatMessage({ id: 'noProposalTypes' })}
                    </Button>
                  )}
                </Box>
              </Fade>
            )}
          </Popper>
        </Box>

        <Box
          sx={{
            height: '98%',
            background: 'rgba(46, 57, 61, 1)',
          }}
        >
          <Scrollbars autoHide>
            <ProposalTable
              rows={proposals}
              isProposalsLoading={isProposalsLoading}
            />
          </Scrollbars>
        </Box>
      </Box>
    </>
  );
}

export default injectIntl(ProposalPage);
