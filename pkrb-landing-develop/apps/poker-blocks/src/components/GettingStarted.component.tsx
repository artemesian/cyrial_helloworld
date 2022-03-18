import {
  Box,
  Grid,
  Typography,
  useTheme,
  Theme,
  alpha,
  Container,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { injectIntl, IntlShape } from "react-intl";
import anime from "animejs";
import { useEffect, useState, useRef } from "react";
import clsx from "clsx";
import gettingStartedBackground from "../assets/images/gettingStartedBackground.png";
import AOS from "aos";
import "aos/dist/aos.css";
AOS.init();

const useStyles = makeStyles((theme: Theme) => ({
  miniTitle: {
    "&.MuiTypography-root": {
      ...theme.typography.body1Regular,
      fontFamily: "Righteous",
      color: alpha(String(theme.common.offWhite), 0.65),
    },
  },
  sectionTitle: {
    "&.MuiTypography-root": {
      ...theme.typography.h4Regular,
      fontFamily: "Righteous",
      color: theme.common.offWhite,
    },
  },
  paragraph: {
    "&.MuiTypography-root": {
      ...theme.typography.body1Medium,
      fontFamily: "Lato",
      color: alpha(String(theme.common.offWhite), 0.6),
    },
  },
  yellowTitle: {
    "&.MuiTypography-root": {
      ...theme.typography.h1Regular,
      background: theme.gradient.yellowTitle,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  },
  whiteTitle: {
    "&.MuiTypography-root": {
      ...theme.typography.h2Regular,
    },
    color: theme.common.label,
  },
}));

function WhitePaper({ intl }: { intl: IntlShape }): JSX.Element {
  const { formatMessage } = intl;

  const theme = useTheme();

  const classes = useStyles();

  interface IvideoSouce {
    src: string;
    type: string;
  }
  const [videoSource, setVideoSource] = useState<IvideoSouce[]>([]);

  useEffect(() => {
    const newVideoSource = [
      { src: "maVideo.mp4", type: "video/mp4" },
      { src: "maVideo.webm", type: "video/webm" },
    ];
    setVideoSource(newVideoSource);
  }, []);

  const animationRef: React.MutableRefObject<anime.AnimeTimelineInstance | null> =
    useRef(null);
  useEffect(() => {
    animationRef.current = anime.timeline({
      easing: "easeOutExpo",
      duration: 500,
    });
    animationRef.current
      .add(
        {
          targets: ".easeInLeft",
          translateX: ["-100%", 0],
        },
        0
      )
      .add(
        {
          targets: ".easeInRight",
          translateX: ["100%", 0],
          duration: 1000,
        },
        0
      )
      .add(
        {
          targets: ".slideInDown",
          translateY: ["-100%", 0],
          duration: 1000,
        },
        0
      );
  }, []);

  return (
    <Box
      sx={{
        background: theme.gradient.background,
      }}
    >
      <Container maxWidth="md" sx={{ pt: 8 }}>
        <Typography
          sx={{ "&.MuiTypography-root": { fontSize: "1.25rem" } }}
          className={clsx(classes.miniTitle, "slideInDown")}
          gutterBottom
        >
          {formatMessage({ id: "PokerBlocks Wiki" })}
        </Typography>
        <Typography
          className={clsx(classes.yellowTitle, "slideInDown")}
          component="h1"
        >
          {formatMessage({ id: "Getting started" })}
        </Typography>
      </Container>
      <Box
        sx={{
          mt: 6,
          py: 8,
          backgroundImage: `url(${gettingStartedBackground})`,
          backgroundPosition: "center",
          backgroundSize: { xs: "cover", md: "100% 100%" },
        }}
      >
        <Container maxWidth="md">
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="flex-start"
            flexWrap={{ xs: "wrap", sm: "nowrap" }}
            rowSpacing={3}
            columnSpacing={7}
            py={{ xs: 10, md: 6 }}
            px={{ xs: 1, md: 4 }}
          >
            <Grid item sm={2.5} md={3} className="easeInLeft">
              <Typography
                className={classes.sectionTitle}
                component="h4"
                textAlign="right"
                noWrap
              >
                {formatMessage({ id: "Our Mission" })}
              </Typography>
            </Grid>
            <Grid item sm={19.5} md={9} className="easeInRight">
              <Typography className={classes.paragraph}>
                {formatMessage({ id: "ourMissionParagraph" })}
              </Typography>
            </Grid>
          </Grid>
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="flex-start"
            flexWrap={{ xs: "wrap", sm: "nowrap" }}
            rowSpacing={3}
            columnSpacing={7}
            py={{ xs: 10, md: 6 }}
            px={{ xs: 1, md: 4 }}
          >
            <Grid item sm={2.5} md={3} className="easeInLeft">
              <Typography
                className={classes.sectionTitle}
                component="h4"
                textAlign="right"
                noWrap
              >
                {formatMessage({ id: "Our Vision" })}
              </Typography>
            </Grid>
            <Grid item sm={9.5} md={9} className="easeInRight">
              <Typography className={classes.paragraph}>
                {formatMessage({ id: "ourVisionParagraph" })}
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Container
        maxWidth="md"
        sx={{
          pt: 8,
          minHeight: { xs: "65vh", sm: "75vh", md: "100vh", xl: "70vh" },
        }}
      >
        <Grid
          container
          justifyContent="center"
          alignItems="stretch"
          flexDirection="column"
          spacing={8}
        >
          <Grid item data-aos="fade-up">
            <Typography
              component="h2"
              className={classes.whiteTitle}
              gutterBottom
            >
              {formatMessage({ id: "Play to win" })}
            </Typography>
            <Typography className={classes.paragraph}>
              {formatMessage({ id: "playToWinParagraph" })}
            </Typography>
          </Grid>
          <Grid item>
            <video controls width="100%">
              {videoSource.map(({ src, type }, index) => (
                <source src={src} type={type} key={index} />
              ))}
            </video>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default injectIntl(WhitePaper);
