import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box, Skeleton, useTheme } from '@mui/material';
import { FormattedRelativeTime, injectIntl, IntlShape } from 'react-intl';
import { Proposal } from '../../../pages/ProposalPage';
import moment from 'moment';
import { useNavigate } from 'react-router';

export function ProposalTable({
  intl: { formatMessage, formatNumber },
  rows,
  isProposalsLoading,
}: {
  intl: IntlShape;
  rows: Proposal[] | undefined;
  isProposalsLoading: boolean;
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const headers = [
    formatMessage({ id: '#' }),
    formatMessage({ id: 'id' }),
    formatMessage({ id: 'proposal' }),
    formatMessage({ id: 'votes' }),
    formatMessage({ id: 'duration' }),
    formatMessage({ id: 'status' }),
  ];

  return (
    <TableContainer component={Box}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            {headers.map((header, index) => (
              <TableCell
                sx={{ color: theme.common.placeholder }}
                key={index}
                align={index === 0 ? 'left' : 'center'}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows && !isProposalsLoading && rows.length === 0 && (
            <TableRow sx={{ '& td, & th': { borderBottom: 0 } }}>
              <TableCell
                sx={{ color: theme.common.placeholder, ...theme.typography.h4 }}
                component="th"
                scope="row"
                colSpan={4}
                align="center"
              >
                {formatMessage({ id: 'noProposalsYet' })}
              </TableCell>
            </TableRow>
          )}
          {isProposalsLoading &&
            [...new Array(5)].map((_, index) => (
              <TableRow
                key={index}
                sx={{
                  '& td, & th': {
                    borderBottom: `0.5px solid ${theme.common.line}`,
                  },
                }}
              >
                {[...new Array(6)].map((_, index) => (
                  <TableCell
                    sx={{ color: theme.common.placeholder }}
                    align="center"
                  >
                    <Skeleton key={index} animation="wave" height="20px" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {!isProposalsLoading &&
            rows &&
            rows.map((row, index) => (
              <TableRow
                key={index}
                onClick={() => navigate(`${row.proposal_id}`)}
                sx={{
                  backgroundColor: 'initial',
                  transition: 'ease-in 0.3s',
                  cursor: 'pointer',
                  '& td, & th': {
                    borderBottom: `0.5px solid ${theme.common.line}`,
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(196, 196, 196, 0.05)',
                    transition: 'ease-out 0.3s',
                  },
                }}
              >
                <TableCell
                  sx={{ color: theme.common.placeholder }}
                  component="th"
                  scope="row"
                >
                  {index + 1}
                </TableCell>
                <TableCell
                  sx={{ color: theme.common.placeholder }}
                  align="center"
                >
                  {row.proposal_id}
                </TableCell>
                <TableCell
                  sx={{ color: theme.common.placeholder }}
                  align="center"
                >
                  {row.proposal}
                </TableCell>
                <TableCell
                  sx={{ color: theme.common.placeholder }}
                  align="center"
                >
                  {formatNumber(row.number_of_votes)}
                </TableCell>
                <TableCell
                  sx={{ color: theme.common.placeholder }}
                  align="center"
                >
                  <FormattedRelativeTime
                    value={Number(
                      moment(new Date(row.ending_date))
                        .diff(new Date(), 'seconds')
                        .toString()
                    )}
                    numeric="auto"
                    updateIntervalInSeconds={1}
                  />
                </TableCell>
                <TableCell
                  sx={{
                    color: row.is_ongoing
                      ? theme.palette.primary.main
                      : theme.palette.error.main,
                  }}
                  align="center"
                >
                  {formatMessage({ id: row.is_ongoing ? 'ongoing' : 'closed' })}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
export default injectIntl(ProposalTable);
