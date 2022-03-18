import Footer from "../components/shared/Footer.component";
import Navigation from "../components/shared/Navigation.component";
import { Outlet } from "react-router";

function LandingLayout(): JSX.Element {
  return (
    <div>
      <Navigation />
      <Outlet />
      <Footer />
    </div>
  );
}

export default LandingLayout;
