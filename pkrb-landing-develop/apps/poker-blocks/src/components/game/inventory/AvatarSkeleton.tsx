import { Skeleton, Box } from "@mui/material";

export default function AvatarSkeleton() {
    return (
        <Box sx={{
            position: 'relative',
            color: '#FDFDFD',
            width: '400px',
            padding: '15px 0',
            marginTop: '75px',
            borderRadius: '9px',
            transition: 'ease-in 0.4s',
            backgroundColor: 'rgba(16, 19, 26, 0.75)',
            boxSizing: 'border-box'
        }}>
            <Box sx={{
                display: 'grid',
                width: '100%',
                columnGap: '150px',
                gridTemplateColumns: '87px 150px'
            }}>
                <Skeleton animation="wave" variant="circular" sx={{
                    width: '40px',
                    height: '40px',
                    alignSelf: 'center',
                    justifySelf: 'center'
                }} />
                <Box sx={{
                    position: 'absolute',
                    left: '74px',
                    top: '-75px'
                }}>
                    <Box sx={{ position: 'relative' }}>
                        <Skeleton animation="wave" variant="circular" sx={{
                            width: "20px",
                            height: "20px",
                            position: 'absolute',
                            left: "5px",
                            top: "5px"
                        }} />
                        <Skeleton animation="wave" variant="rectangular" sx={{
                            height: "150px",
                            width: "130px",
                            borderRadius: "10px"
                        }} />
                    </Box>
                </Box>
                <Box sx={{ alignSelf: 'center', display: 'grid', gap: "5px" }}>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: '10px'
                    }}>
                        <Skeleton variant="circular" height="20px" width="20px" animation="wave" />
                        <Skeleton variant="text" animation="wave" />
                    </Box>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: '10px'
                    }}>
                        <Skeleton variant="circular" height="20px" width="20px" animation="wave" />
                        <Skeleton variant="text" animation="wave" />
                    </Box>
                </Box>
            </Box>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'auto auto',
                gap: '10px',
                alignItems: 'center',
                marginTop: '7px'
            }}>
                <Box sx={{
                    display: 'grid',
                    gap: '15px',
                    paddingLeft: "25px",
                    marginTop: '30px'
                }}>
                    <Skeleton animation="wave" variant="text" sx={{height:"1.7rem",}} />
                    <Skeleton animation="wave" variant="text" sx={{width:"75%", justifySelf:"center"}} />
                    <Box sx={{display:"grid", gridTemplateColumns:"auto 1fr", gap:"10px", marginTop: "10px"}}>
                        <Skeleton variant="circular" animation="wave" height="100%" width="43.22px" />
                        <Box>
                            <Skeleton variant="text" animation="wave" />
                            <Skeleton variant="text" animation="wave" sx={{width:"70%"}} />
                        </Box>
                    </Box>

                </Box>
                <Box sx={{
                    display: 'grid',
                    gap: "8px",
                    paddingRight:"25px"
                }}>
                    <Skeleton variant="text" animation="wave" sx={{width:"40%", justifySelf:"center"}} />
                    <Box sx={{
                        display: 'grid',
                        gap: '5px',
                        gridTemplateColumns: '1fr 2fr',
                        marginTop: '10px'
                    }}>
                        <Skeleton variant="text" animation="wave" />
                        <Skeleton variant="text" animation="wave" />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
