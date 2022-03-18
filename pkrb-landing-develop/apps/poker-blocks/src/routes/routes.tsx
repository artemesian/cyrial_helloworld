import LandingLayout from "../pages/LandingLayout";
import { Navigate } from "react-router";
import HomeComponent from "../components/home/Home.component";
import { Typography } from "@mui/material";
import GettingStartedComponent from "../components/GettingStarted.component";
import RoadmapComponent from "../components/Roadmap.component";
import WhitePaperComponent from "../components/WhitePaper.component";
import OurTeamComponent from "../components/OurTeam.component";
import GamePageLayout from "../components/game/GamePageLayout";
import Inventory from "../components/game/inventory/Inventory";
import AvatarPage from "../components/game/inventory/AvatarPage";

export const routes = [
  {
    path: "/",
    element: <Navigate to="/home" />,
  },
  {
    path: "/",
    element: <LandingLayout />,
    children: [
      {
        path: "home",
        element: <HomeComponent />,
      },
      {
        path: "wiki-get-started",
        element: <GettingStartedComponent />,
      },
      {
        path: "white-paper",
        element: <WhitePaperComponent />,
      },
      {
        path: "roadmap",
        element: <RoadmapComponent />,
      },
      {
        path: "our-team",
        element: <OurTeamComponent />,
      },
      {
        path: "*",
        element: <Typography>Page not found</Typography>,
      },
    ],
  },
  {
    path: "games",
    element: <GamePageLayout />,
    children: [
      { path: "home", element: <Typography>Game Home page</Typography>, },
      { path: "market", element: <Typography>Game market place</Typography>, },
      {
        path: "inventory",
        element: <Inventory />,
        children: [
          { path: "", element: <Navigate to="avatars" />, },
          { path: "avatars", element: <AvatarPage />, },
          { path: "tables", element: <Typography>Tables</Typography>, },
          { path: "DSolWallet", element: <Typography>Dsol Wallet</Typography>, },
        ]
      },
      { path: "lobby", element: <Typography>Game Lobby</Typography>, },
      { path: "*", element: <Typography>Game Page not found</Typography>, },
    ]
  },
  {
    path: "*",
    element: <Typography>Page not found</Typography>,
  },
];
