import { injectIntl, IntlShape } from "react-intl";
import { Box, alpha, useTheme } from "@mui/material";
import navLogo from "../../assets/images/pkrb_nav_logo.png";
import { NavLink } from "react-router-dom";
import { lighten, styled } from "@mui/system";


export function VerticalNav({ intl }: { intl: IntlShape }): JSX.Element {
    const theme = useTheme();
    const { formatMessage } = intl;

    interface NavigationLinkInterface {
        name: string;
        href: string;
    }


    const verticalNavigationLinks: NavigationLinkInterface[] = [
        { name: formatMessage({ id: "home" }), href: "home" },
        { name: formatMessage({ id: "market" }), href: "market" },
        { name: formatMessage({ id: "inventory" }), href: "inventory" },
        { name: formatMessage({ id: "lobby" }), href: "lobby" },
    ]

    const HeaderLink = styled(NavLink)(() => ({
        ...theme.typography.body1Regular,
        color: alpha(String(theme.common.label), 0.5),
        fontFamily: "Righteous",
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
            backgroundColor: "#FF3334",
            boxShadow: "0px 0px 30px #FF3334",
            borderRadius: "100px 100px 0px 0px",
        },
        "&:hover": {
            color: lighten("#FF3334", 0.3),
        },
        "&:hover::after": {},
        "&.active": {
            color: "#FF3334",
        },
        "&.active::after": {
            height: "4px",
        },
    }));


    return (
        <Box sx={{ display: "grid", backgroundColor: "#1C1C1C", gridTemplateRows: "auto 1fr", rowGap: "70px", width: "fit-content", height: "100vh" }}>
            <NavLink to="home">
                <img
                    src={navLogo}
                    alt={formatMessage({ id: "poker blocks logo" })}
                />
            </NavLink>
            <Box sx={{ display: "grid", width: "fit-content", justifySelf: "center", gridTemplateRows: `repeat(${verticalNavigationLinks.length},150px)`, }}>
                {verticalNavigationLinks.map(({ name, href }, index) =>
                    <HeaderLink to={href}>{name}</HeaderLink>
                )}
            </Box>
        </Box>
    )
}

export default injectIntl(VerticalNav)
