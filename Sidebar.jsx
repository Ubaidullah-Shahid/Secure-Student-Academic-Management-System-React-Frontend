// frontend/src/components/Layout/Sidebar.jsx  (REPLACE existing file)
import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Drawer, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Chip
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import BusinessIcon from '@mui/icons-material/Business'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import SecurityIcon from '@mui/icons-material/Security'
import HistoryIcon from '@mui/icons-material/History'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import GradeIcon from '@mui/icons-material/Grade'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PersonIcon from '@mui/icons-material/Person'
import ShieldIcon from '@mui/icons-material/Shield'
import AssessmentIcon from '@mui/icons-material/Assessment'
import NotificationsIcon from '@mui/icons-material/Notifications'
import CampaignIcon from '@mui/icons-material/Campaign'
import { useAuth } from '../../context/AuthContext'

const NAV = {
  admin: [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { label: 'Students', icon: <SchoolIcon />, path: '/admin/students' },
    { label: 'Teachers', icon: <PeopleIcon />, path: '/admin/teachers' },
    { label: 'Departments', icon: <BusinessIcon />, path: '/admin/departments' },
    { label: 'Courses', icon: <LibraryBooksIcon />, path: '/admin/courses' },
    { label: 'Users', icon: <ManageAccountsIcon />, path: '/admin/users' },
    { label: 'Notifications', icon: <NotificationsIcon />, path: '/admin/notifications' },
    { divider: true, label: 'Security & Reports' },
    { label: 'Security Center', icon: <SecurityIcon />, path: '/admin/security' },
    { label: 'Audit Logs', icon: <HistoryIcon />, path: '/admin/audit-logs' },
    { label: 'Reports', icon: <AssessmentIcon />, path: '/admin/reports' }
  ],
  teacher: [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/teacher/dashboard' },
    { label: 'Attendance', icon: <CheckBoxIcon />, path: '/teacher/attendance' },
    { label: 'Grades', icon: <GradeIcon />, path: '/teacher/grades' },
    { label: 'Assignments', icon: <AssignmentIcon />, path: '/teacher/assignments' },
    { label: 'Announcements', icon: <CampaignIcon />, path: '/teacher/announcements' }
  ],
  student: [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/student/dashboard' },
    { label: 'My Profile', icon: <PersonIcon />, path: '/student/profile' },
    { label: 'Grades', icon: <GradeIcon />, path: '/student/grades' },
    { label: 'Attendance', icon: <CheckBoxIcon />, path: '/student/attendance' },
    { label: 'Assignments', icon: <AssignmentIcon />, path: '/student/assignments' },
    { label: 'Notifications', icon: <NotificationsIcon />, path: '/student/notifications' }
  ]
}

function DrawerContent() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const items = NAV[user?.role] || []

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0d1b3e' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <ShieldIcon sx={{ color: '#5e92f3', fontSize: 32 }} />
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2 }}>SAMS</Typography>
          <Typography variant="caption" sx={{ color: '#7e9bc0', letterSpacing: 0.8 }}>Secure Academic</Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ p: 2 }}>
        <Chip
          label={`${user?.role?.toUpperCase()} PANEL`}
          size="small"
          sx={{ bgcolor: 'rgba(94,146,243,0.2)', color: '#5e92f3', fontWeight: 700, fontSize: '0.65rem', letterSpacing: 1 }}
        />
      </Box>
      <List sx={{ flexGrow: 1, px: 1 }}>
        {items.map((item, i) => {
          if (item.divider) return (
            <Box key={i} sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" sx={{ color: '#4a6fa5', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                {item.label}
              </Typography>
            </Box>
          )
          const active = location.pathname === item.path
          return (
            <ListItem key={i} disablePadding sx={{ mb: 0.3 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: active ? 'rgba(94,146,243,0.2)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(94,146,243,0.1)' },
                  py: 1
                }}
              >
                <ListItemIcon sx={{ color: active ? '#5e92f3' : '#7e9bc0', minWidth: 36, fontSize: 20 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 400,
                    color: active ? '#5e92f3' : '#b8d0f0'
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: '#4a6fa5', fontSize: '0.65rem' }}>
          v1.1.0 • IS Lab Project 2024
        </Typography>
      </Box>
    </Box>
  )
}

export default function Sidebar({ drawerWidth, mobileOpen, onClose }) {
  return (
    <>
      <Drawer variant="temporary" open={mobileOpen} onClose={onClose}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}>
        <DrawerContent />
      </Drawer>
      <Drawer variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', border: 'none' } }}>
        <DrawerContent />
      </Drawer>
    </>
  )
}
