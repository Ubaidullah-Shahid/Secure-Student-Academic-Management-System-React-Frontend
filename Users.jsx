import React, { useEffect, useState } from 'react'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, IconButton, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Switch, FormControlLabel, Tooltip } from '@mui/material'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import LockIcon from '@mui/icons-material/Lock'
import KeyIcon from '@mui/icons-material/Key'
import DeleteIcon from '@mui/icons-material/Delete'
import VerifiedIcon from '@mui/icons-material/Verified'
import WarningIcon from '@mui/icons-material/Warning'
import { adminAPI } from '../../services/api'

const roleColor = { admin: 'error', teacher: 'primary', student: 'success' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [alert, setAlert] = useState({ msg: '', type: 'success' })
  const [pwdOpen, setPwdOpen] = useState(false)
  const [pwdUser, setPwdUser] = useState(null)
  const [newPwd, setNewPwd] = useState('')
  const [pwdError, setPwdError] = useState('')

  const load = () => { adminAPI.getUsers().then(r => setUsers(r.data.users)) }
  useEffect(() => { load() }, [])

  const handleToggle = async (user) => {
    try {
      await adminAPI.updateUser(user.id, { is_active: !user.is_active })
      setAlert({ msg: `User ${user.is_active ? 'deactivated' : 'activated'}`, type: 'success' }); load()
    } catch { setAlert({ msg: 'Failed to update user', type: 'error' }) }
  }

  const handleUnlock = async (id) => {
    await adminAPI.unlockUser(id); setAlert({ msg: 'Account unlocked', type: 'success' }); load()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return
    await adminAPI.deleteUser(id); setAlert({ msg: 'User deleted', type: 'success' }); load()
  }

  const handleResetPwd = async () => {
    setPwdError('')
    try {
      await adminAPI.resetPassword(pwdUser.id, { new_password: newPwd })
      setAlert({ msg: 'Password reset successfully', type: 'success' }); setPwdOpen(false); setNewPwd('')
    } catch (e) { setPwdError(e.response?.data?.error || 'Failed') }
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>User Management</Typography>
      {alert.msg && <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert({ msg: '', type: 'success' })}>{alert.msg}</Alert>}
      <Paper>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>ID</TableCell><TableCell>Username</TableCell><TableCell>Email</TableCell>
              <TableCell>Role</TableCell><TableCell>Status</TableCell><TableCell>Integrity</TableCell>
              <TableCell>Failed</TableCell><TableCell>Last Login</TableCell><TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id} hover sx={{ bgcolor: u.failed_attempts >= 3 ? 'rgba(198,40,40,0.05)' : 'inherit' }}>
                <TableCell>{u.id}</TableCell>
                <TableCell><Typography fontWeight={600}>{u.username}</Typography></TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Chip label={u.role.toUpperCase()} color={roleColor[u.role]} size="small" /></TableCell>
                <TableCell><Chip label={u.is_active ? 'Active' : 'Inactive'} color={u.is_active ? 'success' : 'default'} size="small" /></TableCell>
                <TableCell>
                  <Tooltip title={u.integrity_status}>
                    <span>{u.integrity_status === 'VALID' ? <VerifiedIcon color="success" fontSize="small" /> : <WarningIcon color="warning" fontSize="small" />}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip label={u.failed_attempts} color={u.failed_attempts >= 5 ? 'error' : u.failed_attempts >= 3 ? 'warning' : 'default'} size="small" />
                </TableCell>
                <TableCell><Typography variant="caption">{u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</Typography></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Tooltip title={u.is_active ? 'Deactivate' : 'Activate'}>
                    <IconButton size="small" color={u.is_active ? 'warning' : 'success'} onClick={() => handleToggle(u)}>
                      {u.is_active ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset Password">
                    <IconButton size="small" color="primary" onClick={() => { setPwdUser(u); setPwdOpen(true) }}><KeyIcon fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Unlock Account">
                    <IconButton size="small" color="info" onClick={() => handleUnlock(u.id)}><LockOpenIcon fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(u.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={pwdOpen} onClose={() => setPwdOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password for {pwdUser?.username}</DialogTitle>
        <DialogContent>
          {pwdError && <Alert severity="error" sx={{ mb: 2 }}>{pwdError}</Alert>}
          <TextField fullWidth label="New Password" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} sx={{ mt: 1 }}
            helperText="Min 8 chars, uppercase, lowercase, number, special char" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPwdOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleResetPwd}>Reset</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
