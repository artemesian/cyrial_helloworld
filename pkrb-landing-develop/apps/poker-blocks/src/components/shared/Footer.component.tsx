import { useTheme, Theme } from "@mui/material/styles";
import {
  alpha,
  Box,
  Divider,
  Grid,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { NavLink } from "react-router-dom";
import logo from "../../assets/images/pkrb_logo.png";
import { injectIntl, IntlShape } from "react-intl";
import { ReactComponent as Terms } from "../../assets/icons/Terms and conditions.svg";
import { ReactComponent as Telegram } from "../../assets/icons/Telegram.svg";
import { ReactComponent as Twitter } from "../../assets/icons/Twitter.svg";
import { ReactComponent as Discord } from "../../assets/icons/Discord.svg";
import { ReactComponent as Facebook } from "../../assets/icons/Facebook.svg";
import { styled } from "@mui/system";
import { useEffect, useState } from "react";

const useStyles = makeStyles((theme: Theme) => ({
  terms: {
    "& svg path": {
      stroke: theme.common.label,
      transition: "color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
    },
    "&:hover svg path": {
      stroke: theme.common.offWhite,
    },
  },
}));

function Footer({ intl }: { intl: IntlShape }): JSX.Element {
  const { formatMessage } = intl;

  const theme = useTheme();

  const classes = useStyles();

  const [footerData, setFooterData] = useState("");

  useEffect(() => {
    const newFooterData = `Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro
          necessitatibus expedita libero dolores nobis, quas qui molestiae
          veritatis iste esse magnam veniam in nostrum incidunt ab. Ut fugiat
          quis officiis! Lorem ipsum dolor sit amet consectetur adipisicing
          elit. Id, architecto voluptate sequi repellat a animi ducimus facere
          eius, placeat odit dolores sapiente explicabo natus illo officia,
          accusantium fuga laudantium! Adipisci. Lorem ipsum dolor sit, amet
          consectetur adipisicing elit. Omnis ipsam reprehenderit fuga commodi
          fugiat sint voluptatem et, qui nulla ea impedit perferendis ex alias
          consectetur. Repellendus autem non animi repudiandae.`;
    setFooterData(newFooterData);
  }, []);

  const FooterLink = styled(NavLink)(() => ({
    ...theme.typography.body1Regular,
    color: alpha(String(theme.common.label), 0.68),
    fontFamily: "Lato",
    textDecoration: "none",
    "&:hover": {
      color: theme.common.offWhite,
    },
  }));

  interface IsocialMedia {
    Icon: React.FC;
    href: string;
  }
  // TODO: ADD LINK TO THESE SOCIAL MEDIA */
  const socialMedia: IsocialMedia[] = [
    { Icon: Facebook, href: "#" },
    { Icon: Discord, href: "#" },
    { Icon: Twitter, href: "#" },
    { Icon: Telegram, href: "#" },
  ];

  interface IfooterLink {
    link: string;
    href: string;
  }
  const footerLinks: IfooterLink[] = [
    { link: formatMessage({ id: "Home" }), href: "/home" },
    { link: formatMessage({ id: "Games" }), href: "/games" },
    {
      link: formatMessage({ id: "Wiki-Get started" }),
      href: "/wiki-get-started",
    },
    { link: formatMessage({ id: "White-paper" }), href: "/white-paper" },
    { link: formatMessage({ id: "Roadmap" }), href: "/roadmap" },
    { link: formatMessage({ id: "Our Team" }), href: "/our-team" },
  ];

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.secondary.main,
        padding: 6,
        [theme.breakpoints.down("md")]: {
          padding: 2,
        },
      }}
    >
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={{ xs: 4, sm: 3, md: 2 }}
      >
        <Grid item xs={4} sm={2} md={1} lg="auto">
          <FooterLink to="/">
            <img
              alt={formatMessage({ id: "poker blocks logo" })}
              src={logo}
              width={78}
              height={78}
              style={{ objectFit: "scale-down" }}
            />
          </FooterLink>
        </Grid>
        <Grid item xs={8} sm={10} md={6} lg="auto">
          <Grid
            container
            direction="row"
            justifyContent="space-evenly"
            alignItems="center"
            spacing={4}
          >
            {footerLinks.map(({ link, href }, index) => (
              <Grid item key={index} xs={10} sm={5} md={2} lg="auto">
                <FooterLink to={href}>{link}</FooterLink>
              </Grid>
            ))}
          </Grid>
        </Grid>
        <Grid item xs={12} sm={12} md={1} lg="auto">
          <Stack
            direction="row"
            justifyContent={{ xs: "flex-start", md: "center" }}
            alignItems="center"
            spacing={2}
          >
            {socialMedia.map(({ Icon, href }, index) => (
              <Link
                href={href}
                key={index}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  "& svg path": {
                    fill: theme.common.label,
                    transition: "color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                  },
                  "&:hover svg path": {
                    fill: theme.common.offWhite,
                  },
                }}
              >
                <Icon />
              </Link>
            ))}
          </Stack>
        </Grid>
        <Grid item xs={12} sm={12} md={3} lg="auto">
          <FooterLink to="#" className={classes.terms}>
            <Stack
              direction="row"
              justifyContent={{ xs: "flex-start", md: "center" }}
              alignItems="center"
              spacing={1}
            >
              <Terms />
              &nbsp;
              {formatMessage({ id: "Terms and conditions" })}
            </Stack>
          </FooterLink>
        </Grid>
      </Grid>
      <Divider sx={{ my: 4, color: alpha(String(theme.common.line), 0.24) }} />
      <Box>
        <Typography
          paragraph
          align="center"
          sx={{
            color: alpha(String(theme.common.label), 0.68),
            variant: "body2Bold",
            fontFamily: "Lato",
          }}
        >
          {footerData}
        </Typography>
      </Box>
    </Box>
  );
}

export default injectIntl(Footer);
