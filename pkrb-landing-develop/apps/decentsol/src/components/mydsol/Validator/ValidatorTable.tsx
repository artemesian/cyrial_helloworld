import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box, Skeleton, useTheme } from '@mui/material';
import { injectIntl, IntlShape } from 'react-intl';
import { ValidatorLine } from './ValidatorLine';

export function ValidatorTable(
    {
        intl: { formatMessage, formatNumber },
        rows
    }: {
        intl: IntlShape,
        rows: ValidatorLine[] | undefined
    }
) {
    const theme = useTheme();
    const headers = [
        formatMessage({ id: "#" }),
        formatMessage({ id: "id" }),
        formatMessage({ id: "location" }),
        formatMessage({ id: "amountDelegated" })
    ]

    return (
        <TableContainer component={Box}>
            <Table sx={{ minWidth: 650 }} >
                <TableHead>
                    <TableRow>
                        {headers.map((header, index) => <TableCell sx={{ color: theme.common.placeholder }} key={index} align={index === 0 ? "left" : "center"}>{header}</TableCell>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows && rows.length === 0 && (
                        <TableRow
                            sx={{ '& td, & th': { borderBottom: 0 } }}
                        >
                            <TableCell
                                sx={{ color: theme.common.placeholder, ...theme.typography.h2 }}
                                component="th"
                                scope="row"
                                colSpan={4}
                                align="center"
                            >
                                {formatMessage({ id: "noValidatorsYet" })}
                            </TableCell>
                        </TableRow>
                    )}
                    {
                        !rows && [...new Array(5)].map((_, index) => (
                            <TableRow
                                key={index}
                                sx={{ '& td, & th': { borderBottom: `0.5px solid ${theme.common.line}` } }}
                            >
                                {
                                    [...new Array(4)].map((_, index) => (
                                        <TableCell
                                            sx={{ color: theme.common.placeholder }}
                                            align="center"
                                        >
                                            <Skeleton key={index} animation="wave" height="20px" />
                                        </TableCell>
                                    ))}

                            </TableRow>

                        ))
                    }
                    {rows && rows.map((row, index) => (
                        <TableRow
                            key={index}
                            sx={{ '& td, & th': { borderBottom: `0.5px solid ${theme.common.line}` } }}
                        >
                            <TableCell sx={{ color: theme.common.placeholder }} component="th" scope="row">
                                {index + 1}
                            </TableCell>
                            <TableCell
                                sx={{ color: theme.common.placeholder }}
                                align="center">{row.id}
                            </TableCell>
                            <TableCell
                                sx={{ color: theme.common.placeholder }}
                                align="center">{row.location}
                            </TableCell>
                            <TableCell
                                sx={{ color: theme.common.placeholder }}
                                align="center">{`${formatNumber(row.amount_delegated)} SOL`}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
export default injectIntl(ValidatorTable)