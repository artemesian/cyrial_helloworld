import { Box, useTheme } from "@mui/material"
import { Outlet } from "react-router";
import HorizontalNav from "../components/mydsol/HorizontalNav";
import VerticalNav from "../components/mydsol/VerticalNav";
import Scrollbars from "react-custom-scrollbars-2";

export function MyDsol() {
    const theme = useTheme();
    return (
        <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr" }}>
            <VerticalNav />
            <Box sx={{ display: "grid", gridTemplateRows: "auto 1fr", background:theme.gradient.background, color:theme.common.label }}>
                <HorizontalNav />
                <Scrollbars>
                    <Outlet></Outlet>
                </Scrollbars>
            </Box>
        </Box>
    )
}

export default MyDsol;