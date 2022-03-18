import { Box } from '@mui/system';
import { Outlet } from "react-router-dom";
import HorizontalNav from './HorizontalNav';

export default function Inventory() {
    return (
        <Box sx={{ display: "grid", gridTemplateRows: "auto 1fr", height: "100%" }}>
            <HorizontalNav />
            <Outlet></Outlet>
        </Box>
    )
}
