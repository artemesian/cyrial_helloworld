import {
  Box,
  Grid,
  Typography,
  useTheme,
  Theme,
  alpha,
  Container,
  Stack,
  IconButton,
  Avatar,
  useMediaQuery,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { injectIntl, IntlShape } from "react-intl";
import { useEffect, useState, useRef } from "react";
import { Scrollbars } from "react-custom-scrollbars-2";
import { NavLink } from "react-router-dom";
import anime from "animejs";
import clsx from "clsx";
import teamPresentationBackground from "../assets/images/teamPresentationBackground.png";
import logo from "../assets/images/pkrb_logo.png";
import teamMemberImage from "../assets/images/unsplash_UxujkVMyY_0.png";
import { ReactComponent as TwitterIcon } from "../assets/icons/Twitter.svg";
import { ReactComponent as DiscordIcon } from "../assets/icons/Discord.svg";
import { ReactComponent as GithubIcon } from "../assets/icons/Github-alt.svg";
import { ReactComponent as TelegramPlaneIcon } from "../assets/icons/Telegram-plane.svg";

const useStyles = makeStyles((theme: Theme) => ({
  miniTitle: {
    "&.MuiTypography-root": {
      ...theme.typography.h6Regular,
      fontFamily: "Righteous",
      color: alpha(String(theme.common.offWhite), 0.65),
    },
  },
  sectionTitle: {
    "&.MuiTypography-root": {
      ...theme.typography.h2Regular,
      fontFamily: "Righteous",
      color: theme.common.label,
    },
  },
  paragraph: {
    "&.MuiTypography-root": {
      ...theme.typography.h6Regular,
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
      ...theme.typography.h3Regular,
    },
    color: theme.common.label,
  },
  upcomingTitle: {
    "&.MuiTypography-root": {
      ...theme.typography.h6Regular,
      fontFamily: "Lato",
    },
    color: alpha(String(theme.common.offWhite), 0.65),
  },
}));

function OurTeam({ intl }: { intl: IntlShape }): JSX.Element {
  const { formatMessage } = intl;

  const theme = useTheme();

  const classes = useStyles();

  interface IteamData {
    profile_image_link: string;
    member_id: string;
    member_firstname: string;
    member_lastname: string;
    member_role: string;
    member_quote: string;
    social_media_links: {
      discord?: string;
      telegram?: string;
      github?: string;
      twitter?: string;
    };
  }

  const [activeMember, setActiveMember] = useState<IteamData>({
    profile_image_link: "",
    member_id: "",
    member_firstname: "",
    member_lastname: "",
    member_role: "",
    member_quote: ``,
    social_media_links: {},
  });
  const [previousMember, setPreviousMember] = useState<IteamData>({
    profile_image_link: "",
    member_id: "",
    member_firstname: "",
    member_lastname: "",
    member_role: "",
    member_quote: ``,
    social_media_links: {},
  });
  const [nextMember, setNextMember] = useState<IteamData>({
    profile_image_link: "",
    member_id: "",
    member_firstname: "",
    member_lastname: "",
    member_role: "",
    member_quote: ``,
    social_media_links: {},
  });
  const [memberData, setMemberData] = useState<IteamData[]>([]);

  useEffect(() => {
    const newMemberData: IteamData[] = [
      {
        profile_image_link: logo,
        member_id: "1",
        member_firstname: "Christopher",
        member_lastname: "",
        member_role: "President founding partner 1",
        member_quote: `<<  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Eu, ornare libero proin vel ut egestas gravida. Diam consequat lorem lorem porttitor ornare amet metus. Sit eu, malesuada donec hac etiam nam aliquet.  >>`,
        social_media_links: {
          discord: "#",
          telegram: "#",
          github: "#",
          twitter: "#",
        },
      },
      {
        profile_image_link: teamMemberImage,
        member_id: "2",
        member_firstname: "Christ",
        member_lastname: "",
        member_role: "President founding partner 2",
        member_quote: `<<  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Eu, ornare libero proin vel ut egestas gravida. Diam consequat lorem lorem porttitor ornare amet metus. Sit eu, malesuada donec hac etiam nam aliquet.  >>`,
        social_media_links: {
          discord: "#",
          telegram: "#",
          github: "#",
          twitter: "#",
        },
      },
      {
        profile_image_link: logo,
        member_id: "3",
        member_firstname: "Ivan",
        member_lastname: "",
        member_role: "President founding partner 3",
        member_quote: `<<  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Eu, ornare libero proin vel ut egestas gravida. Diam consequat lorem lorem porttitor ornare amet metus. Sit eu, malesuada donec hac etiam nam aliquet.  >>`,
        social_media_links: {
          discord: "#",
          telegram: "#",
          github: "#",
        },
      },
      {
        profile_image_link: teamMemberImage,
        member_id: "4",
        member_firstname: "Yoan",
        member_lastname: "",
        member_role: "President founding partner 4",
        member_quote: `<<  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Eu, ornare libero proin vel ut egestas gravida. Diam consequat lorem lorem porttitor ornare amet metus. Sit eu, malesuada donec hac etiam nam aliquet.  >>`,
        social_media_links: {
          discord: "#",
          github: "#",
          twitter: "#",
        },
      },
      {
        profile_image_link: logo,
        member_id: "5",
        member_firstname: "Yoanna",
        member_lastname: "",
        member_role: "President founding partner 5",
        member_quote: `<<  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Eu, ornare libero proin vel ut egestas gravida. Diam consequat lorem lorem porttitor ornare amet metus. Sit eu, malesuada donec hac etiam nam aliquet.  >>`,
        social_media_links: {
          discord: "#",
          github: "#",
          twitter: "#",
        },
      },
      {
        profile_image_link: teamMemberImage,
        member_id: "6",
        member_firstname: "Yoanne",
        member_lastname: "",
        member_role: "President founding partner 6",
        member_quote: `<<  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Eu, ornare libero proin vel ut egestas gravida. Diam consequat lorem lorem porttitor ornare amet metus. Sit eu, malesuada donec hac etiam nam aliquet.  >>`,
        social_media_links: {
          discord: "#",
          github: "#",
          twitter: "#",
        },
      },
    ];

    setMemberData(newMemberData);
  }, []);

  useEffect(() => {
    let newActiveMember: IteamData = {
      profile_image_link: "",
      member_id: "",
      member_firstname: "",
      member_lastname: "",
      member_role: "",
      member_quote: ``,
      social_media_links: {},
    };
    if (memberData.length > 0) {
      if (memberData.length === 1) {
        newActiveMember = memberData[0];
      } else {
        newActiveMember = memberData[1];
      }
    }
    setActiveMember(newActiveMember);
  }, [memberData]);

  useEffect(() => {
    let newPreviousMember: IteamData = {
      profile_image_link: "",
      member_id: "",
      member_firstname: "",
      member_lastname: "",
      member_role: "",
      member_quote: ``,
      social_media_links: {},
    };

    if (memberData.length >= 2) {
      newPreviousMember = memberData[0];
      setPreviousMember(newPreviousMember);
    }
  }, [memberData]);

  useEffect(() => {
    let newNextMember: IteamData = {
      profile_image_link: "",
      member_id: "",
      member_firstname: "",
      member_lastname: "",
      member_role: "",
      member_quote: ``,
      social_media_links: {},
    };

    if (memberData.length >= 2) {
      newNextMember = memberData[2];
      setNextMember(newNextMember);
    }
  }, [memberData]);

  const handleChangeActiveMember = (member: IteamData) => {
    let newPreviousMember = {
      profile_image_link: "",
      member_id: "",
      member_firstname: "",
      member_lastname: "",
      member_role: "",
      member_quote: ``,
      social_media_links: {},
    };
    let newNextMember = {
      profile_image_link: "",
      member_id: "",
      member_firstname: "",
      member_lastname: "",
      member_role: "",
      member_quote: ``,
      social_media_links: {},
    };
    const indexOfActiveMember = memberData.indexOf(member);
    if (indexOfActiveMember >= 0) {
      if (indexOfActiveMember >= 1) {
        newPreviousMember = memberData[indexOfActiveMember - 1];
      }
      if (indexOfActiveMember < memberData.length - 1) {
        newNextMember = memberData[indexOfActiveMember + 1];
      }
    }
    setActiveMember(member);
    setPreviousMember(newPreviousMember);
    setNextMember(newNextMember);
    if (fadeInAnimationRef.current) fadeInAnimationRef.current.restart();
    if (activeMemberInfoAnimationRef.current)
      activeMemberInfoAnimationRef.current.restart();
    if (activeMemberImageAnimationRef.current)
      activeMemberImageAnimationRef.current.restart();
  };

  const animationRef: React.MutableRefObject<anime.AnimeTimelineInstance | null> =
    useRef(null);
  const activeMemberInfoAnimationRef: React.MutableRefObject<anime.AnimeInstance | null> =
    useRef(null);
  const activeMemberImageAnimationRef: React.MutableRefObject<anime.AnimeInstance | null> =
    useRef(null);
  const fadeInAnimationRef: React.MutableRefObject<anime.AnimeInstance | null> =
    useRef(null);

  useEffect(() => {
    animationRef.current = anime.timeline({
      easing: "easeOutExpo",
      duration: 750,
    });
    animationRef.current
      .add(
        {
          targets: ".ourTeamBox",
          keyframes: [
            { scaleY: 0, opacity: 0 },
            { scaleY: 0.5, opacity: 0.5 },
            { scaleY: 0.9, opacity: 0.9 },
            { scaleY: 1, opacity: 1 },
          ],
        },
        0
      )
      .add(
        {
          targets: ".slideInDown",
          translateY: ["-100%", 0],
        },
        0
      );

    fadeInAnimationRef.current = anime({
      targets: ".fadeIn",
      scaleY: [0, 0.7, 1],
      opacity: [0, 0.7, 1],
      duration: 600,
      easing: "cubicBezier(.5, .05, .1, .3)",
    });

    activeMemberInfoAnimationRef.current = anime({
      targets: ".activeMemberInfo",
      translateX: ["-100%", 0],
      easing: "spring(5, 80, 50, 1)",
    });
    activeMemberImageAnimationRef.current = anime({
      targets: ".activeMemberImage",
      translateY: ["-60%", 0],
      scale: [0, 1],
      easing: "spring(10, 70, 60, 2)",
    });
  }, []);

  return (
    <Box
      sx={{
        background: theme.gradient.background,
        minHeight: "100vh"
      }}
    >
      <Container maxWidth="md" sx={{ pt: 3 }}>
        <Typography
          className={clsx(classes.yellowTitle, "slideInDown")}
          component="h1"
        >
          {formatMessage({ id: "Meet our Team" })}
        </Typography>
        <Typography className={clsx(classes.paragraph, "slideInDown")}>
          {formatMessage({ id: "ourTeamSummary" })}
        </Typography>
      </Container>
      <Container
        maxWidth="xl"
        sx={{
          mt: 1,
          pt: 5,
          pb: 8,
          backgroundImage: `url(${teamPresentationBackground})`,
          backgroundPosition: "center",
          backgroundSize: { xs: "200% 97%", md: "95% 90%", lg: "75% 90%" },
          backgroundRepeat: "no-repeat",
        }}
      >
        <Container
          maxWidth="md"
          sx={{
            position: "relative",
          }}
        >
          <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            py={{ xs: 10, md: 4 }}
          >
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="flex-start"
              rowSpacing={3}
              columnSpacing={7}
              flexWrap={{ xs: "wrap", md: "nowrap" }}
            >
              <Grid item className="activeMemberImage">
                <img
                  src={activeMember.profile_image_link}
                  alt="team member"
                  height={350}
                  width={450}
                  style={{
                    objectFit: "contain",
                    maxWidth: "100vw",
                  }}
                />
              </Grid>
              <Grid item className="activeMemberInfo">
                <Typography
                  className={classes.sectionTitle}
                  component="h3"
                  textAlign="left"
                  noWrap
                >
                  {`${activeMember.member_firstname} ${activeMember.member_lastname}`}
                </Typography>
                <Typography className={classes.paragraph} sx={{ mb: 2 }}>
                  {activeMember.member_role}
                </Typography>
                <Typography className={classes.paragraph}>
                  {activeMember.member_quote}
                </Typography>
                <Stack
                  direction="row"
                  justifyContent="flex-start"
                  alignItems="center"
                  spacing={3}
                  mt={5}
                >
                  {activeMember.social_media_links.discord && (
                    <NavLink to={activeMember.social_media_links.discord}>
                      <DiscordIcon />
                    </NavLink>
                  )}
                  {activeMember.social_media_links.telegram && (
                    <NavLink to={activeMember.social_media_links.telegram}>
                      <TelegramPlaneIcon />
                    </NavLink>
                  )}
                  {activeMember.social_media_links.github && (
                    <NavLink to={activeMember.social_media_links.github}>
                      <GithubIcon />
                    </NavLink>
                  )}
                  {activeMember.social_media_links.telegram && (
                    <NavLink to={activeMember.social_media_links.telegram}>
                      <TwitterIcon />
                    </NavLink>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Grid>
          <Box
            sx={{
              position: "absolute",
              left: 0,
              bottom: "-115px",
            }}
          >
            <Scrollbars
              style={{
                width: 995,
                maxWidth: `calc(100vw - ${
                  useMediaQuery(theme.breakpoints.down("sm")) ? `16px` : `80px`
                })`,
                height: 170,
              }}
              renderThumbHorizontal={({ style, ...props }) => {
                const thumbStyle = {
                  backgroundColor: alpha(String(theme.common.label), 0.22),
                  borderRadius: "6px",
                  height: "150%",
                };
                return <div style={{ ...style, ...thumbStyle }} {...props} />;
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridAutoFlow: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  gap: 2,
                  py: 1,
                }}
                className="ourTeamBox"
              >
                {memberData.map((member, index) => {
                  const highlighted =
                    member.member_id === activeMember.member_id;
                  const { profile_image_link } = member;
                  return (
                    <IconButton
                      key={index}
                      sx={{ color: theme.common.yellow }}
                      onClick={() => handleChangeActiveMember(member)}
                    >
                      <Avatar
                        className={"activeMemberAvatar"}
                        alt={`${activeMember.member_firstname} ${activeMember.member_lastname}`}
                        src={profile_image_link}
                        sx={{
                          width: 125,
                          height: 120,
                          transition:
                            "box-shadow 300ms ease-in-out, border 300ms ease-in-out",
                          boxShadow: highlighted
                            ? `0px 0px 12px ${theme.common.yellow}`
                            : "none",
                          border: highlighted
                            ? `4px solid ${theme.common.yellow}`
                            : "none",
                        }}
                      />
                    </IconButton>
                  );
                })}
              </Box>
            </Scrollbars>
          </Box>
        </Container>
      </Container>
      <Container maxWidth="md" sx={{ pb: 8, pt: 9 }}>
        <Grid
          container
          justifyContent={{ xs: "center", sm: "space-between" }}
          alignItems="center"
          flexDirection="row"
          rowSpacing={4}
          columnSpacing={2}
        >
          <Grid item className="fadeIn">
            {previousMember.member_role && (
              <Stack
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={1.3}
              >
                <Typography component="span" className={classes.upcomingTitle}>
                  {formatMessage({ id: "Previous Member" })}
                </Typography>
                <Typography className={classes.whiteTitle}>
                  {previousMember.member_role}
                </Typography>
              </Stack>
            )}
          </Grid>
          <Grid item className="fadeIn">
            {nextMember.member_role && (
              <Stack
                direction="column"
                justifyContent="center"
                alignItems="flex-start"
                spacing={1.3}
              >
                <Typography component="span" className={classes.upcomingTitle}>
                  {formatMessage({ id: "Next Member" })}
                </Typography>
                <Typography className={classes.whiteTitle}>
                  {nextMember.member_role}
                </Typography>
              </Stack>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default injectIntl(OurTeam);
