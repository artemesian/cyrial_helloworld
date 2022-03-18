import { injectIntl, IntlShape } from "react-intl";
import { Box, alpha, useTheme } from "@mui/material";
import navLogo from "../../assets/images/dsol_logo.png";
import { NavLink } from "react-router-dom";
import { lighten, styled } from "@mui/system";
import Scrollbars from "react-custom-scrollbars-2";


export function VerticalNav({ intl }: { intl: IntlShape }): JSX.Element {
    const theme = useTheme();
    const { formatMessage } = intl;

    interface NavigationLinkInterface {
        name: string;
        href: string;
    }


    const verticalNavigationLinks: NavigationLinkInterface[] = [
        { name: formatMessage({ id: "validator" }), href: "validator" },
        { name: formatMessage({ id: "proposal" }), href: "proposal" },
        { name: formatMessage({ id: "governor" }), href: "governor" },
        { name: formatMessage({ id: "avatar" }), href: "avatar" },
        { name: formatMessage({ id: "stakepool" }), href: "stakepool" },
        { name: formatMessage({ id: "wallet" }), href: "wallet" }, //TODO: TO LATER MOVE TO THE HORIZONTAL NAV BAR. MAKE A POP-UP ON THE MY_WALLET YOU EITHER CONNECT OR ACCESS YOUR WALLET
    ]

    const HeaderLink = styled(NavLink)(() => ({
        ...theme.typography.body1Regular,
        color: alpha(String(theme.common.label), 0.5),
        transition: "color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
        position: "relative",
        marginInline: "4px",
        textDecoration: "none",
        transform: "rotate(-90deg)",
        height: "fit-content",
        justifySelf: "center",
        "&::after": {
            position: "absolute",
            bottom: "-21px",
            left: "0px",
            right: "0px",
            transform: "scaleX(1.5)",
            content: '""',
            height: "0px",
            backgroundColor: theme.palette.primary.main,
            boxShadow: "0px 0px 30px #FF3334",
            borderRadius: "100px 100px 0px 0px",
        },
        "&:hover": {
            color: lighten(theme.palette.primary.main, 0.3),
        },
        "&:hover::after": {},
        "&.active": {
            color: theme.palette.primary.main,
        },
        "&.active::after": {
            height: "4px",
        },
    }));


    return (
        <Box
            sx={{
                display: "grid",
                backgroundColor: theme.palette.secondary.main,
                gridTemplateRows: "auto 1fr",
                rowGap: "70px",
                width: "fit-content",
                height: "100vh",
                padding: `0 ${theme.spacing(1)}`
            }}
        >
            <NavLink to="stakepool">
                <img
                    src={navLogo}
                    alt={formatMessage({ id: "poker blocks logo" })}
                    style={{ marginTop: theme.spacing(1) }}
                />
            </NavLink>
            <Scrollbars autoHide>
                <Box
                    sx={{
                        display: "grid",
                        width: "fit-content",
                        justifySelf: "center",
                        gridTemplateRows: `repeat(${verticalNavigationLinks.length},150px)`,
                        marginTop: theme.spacing(3)
                    }}
                >
                    {verticalNavigationLinks.map(({ name, href }, index) =>
                        <HeaderLink to={href} key={index}>{name}</HeaderLink>
                    )}
                </Box>
            </Scrollbars>
        </Box>
    )
}

export default injectIntl(VerticalNav)
