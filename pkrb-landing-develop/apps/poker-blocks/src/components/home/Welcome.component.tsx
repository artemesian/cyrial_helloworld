import {
  Box,
  Button,
  Grid,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { injectIntl, IntlShape } from "react-intl";
import HomeWelcome from "../../assets/images/Home_welcome.png";
import { ReactComponent as PlayIcon } from "../../assets/icons/home_play_get_started.svg";
import anime from "animejs";
import { useEffect, useRef } from "react";

function Welcome({ intl }: { intl: IntlShape }) {
  const { formatMessage } = intl;
  const theme = useTheme();
  const animationRef: React.MutableRefObject<anime.AnimeInstance | null> =
    useRef(null);
  useEffect(() => {
    animationRef.current = anime({
      targets: ".staggering.el",
      translateY: [-20, 0],
      opacity: [0.6, 1],
      delay: anime.stagger(100),
      easing: "easeInSine",
      duration: 500,
    });
  }, []);
  
  return (
    <Box
      sx={{
        backgroundImage: `url(${HomeWelcome})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        height: "calc(100vh + 14px)",
      }}
    >
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        height="100%"
        spacing={3}
      >
        <Grid item>
          <Typography
            className="staggering el"
            textAlign="center"
            sx={{
              ...theme.typography.h6Regular,
              fontFamily: "Lato",
              color: theme.common.offWhite,
              maxWidth: { md: "calc(100vw / 2)" },
            }}
          >
            {formatMessage({ id: "homeWelcomeSubtitle" })}
          </Typography>
        </Grid>
        <Grid item>
          <Typography
            className="staggering el"
            component="h1"
            textAlign="center"
            sx={{
              ...theme.typography.h1Regular,
              fontFamily: "Righteous",
              color: theme.common.offWhite,
              maxWidth: { xs: "calc(100vw / 1.2)", md: "calc(100vw / 2.3)" },
            }}
          >
            {formatMessage({ id: "homeWelcomeTitle" })}
          </Typography>
        </Grid>
        <Grid item>
          <Stack
            className="staggering el"
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2.5}
          >
            {/* TODO: ADD ACTION TO THE BUTTONS "GET STARTED" AND "PLAY"  */}
            <Button
              size="large"
              sx={{
                background:
                  "radial-gradient(104.8% 1526.67% at 100% 50%, #730808 0%, #FF3334 100%)",

                borderRadius: "5px",
                boxShadow: "0px 10px 13px rgba(255, 51, 52, 0.24)",
                color: theme.common.offWhite,
                ...theme.typography.h6Regular,
                fontFamily: "Lato",
                px: 6,
                "&:hover": {
                  color: theme.palette.primary.dark,
                  fontWeight: "bold",
                },
              }}
            >
              {formatMessage({ id: "getStarted" })}
            </Button>
            <IconButton
              size="small"
              sx={{
                background:
                  "radial-gradient(108.82% 122.85% at 50% 50%, #41403D 0%, #000000 100%)",
                width: "55px",
                height: "44px",
                borderRadius: "5px",
                transition:
                  "transform 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms ,width 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                "&:hover": {
                  transform: "translateX(20px)",
                  width: "70px",
                },
                "& svg path": {
                  fill: theme.common.label,
                  transition: "fill 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                },
                "&:hover svg path": {
                  fill: theme.common.yellow,
                },
              }}
            >
              <PlayIcon />
            </IconButton>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default injectIntl(Welcome);
