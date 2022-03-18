import { createTheme } from "@mui/material/styles";
import React from "react";

declare module "@mui/material/styles" {
  interface Theme {
    common: {
      line: React.CSSProperties["color"];
      inputBackground: React.CSSProperties["color"];
      background: React.CSSProperties["color"];
      offWhite: React.CSSProperties["color"];
      placeholder: React.CSSProperties["color"];
      label: React.CSSProperties["color"];
      body: React.CSSProperties["color"];
      titleActive: React.CSSProperties["color"];
      yellow: React.CSSProperties["color"];
    };
    gradient: {
      background: React.CSSProperties["color"];
      yellowTitle: React.CSSProperties["color"];
      yellowOrangeTitle: React.CSSProperties["color"];
    };
  }
  interface ThemeOptions {
    common: {
      line: React.CSSProperties["color"];
      inputBackground: React.CSSProperties["color"];
      background: React.CSSProperties["color"];
      offWhite: React.CSSProperties["color"];
      placeholder: React.CSSProperties["color"];
      label: React.CSSProperties["color"];
      body: React.CSSProperties["color"];
      titleActive: React.CSSProperties["color"];
      yellow: React.CSSProperties["color"];
    };
    gradient: {
      background: React.CSSProperties["color"];
      yellowTitle: React.CSSProperties["color"];
      yellowOrangeTitle: React.CSSProperties["color"];
    };
  }
  interface TypographyVariants {
    h1Regular: React.CSSProperties;
    h1Medium: React.CSSProperties;
    h1SemiBold: React.CSSProperties;
    h1Bold: React.CSSProperties;
    h2Regular: React.CSSProperties;
    h2Medium: React.CSSProperties;
    h2SemiBold: React.CSSProperties;
    h2Bold: React.CSSProperties;
    h3Regular: React.CSSProperties;
    h3Medium: React.CSSProperties;
    h3SemiBold: React.CSSProperties;
    h3Bold: React.CSSProperties;
    h4Regular: React.CSSProperties;
    h4Medium: React.CSSProperties;
    h4SemiBold: React.CSSProperties;
    h4Bold: React.CSSProperties;
    h5Regular: React.CSSProperties;
    h5Medium: React.CSSProperties;
    h5SemiBold: React.CSSProperties;
    h5Bold: React.CSSProperties;
    h6Medium: React.CSSProperties;
    h6Regular: React.CSSProperties;
    h6SemiBold: React.CSSProperties;
    h6Bold: React.CSSProperties;
    body1Regular: React.CSSProperties;
    body1Medium: React.CSSProperties;
    body1SemiBold: React.CSSProperties;
    body1Bold: React.CSSProperties;
    body2: React.CSSProperties;
    body2Regular: React.CSSProperties;
    body2Medium: React.CSSProperties;
    body2SemiBold: React.CSSProperties;
    body2Bold: React.CSSProperties;
    body3: React.CSSProperties;
    body3Regular: React.CSSProperties;
    body3Medium: React.CSSProperties;
    body3SemiBold: React.CSSProperties;
    body3Bold: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    h1Regular: React.CSSProperties;
    h1Medium: React.CSSProperties;
    h1SemiBold: React.CSSProperties;
    h1Bold: React.CSSProperties;
    h2Regular: React.CSSProperties;
    h2Medium: React.CSSProperties;
    h2SemiBold: React.CSSProperties;
    h2Bold: React.CSSProperties;
    h3Regular: React.CSSProperties;
    h3Medium: React.CSSProperties;
    h3SemiBold: React.CSSProperties;
    h3Bold: React.CSSProperties;
    h4Regular: React.CSSProperties;
    h4Medium: React.CSSProperties;
    h4SemiBold: React.CSSProperties;
    h4Bold: React.CSSProperties;
    h5Regular: React.CSSProperties;
    h5Medium: React.CSSProperties;
    h5SemiBold: React.CSSProperties;
    h5Bold: React.CSSProperties;
    h6Medium: React.CSSProperties;
    h6Regular: React.CSSProperties;
    h6SemiBold: React.CSSProperties;
    h6Bold: React.CSSProperties;
    body1Regular: React.CSSProperties;
    body1Medium: React.CSSProperties;
    body1SemiBold: React.CSSProperties;
    body1Bold: React.CSSProperties;
    body2: React.CSSProperties;
    body2Regular: React.CSSProperties;
    body2Medium: React.CSSProperties;
    body2SemiBold: React.CSSProperties;
    body2Bold: React.CSSProperties;
    body3: React.CSSProperties;
    body3Regular: React.CSSProperties;
    body3Medium: React.CSSProperties;
    body3SemiBold: React.CSSProperties;
    body3Bold: React.CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    h1Regular: true;
    h1Medium: true;
    h1SemiBold: true;
    h1Bold: true;
    h2Regular: true;
    h2Medium: true;
    h2SemiBold: true;
    h2Bold: true;
    h3Regular: true;
    h3Medium: true;
    h3SemiBold: true;
    h3Bold: true;
    h4Regular: true;
    h4Medium: true;
    h4SemiBold: true;
    h4Bold: true;
    h5Regular: true;
    h5Medium: true;
    h5SemiBold: true;
    h5Bold: true;
    h6Medium: true;
    h6Regular: true;
    h6SemiBold: true;
    h6Bold: true;
    body1Regular: true;
    body1Medium: true;
    body1SemiBold: true;
    body1Bold: true;
    body2: true;
    body2Regular: true;
    body2Medium: true;
    body2SemiBold: true;
    body2Bold: true;
    body3: true;
    body3Regular: true;
    body3Medium: true;
    body3SemiBold: true;
    body3Bold: true;
  }
}

const POKER_BLOCKS_YELLOW = "#F3B644";

const theme = createTheme({
  palette: {
    primary: {
      main: "#730808",
    },
    secondary: {
      main: "#3C4A63",
    },
    error: {
      main: "#DD0303",
    },
    success: {
      main: "#00BA88",
    },
  },
  common: {
    line: "#FFFFFF2E",
    inputBackground: "#F4F5F7",
    background:
      "radial-gradient(100% 100% at 50% 0%, #343537 0%, #000000 100%)",
    offWhite: "rgba(255,255,255,0.6)",
    placeholder: "#A0A3BD",
    label: "#FDFDFD",
    body: "#0F325A",
    titleActive: POKER_BLOCKS_YELLOW,
    yellow: POKER_BLOCKS_YELLOW,
  },
  gradient: {
    background:
      "radial-gradient(99.5% 99.5% at 50% 0.5%, #3C4A63 0%, #000000 100%)",
    yellowTitle:
      "linear-gradient(180deg, #FF3334 0%, #F3B644 0.01%, #F3B644 100%)",
    yellowOrangeTitle: "linear-gradient(180deg, #FF3334 0%, #F3B644 100%)",
  },
  typography: {
    fontFamily: [
      "Righteous",
      "Lato",
      "Raleway",
      "Poppins",
      "Roboto",
      '"Segoe UI"',
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      '"Fira Sans"',
      '"Droid Sans"',
      '"Helvetica Neue"',
      "sans-serif",
    ].join(","),
    h1: {
      fontSize: "3rem",
      fontWeight: 300,
      fontStyle: "normal",
    },
    h1Regular: {
      fontSize: "3rem",
      fontWeight: 400,
      fontStyle: "normal",
    },
    h1Medium: {
      fontSize: "3rem",
      fontWeight: 500,
      fontStyle: "normal",
    },
    h1SemiBold: {
      fontSize: "3rem",
      fontWeight: 600,
      fontStyle: "normal",
    },
    h1Bold: {
      fontSize: "3rem",
      fontWeight: 700,
      fontStyle: "normal",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 300,
      fontStyle: "normal",
    },
    h2Regular: {
      fontSize: "2rem",
      fontWeight: 400,
      fontStyle: "normal",
    },
    h2Medium: {
      fontSize: "2rem",
      fontWeight: 500,
      fontStyle: "normal",
    },
    h2SemiBold: {
      fontSize: "2rem",
      fontWeight: 600,
      fontStyle: "normal",
    },
    h2Bold: {
      fontSize: "2rem",
      fontWeight: 700,
      fontStyle: "normal",
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 300,
      fontStyle: "normal",
    },
    h3Regular: {
      fontSize: "1.5rem",
      fontWeight: 400,
      fontStyle: "normal",
    },
    h3Medium: {
      fontSize: "1.5rem",
      fontWeight: 500,
      fontStyle: "normal",
    },
    h3SemiBold: {
      fontSize: "1.5rem",
      fontWeight: 600,
      fontStyle: "normal",
    },
    h3Bold: {
      fontSize: "1.5rem",
      fontWeight: 700,
      fontStyle: "normal",
    },
    h4: {
      fontSize: "1.3rem",
      fontWeight: 300,
      fontStyle: "normal",
    },
    h4Regular: {
      fontSize: "1.3rem",
      fontWeight: 400,
      fontStyle: "normal",
    },
    h4Medium: {
      fontSize: "1.3rem",
      fontWeight: 500,
      fontStyle: "normal",
    },
    h4SemiBold: {
      fontSize: "1.3rem",
      fontWeight: 600,
      fontStyle: "normal",
    },
    h4Bold: {
      fontSize: "1.3rem",
      fontWeight: 600,
      fontStyle: "normal",
    },
    h5: {
      fontSize: "1.1rem",
      fontWeight: 300,
      fontStyle: "normal",
    },
    h5Regular: {
      fontSize: "1.1rem",
      fontWeight: 400,
      fontStyle: "normal",
    },
    h5Medium: {
      fontSize: "1.1rem",
      fontWeight: 500,
      fontStyle: "normal",
    },
    h5SemiBold: {
      fontSize: "1.1rem",
      fontWeight: 600,
      fontStyle: "normal",
    },
    h5Bold: {
      fontSize: "1.1rem",
      fontWeight: 700,
      fontStyle: "normal",
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 300,
      fontStyle: "normal",
    },
    h6Medium: {
      fontSize: "1rem",
      fontWeight: 500,
      fontStyle: "normal",
    },
    h6Regular: {
      fontSize: "1rem",
      fontWeight: 400,
      fontStyle: "normal",
    },
    h6SemiBold: {
      fontSize: "1rem",
      fontWeight: 600,
      fontStyle: "normal",
    },
    h6Bold: {
      fontSize: "1rem",
      fontWeight: 700,
      fontStyle: "normal",
    },
    body1: {
      fontSize: "0.9rem",
      fontWeight: 300,
      fontStyle: "normal",
    },
    body1Regular: {
      fontSize: "0.9rem",
      fontWeight: 400,
      fontStyle: "normal",
    },
    body1Medium: {
      fontSize: "0.9rem",
      fontWeight: 500,
      fontStyle: "normal",
    },
    body1SemiBold: {
      fontSize: "0.9rem",
      fontWeight: 600,
      fontStyle: "normal",
    },
    body1Bold: {
      fontSize: "0.9rem",
      fontWeight: 700,
      fontStyle: "normal",
    },
    body2: {
      fontSize: "0.8rem",
      fontWeight: 300,
      fontStyle: "normal",
    },
    body2Regular: {
      fontSize: "0.8rem",
      fontWeight: 400,
      fontStyle: "normal",
    },
    body2Medium: {
      fontSize: "0.8rem",
      fontWeight: 500,
      fontStyle: "normal",
    },
    body2SemiBold: {
      fontSize: "0.8rem",
      fontWeight: 600,
      fontStyle: "normal",
    },
    body2Bold: {
      fontSize: "0.8rem",
      fontWeight: 700,
      fontStyle: "normal",
    },
    body3: {
      fontSize: "0.6rem",
      fontWeight: 300,
      fontStyle: "normal",
    },
    body3Regular: {
      fontSize: "0.6rem",
      fontWeight: 400,
      fontStyle: "normal",
    },
    body3Medium: {
      fontSize: "0.6rem",
      fontWeight: 500,
      fontStyle: "normal",
    },
    body3SemiBold: {
      fontSize: "0.6rem",
      fontWeight: 600,
      fontStyle: "normal",
    },
    body3Bold: {
      fontSize: "0.6rem",
      fontWeight: 700,
      fontStyle: "normal",
    },
  },
});

export default theme;
