import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const DRAWER_WIDTH = 260

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar drawerWidth={DRAWER_WIDTH} onMenuClick={() => setMobileOpen(!mobileOpen)} />
      <Sidebar drawerWidth={DRAWER_WIDTH} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { md: `${DRAWER_WIDTH}px` },
          minHeight: '100vh',
          background: '#f0f2f5'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}
