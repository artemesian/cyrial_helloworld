import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Avatar, Box, Skeleton, useTheme } from '@mui/material';
import { injectIntl, IntlShape } from 'react-intl';
import { AssetLine } from '../../../pages/WalletPage';

export function WalletTable(
    {
        intl: { formatMessage, formatNumber },
        rows,
        usage
    }: {
        intl: IntlShape,
        rows: AssetLine[] | undefined,
        usage: string
    }
) {
    const theme = useTheme();
    const headers = [
        formatMessage({ id: "#" }),
        formatMessage({ id: usage }),
        formatMessage({ id: "id" }),
        formatMessage({ id: "unclaimedReward" })
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
                                sx={{ color: theme.common.placeholder, ...theme.typography.h4 }}
                                component="th"
                                scope="row"
                                colSpan={4}
                                align="center"
                            >
                                {formatMessage({ id: "youOwnNoneOfTheseAssets" })}
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
                                align="center"
                            >
                                <Avatar
                                    src={row.image_ref}
                                    alt="table avatar"
                                    sx={{
                                        width: "initial",
                                        "& img":{
                                            width: "40px",
                                            borderRadius: "100%"
                                        }
                                    }}
                                />
                            </TableCell>
                            <TableCell
                                sx={{ color: theme.common.placeholder }}
                                align="center">{row.asset_id}
                            </TableCell>
                            <TableCell
                                sx={{ color: theme.palette.primary.main }}
                                align="center">{`${formatNumber(row.unclaimed_rewards)} SOL`}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
export default injectIntl(WalletTable)