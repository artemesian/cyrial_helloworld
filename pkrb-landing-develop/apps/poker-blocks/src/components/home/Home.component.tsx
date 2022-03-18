import {
  Box,
  Button,
  Container,
  Grid,
  Stack,
  Theme,
  Typography,
  useTheme,
  alpha,
  CssBaseline,
  useMediaQuery,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { injectIntl, IntlShape } from "react-intl";
import nftAvatarImage from "../../assets/images/nft_avatar.png";
import nftPokerTablesImage from "../../assets/images/nft_poker_tables.png";
import homePokerGamesImage from "../../assets/images/homePokerGames.png";
import pokerblocksUniverseVideoBackground from "../../assets/images/pokerblocksUniverseVideoBackground.png";
import pkrb_logo_concept from "../../assets/images/pkrb_logo_concept.png";
import WelcomeComponent from "./Welcome.component";
import SponsorsComponent from "./Sponsors.component";
import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect, useState } from "react";
import Carousel from "./Carousel.component";
AOS.init();

const useStyles = makeStyles((theme: Theme) => ({
  paragraph: {
    "&.MuiTypography-root": {
      ...theme.typography.h6Regular,
      fontFamily: "Lato",
      color: alpha(String(theme.common.offWhite), 0.75),
    },
  },
  yellowOrangeTitle: {
    "&.MuiTypography-root": {
      ...theme.typography.h1Regular,
      background: theme.gradient.yellowOrangeTitle,
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

function Home({ intl }: { intl: IntlShape }): JSX.Element {
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

  return (
    <Box sx={{ background: theme.gradient.background, overflow: "hidden" }}>
      <CssBaseline />
      <WelcomeComponent />
      <SponsorsComponent />
      <Container
        maxWidth="lg"
        sx={{
          "& img": {
            maxWidth: { xs: "100%", md: "initial" },
            maxHeight: "100%",
          },
        }}
      >
        <Box sx={{ minHeight: "100vh" }}>
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="stretch"
            height="100%"
            rowSpacing={13}
            p={{ xs: 1, sm: 4, md: 4 }}
          >
            <Grid item>
              <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={8}
                flexWrap={{ xs: "wrap", md: "nowrap" }}
              >
                <Grid item data-aos="zoom-in" data-aos-delay="300">
                  <img alt={"avatar"} src={nftAvatarImage} />
                </Grid>
                <Grid item>
                  <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    spacing={3}
                    data-aos="fade-left"
                    data-aos-delay="300"
                  >
                    <Typography
                      component="h2"
                      className={classes.yellowOrangeTitle}
                      sx={{
                        fontSize: "2.25rem",
                      }}
                    >
                      {formatMessage({ id: "nftAvatars" })}
                    </Typography>
                    <Typography
                      className={classes.paragraph}
                      textAlign="justify"
                    >
                      {formatMessage({ id: "nftAvatarsParagraph" })}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid
                container
                direction="row"
                justifyContent="center"
                alignItems="center"
                flexWrap={{ xs: "wrap-reverse", md: "nowrap" }}
                spacing={8}
              >
                <Grid item>
                  <Stack
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    spacing={3}
                    data-aos="fade-left"
                    data-aos-delay="300"
                  >
                    <Typography
                      component="h2"
                      className={classes.yellowOrangeTitle}
                      sx={{
                        fontSize: "2.25rem",
                      }}
                    >
                      {formatMessage({ id: "nftPokerTables" })}
                    </Typography>
                    <Typography
                      className={classes.paragraph}
                      textAlign="justify"
                    >
                      {formatMessage({ id: "nftPokerParagraph" })}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item data-aos="zoom-in" data-aos-delay="300">
                  <img alt={"poker_tables"} src={nftPokerTablesImage} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        <Grid
          container
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          mt={12}
        >
          <img
            src={homePokerGamesImage}
            data-aos="fade-up-right"
            alt="homePokerGames"
            style={{
              maxWidth: "100%",
              transform: "translateX(-24px)",
            }}
          />
        </Grid>
        <Container
          maxWidth="md"
          disableGutters
          sx={{
            minHeight: "100vh",
            pt: 5,
            pb: { xs: 16, md: 28 },
          }}
        >
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
            height="100%"
            rowSpacing={10}
            pb={10}
          >
            <Grid item>
              <Typography
                className={classes.paragraph}
                textAlign="center"
                data-aos="fade-right"
              >
                {formatMessage({ id: "pokerBlockIntroduction" })}
              </Typography>
            </Grid>
            <Grid item data-aos="flip-up">
              <Carousel />
            </Grid>
            <Grid item data-aos="fade-right">
              <Typography
                className={classes.whiteTitle}
                textAlign="center"
                component="h3"
                gutterBottom
              >
                {formatMessage({ id: "texasHoldemOnlinePoker" })}
              </Typography>
              <Typography className={classes.paragraph} textAlign="center">
                {formatMessage({ id: "texasHoldemOnlinePokerParagraph" })}
              </Typography>
            </Grid>
          </Grid>
          <Typography
            component="h2"
            data-aos="zoom-in-up"
            data-aos-duration="500"
            className={classes.yellowOrangeTitle}
            sx={{
              fontSize: "2.25rem",
              mb: { xs: 8, md: 1 },
            }}
          >
            {formatMessage({ id: "pokerBlocksUniverseTitle" })}
          </Typography>
          <Box
            sx={{
              background: `url(${pokerblocksUniverseVideoBackground})`,
              backgroundPosition: "center",
              backgroundSize: "100% 100%",
              padding: useMediaQuery(theme.breakpoints.down("md"))
                ? "0px"
                : "38px 38px 38px 122px",
            }}
            data-aos="fade-zoom-in"
            data-aos-easing="ease-in-back"
            data-aos-offset="0"
          >
            <video
              controls
              width="100%"
              style={{
                border: "2px solid #F3B644",
                boxSizing: "border-box",
                filter: "drop-shadow(0px 0px 16px #F3B644)",
              }}
            >
              {videoSource.map(({ src, type }, index) => (
                <source src={src} type={type} key={index} />
              ))}
            </video>
          </Box>
        </Container>
      </Container>
      <Box
        sx={{
          background:
            "radial-gradient(105.84% 105.84% at 57.73% 46.1%, #262627 0%, #000000 100%)",
          pb: { xs: 4, md: 0 },
        }}
      >
        <Container maxWidth="md" disableGutters>
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap={{ xs: "wrap", md: "nowrap" }}
            pb={6}
            px={{ xs: 2, md: 0 }}
            sx={{
              position: "relative",
            }}
          >
            <Grid item xs={12} sm={12} md={6}>
              <Box
                sx={{
                  position: { xs: "initial", md: "absolute" },
                  bottom: "0px",
                  "& img": {
                    maxWidth: "100%",
                    height: "600px",
                    objectFit: { xs: "scale-down", md: "unset" },
                  },
                }}
                data-aos="fade-zoom-in"
                data-aos-easing="ease-in-back"
                data-aos-offset="0"
              >
                <img src={pkrb_logo_concept} alt="pkrb_logo_concept" />
              </Box>
            </Grid>
            <Grid item xs={12} sm={12} md={6}>
              <Grid
                container
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={4}
                p={{ xs: "none", md: 2 }}
                pl={{ xs: "none", md: 8 }}
              >
                <Grid item data-aos="fade-down-left" data-aos-offset="0">
                  <Typography
                    className={classes.whiteTitle}
                    textAlign="left"
                    component="h2"
                    sx={{
                      pl: 4,
                      "&.MuiTypography-root": {
                        fontSize: "2.25rem",
                      },
                    }}
                    gutterBottom
                  >
                    {formatMessage({ id: "pokerBlocks" })}
                  </Typography>
                  <Typography
                    className={classes.whiteTitle}
                    textAlign="left"
                    component="li"
                    sx={{
                      pl: 4,
                      "&.MuiTypography-root": {
                        fontSize: "2.25rem",
                      },
                    }}
                    gutterBottom
                  >
                    {formatMessage({ id: "concept" })}
                  </Typography>
                  <Typography className={classes.paragraph} textAlign="left">
                    {formatMessage({ id: "pokerBlocksConcept" })}
                  </Typography>
                </Grid>
                <Grid item>
                  {/* TODO: ADD ACTION TO THE BUTTON "LEARN MORE"  */}
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
                      paddingInline: theme.spacing(6),
                      "&:hover": {
                        color: theme.palette.primary.dark,
                        fontWeight: "bold",
                      },
                    }}
                  >
                    {formatMessage({ id: "learnMore" })}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default injectIntl(Home);
