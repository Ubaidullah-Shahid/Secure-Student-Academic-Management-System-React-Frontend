import React, { useEffect, useState } from 'react'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, Grid, Card, CardContent, Button, Alert, Divider, CircularProgress } from '@mui/material'
import SecurityIcon from '@mui/icons-material/Security'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import VerifiedIcon from '@mui/icons-material/Verified'
import WarningIcon from '@mui/icons-material/Warning'
import ShieldIcon from '@mui/icons-material/Shield'
import { adminAPI } from '../../services/api'

export default function AdminSecurity() {
  const [locked, setLocked] = useState([])
  const [failedLogins, setFailedLogins] = useState([])
  const [integrity, setIntegrity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [alert, setAlert] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [l, f, i] = await Promise.all([adminAPI.getLockedAccounts(), adminAPI.getFailedLogins(), adminAPI.getIntegrityReport()])
      setLocked(l.data.locked_accounts)
      setFailedLogins(f.data.logs)
      setIntegrity(i.data.report)
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const handleUnlock = async (id) => {
    await adminAPI.unlockUser(id); setAlert('Account unlocked'); load()
  }

  if (loading) return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>

  const integrityColor = (s) => s === 'VALID' ? 'success' : s === 'TAMPERED' ? 'error' : 'warning'

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <ShieldIcon color="primary" sx={{ fontSize: 28 }} />
        <Typography variant="h5" fontWeight={700}>Security Center</Typography>
      </Box>
      {alert && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setAlert('')}>{alert}</Alert>}

      {integrity && (
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid #e3f2fd' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={1}>SHA-256 Integrity Summary</Typography>
                <Typography variant="body2" color="text.secondary">Total Records Checked: <strong>{integrity.summary?.total_checked}</strong></Typography>
                <Chip label={`${integrity.summary?.tampered} Tampered`} color={integrity.summary?.tampered > 0 ? 'error' : 'success'} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid #fce4ec' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={1}>Locked Accounts</Typography>
                <Typography variant="h3" fontWeight={700} color="error.main">{locked.length}</Typography>
                <Typography variant="caption" color="text.secondary">Currently locked accounts</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ border: '1px solid #fff3e0' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={1}>Failed Login Events</Typography>
                <Typography variant="h3" fontWeight={700} color="warning.main">{failedLogins.length}</Typography>
                <Typography variant="caption" color="text.secondary">Recent failed attempts</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Typography variant="h6" fontWeight={600} mb={2}>Locked Accounts</Typography>
      <Paper sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Username</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell>
              <TableCell>Failed Attempts</TableCell><TableCell>Lockout Remaining</TableCell><TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locked.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center"><Typography variant="body2" color="text.secondary" py={2}>No locked accounts</Typography></TableCell></TableRow>
            ) : locked.map(u => (
              <TableRow key={u.id} sx={{ bgcolor: 'rgba(198,40,40,0.05)' }}>
                <TableCell fontWeight={600}>{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Chip label={u.role.toUpperCase()} size="small" /></TableCell>
                <TableCell><Chip label={u.failed_attempts} color="error" size="small" /></TableCell>
                <TableCell>{u.remaining_lockout > 0 ? <Chip label={`${u.remaining_lockout}s`} color="warning" size="small" /> : <Chip label="Expired" color="success" size="small" />}</TableCell>
                <TableCell><Button size="small" startIcon={<LockOpenIcon />} onClick={() => handleUnlock(u.id)}>Unlock</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Typography variant="h6" fontWeight={600} mb={2}>SHA-256 Data Integrity Verification</Typography>
      {integrity && (
        <Paper sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow><TableCell>Type</TableCell><TableCell>ID</TableCell><TableCell>Name/Username</TableCell><TableCell>Integrity Status</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {integrity.students?.map(s => (
                <TableRow key={`s-${s.id}`} hover>
                  <TableCell><Chip label="Student" size="small" color="primary" /></TableCell>
                  <TableCell>{s.student_id}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell><Chip label={s.integrity} color={integrityColor(s.integrity)} size="small" icon={s.integrity === 'VALID' ? <VerifiedIcon /> : <WarningIcon />} /></TableCell>
                </TableRow>
              ))}
              {integrity.teachers?.map(t => (
                <TableRow key={`t-${t.id}`} hover>
                  <TableCell><Chip label="Teacher" size="small" color="secondary" /></TableCell>
                  <TableCell>{t.teacher_id}</TableCell>
                  <TableCell>{t.name}</TableCell>
                  <TableCell><Chip label={t.integrity} color={integrityColor(t.integrity)} size="small" icon={t.integrity === 'VALID' ? <VerifiedIcon /> : <WarningIcon />} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Typography variant="h6" fontWeight={600} mb={2}>Recent Failed Login Attempts</Typography>
      <Paper>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow><TableCell>Action</TableCell><TableCell>Username</TableCell><TableCell>IP Address</TableCell><TableCell>Details</TableCell><TableCell>Timestamp</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {failedLogins.slice(0, 20).map(log => (
              <TableRow key={log.id} hover>
                <TableCell><Chip label={log.action} color={log.action === 'ACCOUNT_LOCKED' ? 'error' : 'warning'} size="small" /></TableCell>
                <TableCell>{log.username || '-'}</TableCell>
                <TableCell><Typography variant="caption" fontFamily="monospace">{log.ip_address}</Typography></TableCell>
                <TableCell><Typography variant="caption">{log.details}</Typography></TableCell>
                <TableCell><Typography variant="caption">{new Date(log.timestamp).toLocaleString()}</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}
