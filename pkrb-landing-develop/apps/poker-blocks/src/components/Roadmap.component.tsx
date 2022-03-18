import { injectIntl, IntlShape } from "react-intl";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent,
} from "@mui/lab";
import {
  Avatar,
  useTheme,
  Box,
  alpha,
  Container,
  Typography,
} from "@mui/material";
import anime from "animejs";
import { useEffect, useRef } from "react";
import { ReactComponent as RoadmapCircleIcon } from "../assets/icons/RoadmapCircleIcon.svg";
import AOS from "aos";
import "aos/dist/aos.css";
AOS.init();

function Roadmap({ intl }: { intl: IntlShape }): JSX.Element {
  const { formatMessage } = intl;

  const theme = useTheme();

  const timeline = [...new Array(7)].map((_, index) => ({
    number: index + 1,
    title: "T4 2018",
    body: "PokerBlocks Prototype Showcase au Crypto Invest Summit à Los Angeles, CA USA",
  }));

  const animationRef: React.MutableRefObject<anime.AnimeTimelineInstance | null> =
    useRef(null);
  useEffect(() => {
    animationRef.current = anime.timeline({
      easing: "easeOutExpo",
    });
    animationRef.current.add(
      {
        targets: ".flip",
        perspective: 400,
        scaleX: [1, 0.85, 1],
        scaleY: [1, 0.85, 1],
        scaleZ: [1, 0.85, 1],
        rotateY: [0, -10, 0],
        translateZ: [0, 40, 0],
        easing: "cubicBezier(0.4, 0, 0.2, 1)",
        duration: 2000,
      },
      0
    );
  }, []);

  return (
    <Box
      sx={{
        background: theme.gradient.background,
        py: 4,
      }}
    >
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Typography
          data-aos="fade-down"
          data-aos-delay="300"
          component="h1"
          gutterBottom
          sx={{
            ...theme.typography.h1Regular,
            background: theme.gradient.yellowTitle,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {formatMessage({ id: "Roadmap" })}
        </Typography>
        <Typography
          data-aos="fade-down"
          data-aos-delay="500"
          sx={{
            ...theme.typography.h6Medium,
            fontFamily: "Lato",
            color: alpha(String(theme.common.offWhite), 0.6),
          }}
        >
          {formatMessage({ id: "RoadmapParagraph" })}
        </Typography>
      </Container>
      <Container maxWidth="lg" className="flip">
        <Timeline position="alternate">
          {timeline.map(({ number, title, body }, index) => (
            <TimelineItem key={index} sx={{ py: 1 }}>
              <TimelineOppositeContent
                sx={{
                  m: "auto 0",
                  display: "flex",
                  justifyContent: index % 2 === 0 ? "flex-end" : "flex-start",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.common.yellow,
                    color: theme.common.label,
                  }}
                >
                  {number}
                </Avatar>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineConnector
                  sx={{
                    backgroundColor: theme.common.yellow,
                    transform: "scaleY(2.5)",
                  }}
                />
                <RoadmapCircleIcon />
                <TimelineConnector
                  sx={{
                    backgroundColor: theme.common.yellow,
                    transform: "scaleY(2.5)",
                  }}
                />
              </TimelineSeparator>
              <TimelineContent sx={{ py: "12px", px: 2 }}>
                <Typography
                  variant="h5"
                  component="span"
                  sx={{
                    ...theme.typography.h5Bold,
                    fontFamily: "Righteous",
                    color: theme.common.label,
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  sx={{
                    ...theme.typography.body1Regular,
                    fontFamily: "Lato",
                    color: alpha(String(theme.common.label), 0.6),
                  }}
                >
                  {body}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Container>
    </Box>
  );
}

export default injectIntl(Roadmap);
