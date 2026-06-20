// frontend/src/pages/student/Notifications.jsx  (NEW FILE)
import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Chip, IconButton, Button,
  Divider, CircularProgress, Alert, Tooltip, Badge
} from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import { studentAPI } from '../../services/api'

const typeConfig = {
  info:    { color: 'info',    icon: <InfoOutlinedIcon fontSize="small" /> },
  warning: { color: 'warning', icon: <WarningAmberIcon fontSize="small" /> },
  success: { color: 'success', icon: <CheckCircleOutlineIcon fontSize="small" /> },
  error:   { color: 'error',   icon: <ErrorOutlineIcon fontSize="small" /> }
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    studentAPI.getNotifications()
      .then(({ data }) => setNotifications(data.notifications || []))
      .catch(() => setError('Failed to load notifications'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    try {
      await studentAPI.markNotificationRead(id)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      )
    } catch { /* ignore */ }
  }

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read)
    await Promise.all(unread.map(n => studentAPI.markNotificationRead(n.id)))
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress />
    </Box>
  )

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          </Badge>
          <Box>
            <Typography variant="h5">Notifications</Typography>
            <Typography variant="body2" color="text.secondary">
              {unreadCount} unread · {notifications.length} total
            </Typography>
          </Box>
        </Box>
        {unreadCount > 0 && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={markAllRead}
          >
            Mark All Read
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {notifications.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <NotificationsIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary">No notifications yet</Typography>
        </Paper>
      ) : (
        <Paper elevation={0} variant="outlined">
          {notifications.map((n, idx) => {
            const tc = typeConfig[n.type] || typeConfig.info
            return (
              <React.Fragment key={n.id}>
                <Box
                  sx={{
                    px: 3, py: 2,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    bgcolor: n.is_read ? 'transparent' : 'primary.50',
                    transition: 'background 0.2s',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  {/* Type icon */}
                  <Box
                    sx={{
                      mt: 0.3,
                      color: `${tc.color}.main`,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {tc.icon}
                  </Box>

                  {/* Content */}
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={0.4}>
                      <Typography
                        variant="subtitle2"
                        fontWeight={n.is_read ? 400 : 600}
                        color={n.is_read ? 'text.primary' : 'primary.dark'}
                      >
                        {n.title}
                      </Typography>
                      {!n.is_read && (
                        <Box
                          sx={{
                            width: 8, height: 8, borderRadius: '50%',
                            bgcolor: 'primary.main', flexShrink: 0
                          }}
                        />
                      )}
                      <Chip
                        label={n.type}
                        size="small"
                        color={tc.color}
                        variant="outlined"
                        sx={{ height: 18, fontSize: '0.65rem' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      From: {n.sender_name} &nbsp;·&nbsp; {formatDate(n.created_at)}
                    </Typography>
                  </Box>

                  {/* Mark read button */}
                  {!n.is_read && (
                    <Tooltip title="Mark as read">
                      <IconButton
                        size="small"
                        onClick={() => markRead(n.id)}
                        sx={{ color: 'primary.main', mt: 0.3 }}
                      >
                        <CheckCircleOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                {idx < notifications.length - 1 && <Divider />}
              </React.Fragment>
            )
          })}
        </Paper>
      )}
    </Box>
  )
}
