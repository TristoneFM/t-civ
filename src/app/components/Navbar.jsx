import { AppBar, Toolbar, Box } from '@mui/material';

export default function Navbar() {
  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          {/* We can add navigation items here later */}
        </Box>
      </Toolbar>
    </AppBar>
  );
} 