import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Box, Chip, Avatar, Menu, MenuItem, Divider } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import SecurityIcon from '@mui/icons-material/Security'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const roleColors = { admin: 'error', teacher: 'primary', student: 'success' }

export default function Navbar({ drawerWidth, onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [anchor, setAnchor] = React.useState(null)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
        boxShadow: '0 2px 12px rgba(21,101,192,0.4)'
      }}
    >
      <Toolbar>
        <IconButton color="inherit" onClick={onMenuClick} sx={{ mr: 2, display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>
        <SecurityIcon sx={{ mr: 1, fontSize: 20 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.5 }}>
          SAMS — Secure Academic Management System
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label={user?.role?.toUpperCase()}
            color={roleColors[user?.role] || 'default'}
            size="small"
            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
          />
          <IconButton color="inherit" onClick={(e) => setAnchor(e.currentTarget)}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.25)', fontSize: 14 }}>
              {user?.username?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
        </Box>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          <MenuItem disabled>
            <Typography variant="caption" color="text.secondary">{user?.username} • {user?.email}</Typography>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <LogoutIcon sx={{ mr: 1, fontSize: 18 }} />Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
