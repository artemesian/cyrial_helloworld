import {
  Box,
  Button,
  Grid,
  Typography,
  useTheme,
  Theme,
  alpha,
  Container,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
  StepIconProps,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { styled } from "@mui/material/styles";
import { injectIntl, IntlShape } from "react-intl";
import anime from "animejs";
import { useEffect, useRef } from "react";
import clsx from "clsx";
import { ReactComponent as ReadOurWhitePaperIcon } from "../assets/icons/ant-design_read-outlined.svg";
import { ReactComponent as GamesTreeMultiverseStepIcon } from "../assets/icons/gamesTreeMultiverseStepIcon.svg";

const useStyles = makeStyles((theme: Theme) => ({
  paragraph: {
    "& .MuiStepLabel-label": {
      ...theme.typography.h6Medium,
      fontFamily: "Roboto",
      color: alpha(String(theme.common.offWhite), 0.55),
    },
  },
  introduction: {
    "&.MuiTypography-root": {
      ...theme.typography.h6Regular,
      fontFamily: "Lato",
      color: alpha(String(theme.common.offWhite), 0.65),
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
}));

const ColorlibStepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: "transparent",
  zIndex: 1,
  width: 38,
  height: 38,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
}));

function ColorlibStepIcon(props: StepIconProps): JSX.Element {
  const { active, completed, className } = props;
  return (
    <ColorlibStepIconRoot
      ownerState={{ completed, active }}
      className={className}
    >
      <GamesTreeMultiverseStepIcon />
    </ColorlibStepIconRoot>
  );
}

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`& .${stepConnectorClasses.line}`]: {
    width: 2,
    border: 0,
    backgroundColor: theme.common.yellow,
    boxShadow: `0px 0px 16px ${theme.common.yellow}`,
    marginLeft: 5,
    borderRadius: 1,
    transform: "scaleY(10)",
    transformOrigin: "0 45%",
  },
}));

function WhitePaper({ intl }: { intl: IntlShape }): JSX.Element {
  const { formatMessage } = intl;

  const theme = useTheme();

  const classes = useStyles();

  const steps = [
    formatMessage({ id: "whitePaperPart1" }),
    formatMessage({ id: "whitePaperPart2" }),
  ];

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
          targets: ".backInDown",
          keyframes: [
            { translateY: "-40%", scaleY: 0.9, scaleX: 0.96 },
            { scaleX: 1 },
            { scaleY: 1 },
            { translateY: 0 },
          ],
          easing: "easeInOutCirc",
          duration: 1000,
        },
        500
      )
      .add(
        {
          targets: ".slideInDown",
          translateY: ["-100%", 0],
        },
        0
      )
      .add(
        {
          targets: ".fadeIn",
          keyframes: [{ opacity: 0.8 }, { opacity: 1 }],
          easing: "linear",
        },
        1500
      );
  }, []);

  return (
    <Box
      sx={{
        background: theme.gradient.background,
        py: 5,
      }}
    >
      <Container maxWidth="md">
        <Grid
          container
          justifyContent="center"
          alignItems="flex-start"
          flexDirection="column"
          rowSpacing={{ xs: 10, md: 16, xl: 18 }}
        >
          <Grid item>
            <Typography
              component="h1"
              className={clsx(classes.yellowTitle, "slideInDown")}
              gutterBottom
            >
              {formatMessage({ id: "GamesTree Multiverse" })}
            </Typography>
            <Typography className={clsx(classes.introduction, "slideInDown")}>
              {formatMessage({ id: "whitePaperIntroduction" })}
            </Typography>
          </Grid>
          <Grid item>
            <Stepper
              connector={<ColorlibConnector />}
              orientation="vertical"
              activeStep={-1}
              sx={{
                ".MuiStepConnector-line.MuiStepConnector-lineVertical": {
                  transformOrigin: { xs: "0 50%", sm: "0 45%" },
                  transform: { xs: "scaleY(25)", sm: "scaleY(14)" },
                },
              }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      alignItems: "flex-start",
                    }}
                    StepIconComponent={ColorlibStepIcon}
                    className={clsx(classes.paragraph, "backInDown")}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Grid>
          <Grid item>
            {/* TODO: ADD ACTION TO THE BUTTON "Read our White paper"  */}
            <Button
              className="fadeIn"
              size="large"
              startIcon={<ReadOurWhitePaperIcon />}
              sx={{
                background:
                  "radial-gradient(104.8% 1526.67% at 100% 50%, #730808 0%, #FF3334 100%)",

                borderRadius: "5px",
                boxShadow: "0px 10px 13px rgba(255, 51, 52, 0.24)",
                color: theme.common.offWhite,
                ...theme.typography.body2Bold,
                fontFamily: "Lato",
                px: 6,
                "&:hover": {
                  color: theme.palette.primary.dark,
                  fontWeight: "bolder",
                },
                "& svg path": {
                  fill: theme.common.offWhite,
                  transition: "fill 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                },
                "&:hover svg path": {
                  fill: theme.palette.primary.dark,
                },
              }}
            >
              {formatMessage({ id: "Read our White paper" })}
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default injectIntl(WhitePaper);
