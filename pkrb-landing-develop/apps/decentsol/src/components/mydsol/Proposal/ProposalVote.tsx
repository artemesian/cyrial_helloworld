import { useState, useEffect } from 'react';
import {
  useTheme,
  Box,
  Typography,
  Skeleton,
  Slider,
  Button,
  Tooltip,
  IconButton,
  lighten,
  Avatar,
  CircularProgress,
} from '@mui/material';
import { injectIntl, IntlShape } from 'react-intl';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBackIosNewRounded } from '@mui/icons-material';
import Scrollbars from 'react-custom-scrollbars-2';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  fetchGovernors,
  fetchProposal,
  submitVote,
} from '@temp-workspace/blockchain/dsol-chain';

export function ProposalVote({ intl: { formatMessage } }: { intl: IntlShape }) {
  const theme = useTheme();
  const { proposal_id } = useParams();
  const navigate = useNavigate();

  interface option {
    option_id: string;
    option_value: string;
    user_vote: number | number[];
  }

  interface Proposal {
    proposal_id: string;
    proposal: string;
    options: option[];
    is_ongoing: boolean;
    max_vote_bump: number;
    votes: any;
    result: any;
    number_of_votes: number;
  }

  interface Governor {
    governor_id: string;
    image_ref: string;
    has_voted: boolean;
  }

  const [isGovernorsLoading, setIsGovernorsLoading] = useState<boolean>(true);
  const [governorHasVoted, setGovernorHasVoted] = useState<boolean>(false);
  const [governors, setGovernors] = useState<Governor[]>([]);
  const [selectedGovernors, setSelectedGovernors] = useState<Governor[]>([]);
  const wallet = useWallet();

  const loadGovernorsAndProposals = async () => {
    if (!isGovernorsLoading) setIsGovernorsLoading(true);
    if (!isProposalLoading) setIsProposalLoading(true);
    try {
      let governors: any = await fetchGovernors(wallet.publicKey as PublicKey);
      setSelectedGovernors([governors[0]]);

      const proposal: any = await fetchProposal(wallet, proposal_id as string);

      governors = governors.map((governor: any) => ({
        governor_id: governor.governor_id,
        image_ref: governor.governor_link,
        has_voted: proposal?.votes[governor.governor_id] ? true : false,
      }));

      setGovernors(governors);
      console.log(proposal);
      setProposal({
        proposal_id: proposal.proposal_id,
        proposal: proposal.proposal,
        is_ongoing: proposal.is_ongoing,
        options: proposal.choices.map((choice: any, i: number) => ({
          option_id: i,
          option_value: choice,
          user_vote: governors[0].has_voted
            ? proposal.votes[governors[0].governor_id].choices[i]
            : 0,
        })),
        max_vote_bump: proposal?.max_vote_bump,
        number_of_votes: proposal?.number_of_votes,
        votes: proposal?.votes,
        result: proposal?.result,
      });
    } catch (error) {
      throw new Error(' ' + error);
    }
    setIsGovernorsLoading(false);
    setIsProposalLoading(false);
  };

  useEffect(() => {
    //TODO: FETCH API TO LOAD USER GOVERNORS HERE

    if (!wallet.connected) {
      console.log('Wallet not connected');
      return;
    }
    loadGovernorsAndProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.connected]);

  const [isProposalLoading, setIsProposalLoading] = useState(true);
  const [isResultLoading, setIsResultLoading] = useState(false);
  const [displayResult, setDisplayResult] = useState(false);
  const [proposal, setProposal] = useState<Proposal>({
    proposal_id: '',
    proposal: '',
    options: [],
    is_ongoing: true,
    max_vote_bump: 0,
    votes: {},
    result: {},
    number_of_votes: 0,
  });

  const handleVoteOption = (newValue: number | number[], option_id: string) => {
    const newOptions: option[] | undefined = proposal?.options.map((option) => {
      if (option.option_id === option_id) {
        console.log(newValue);
        return { ...option, user_vote: newValue };
      }
      return option;
    });

    setProposal({ ...proposal, options: newOptions });
  };

  const handleGovernorSelection = (governor: Governor) => {
    if (selectedGovernors.length >= 10) {
      alert('Cannot select more than 10 Governors');
      return;
    }
    let wasGovernorSelected = false;
    const newSelectedGovernors: Governor[] = selectedGovernors?.filter((_) => {
      if (_.governor_id === governor.governor_id) wasGovernorSelected = true;
      return _.governor_id !== governor.governor_id;
    });
    if (newSelectedGovernors.length === 0) {
      return;
    }
    setSelectedGovernors(
      wasGovernorSelected
        ? [...newSelectedGovernors]
        : [...newSelectedGovernors, governor]
    );
    if (newSelectedGovernors.length === 1 && wasGovernorSelected) {
      setIsProposalLoading(true);
      if (newSelectedGovernors[0].has_voted) {
        const newProposal = {
          ...proposal,
          options: proposal.options.map((option: any, i: number) => ({
            ...option,
            user_vote:
              proposal.votes[newSelectedGovernors[0].governor_id].choices[i],
          })),
        };
        setProposal(newProposal);
      } else {
        const newProposal = {
          ...proposal,
          options: proposal.options.map((option: any, i: number) => ({
            ...option,
            user_vote: 0,
          })),
        };
        setProposal(newProposal);
      }
      setTimeout(() => {
        setIsProposalLoading(false);
      }, 500);
      return;
    }
  };

  const [isVoteSubmitting, setIsVoteSubmitting] = useState(false);

  const handleSubmitVote = async () => {
    if (selectedGovernors.length > 0) {
      setIsVoteSubmitting(true);
      //TODO: FETCH API TO SUBMIT PROPOSAL HERE
      console.log(proposal);
      try {
        const response = await submitVote(
          wallet,
          selectedGovernors.map(
            (governor) => new PublicKey(governor.governor_id)
          ),
          proposal
        );
        console.log(response);
        loadGovernorsAndProposals();
      } catch (error) {
        throw new Error('' + error);
      }
      setIsVoteSubmitting(false);
    } else alert('you must select at least a govenor to submit a vote');
  };

  const showResult = async () => {
    setDisplayResult(!displayResult);
  };

  return (
    <Box
      sx={{
        height: '100%',
        padding: '0 5%',
        display: 'grid',
        gridTemplateRows: 'auto auto auto auto auto 1fr',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '40px auto 1fr',
          alignItems: 'center',
          paddingTop: '3%',
          gap: theme.spacing(3),
        }}
      >
        <Tooltip arrow title={formatMessage({ id: 'back' })}>
          <IconButton
            size="small"
            sx={{
              position: 'relative',
            }}
            onClick={() => navigate('/mydsol/proposal')}
          >
            <ArrowBackIosNewRounded
              color="primary"
              sx={{
                fontSize: '40px',
                position: 'absolute',
                top: '-10px',
              }}
            />
          </IconButton>
        </Tooltip>
        <Typography variant="h1">
          {formatMessage({ id: 'proposalId' })}
        </Typography>
        <Typography
          variant="h1"
          sx={{
            color: theme.palette.primary.main,
          }}
        >
          {proposal_id}
        </Typography>
      </Box>
      {(isGovernorsLoading || governors.length > 0) && (
        <Box
          sx={{
            background: 'rgba(46, 57, 61, 1)',
            padding: theme.spacing(1.5),
            margin: `${theme.spacing(3)} 0`,
            borderRadius: theme.spacing(2),
            height: theme.spacing(16),
          }}
        >
          <Scrollbars autoHide>
            <Box
              sx={{
                display: 'grid',
                height: '100%',
                alignContent: 'center',
                gridTemplateColumns: `repeat(${
                  governors.length > 0 ? governors.length : 5
                }, ${theme.spacing(10)})`,
                gap: theme.spacing(3),
              }}
            >
              {isGovernorsLoading &&
                [...new Array(5)].map((_, index) => (
                  <Box>
                    <Skeleton
                      variant="circular"
                      key={index}
                      animation="wave"
                      sx={{
                        height: theme.spacing(10),
                        width: theme.spacing(10),
                      }}
                    />
                    <Skeleton variant="text" animation="wave" />
                  </Box>
                ))}
              {!isGovernorsLoading &&
                governors.map((governor, index) => (
                  <Box>
                    <Avatar
                      key={index}
                      sx={{
                        height: theme.spacing(10),
                        width: theme.spacing(10),
                        border: selectedGovernors.find(
                          (_) => _.governor_id === governor.governor_id
                        )
                          ? `4px solid ${theme.common.green}`
                          : 0,
                      }}
                      src={governor.image_ref}
                      alt="governor"
                      onClick={() =>
                        proposal.is_ongoing
                          ? handleGovernorSelection(governor)
                          : null
                      }
                    />
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns:
                          governor.governor_id.length > 12 ? '1fr auto' : '1fr',
                      }}
                    >
                      {governor.governor_id.length <= 12 ? (
                        <Typography
                          sx={{
                            color: theme.common.placeholder,
                            width: '100%',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {governor.governor_id}
                        </Typography>
                      ) : (
                        <>
                          <Typography
                            sx={{
                              color: theme.common.placeholder,
                              width: '100%',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {governor.governor_id.slice(0, 12)}
                          </Typography>
                          <Typography
                            sx={{
                              color: theme.common.placeholder,
                              width: '100%',
                            }}
                          >
                            {`${governor.governor_id.slice(
                              governor.governor_id.length - 4
                            )}`}
                          </Typography>
                        </>
                      )}
                    </Box>
                    {governor.has_voted && (
                      <Typography
                        sx={{
                          color: theme.common.green,
                          width: '100%',
                          fontSize: '10px',
                          textAlign: 'center',
                          margin: 'auto',
                        }}
                      >
                        Voted
                      </Typography>
                    )}
                  </Box>
                ))}
            </Box>
          </Scrollbars>
        </Box>
      )}
      <Box
        display={'flex'}
        justifyContent={'space-between'}
        width={300}
        marginLeft={'auto'}
      >
        <Button
          color={displayResult ? 'warning' : 'info'}
          variant="contained"
          sx={{ justifySelf: 'end' }}
          size="large"
          disabled={
            isVoteSubmitting || isProposalLoading || governors.length === 0
          }
          onClick={() => showResult()}
        >
          {isResultLoading && (
            <CircularProgress
              color="primary"
              size="30px"
              sx={{
                padding: theme.spacing(0.5),
                marginRight: theme.spacing(0.5),
              }}
            />
          )}
          {displayResult
            ? formatMessage({ id: 'hideResult' })
            : formatMessage({ id: 'viewResult' })}
        </Button>
        {!proposal.is_ongoing ? (
          <Button
            color="error"
            variant="contained"
            sx={{ justifySelf: 'end' }}
            size="large"
            disableRipple
          >
            {formatMessage({ id: 'closed' })}
          </Button>
        ) : (
          governors.length > 0 &&
          (governorHasVoted ? (
            <Button
              color="inherit"
              variant="contained"
              sx={{ justifySelf: 'end' }}
              size="large"
              disableRipple
            >
              {formatMessage({ id: 'Voted' })}
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              sx={{
                justifySelf: 'end',
                '&.Mui-disabled': {
                  color: 'white',
                },
              }}
              onClick={handleSubmitVote}
              disabled={
                isVoteSubmitting || isProposalLoading || governors.length === 0
              }
            >
              {isVoteSubmitting && (
                <CircularProgress
                  color="primary"
                  size="30px"
                  sx={{
                    padding: theme.spacing(0.5),
                    marginRight: theme.spacing(0.5),
                  }}
                />
              )}
              {formatMessage({ id: 'submitVote' })}
            </Button>
          ))
        )}
      </Box>
      <Typography
        variant="h5"
        sx={{
          color: theme.common.placeholder,
          marginTop: governors.length === 0 ? theme.spacing(10) : 0,
        }}
      >
        {formatMessage({ id: 'proposalDescription' })}
      </Typography>
      {isProposalLoading ? (
        <Skeleton
          variant="text"
          animation="pulse"
          width="80%"
          height="2.5rem"
          sx={{
            backgroundColor: lighten(theme.palette.grey[900], 0.2),
          }}
        />
      ) : (
        <Typography variant="h2">{proposal?.proposal}</Typography>
      )}
      <Box
        sx={{
          marginTop: theme.spacing(3),
        }}
      >
        {isProposalLoading &&
          [...new Array(5)].map((_, index) => (
            <Box
              key={index}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                alignItems: 'center',
                gap: theme.spacing(5),
                marginBottom: theme.spacing(3),
              }}
            >
              <Typography variant="h2">
                {`${String.fromCharCode(65 + index)}.`}
              </Typography>
              <Box>
                <Skeleton
                  width={`${Math.floor(Math.random() * (100 - 40 + 1)) + 40}%`}
                  sx={{
                    backgroundColor: lighten(theme.palette.grey[900], 0.2),
                  }}
                />
                <Slider
                  defaultValue={Math.floor(Math.random() * (255 - 0 + 1)) + 0}
                  disabled
                  color="primary"
                  size="medium"
                  max={255}
                  min={0}
                />
              </Box>
            </Box>
          ))}
        {!isProposalLoading &&
          proposal?.options.map((option, index) => (
            <Box
              key={index}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                alignItems: 'center',
                gap: theme.spacing(5),
                marginBottom: theme.spacing(3),
              }}
            >
              <Typography variant="h2">
                {`${String.fromCharCode(65 + index)}.`}
              </Typography>
              <Box>
                <Typography variant="h3">{`${option.option_value} ( ${
                  displayResult
                    ? (
                        Number(proposal.result?.choices[index]) /
                        Number(proposal?.number_of_votes)
                      ).toFixed(2)
                    : option.user_vote
                } )`}</Typography>
                <Slider
                  defaultValue={
                    displayResult
                      ? Number(proposal.result?.choices[index]) /
                        Number(proposal?.number_of_votes)
                      : option.user_vote
                  }
                  value={
                    displayResult
                      ? Number(proposal.result?.choices[index]) /
                        Number(proposal?.number_of_votes)
                      : option.user_vote
                  }
                  onChange={(event: Event, newValue: number | number[]) =>
                    handleVoteOption(newValue, option.option_id)
                  }
                  disabled={
                    isProposalLoading ||
                    governors.length === 0 ||
                    !proposal.is_ongoing ||
                    governorHasVoted ||
                    displayResult
                  }
                  color="primary"
                  size="medium"
                  max={255}
                  min={0}
                />
              </Box>
            </Box>
          ))}
      </Box>
    </Box>
  );
}

export default injectIntl(ProposalVote);
