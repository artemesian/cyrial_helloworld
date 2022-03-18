import { Box, Grid, useTheme } from "@mui/material";
import anime from "animejs";
import metaplexLogo from "../../assets/images/619cf6252d501321e9a8231a_Metaplex20Logo_White.png";
import solanaLogo from "../../assets/images/solanaLogo.png";
import treeLogo from "../../assets/images/artflow_202111181738 1.png";
import { useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
AOS.init();

export default function Sponsors() {
  const theme = useTheme();
  const logoList = [
    { logo: metaplexLogo, "data-aos": "fade-right" },
    { logo: solanaLogo, "data-aos": "fade-down" },
    { logo: treeLogo, "data-aos": "fade-left" },
  ];

  const animationRef: React.MutableRefObject<anime.AnimeTimelineInstance | null> =
    useRef(null);
  useEffect(() => {
    animationRef.current = anime.timeline({
      easing: "easeOutExpo",
      duration: 1000,
      delay: 400,
    });
    animationRef.current
      .add(
        {
          targets: ".el-left",
          translateX: ["-100%", "0%"],
          opacity: [0, 1],
        },
        0
      )
      .add(
        {
          targets: ".el-middle",
          scaleY: [0, 1],
          opacity: [0, 1],
        },
        0
      )
      .add(
        {
          targets: ".el-right",
          translateX: ["100%", "0%"],
          opacity: [0, 1],
        },
        0
      );
  }, []);

  return (
    <Box
      sx={{
        background: `radial-gradient(217.02% 217.02% at 56.68% -22.34%, ${theme.palette.secondary.main} 0%, #000000 100%)`,
      }}
    >
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignContent="center"
        px={11}
        pb={3}
        spacing={3}
        minHeight="100px"
      >
        {logoList.map(({ logo, "data-aos": dataAos }, index) => (
          <Grid
            item
            key={index}
            justifyContent="center"
            alignContent="center"
            display="flex"
            xs={12}
            sm={12}
            md="auto"
            data-aos={dataAos}
          >
            <img
              alt={"logo"}
              src={logo}
              style={{ objectFit: "contain" }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
