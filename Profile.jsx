import React, { useEffect, useState } from 'react'
import { Box, Typography, Card, CardContent, Grid, TextField, Button, Alert, Divider, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import { studentAPI, authAPI } from '../../services/api'

export default function StudentProfile() {
  const [student, setStudent] = useState(null)
  const [form, setForm] = useState({ phone: '', address: '' })
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '' })
  const [history, setHistory] = useState([])
  const [alert, setAlert] = useState({ msg: '', type: 'success' })

  useEffect(() => {
    studentAPI.getProfile().then(r => { setStudent(r.data.student); setForm({ phone: r.data.student.phone || '', address: r.data.student.address || '' }) })
    studentAPI.getLoginHistory().then(r => setHistory(r.data.logs))
  }, [])

  const handleUpdate = async () => {
    try { await studentAPI.updateProfile(form); setAlert({ msg: 'Profile updated', type: 'success' }) }
    catch { setAlert({ msg: 'Update failed', type: 'error' }) }
  }

  const handleChangePwd = async () => {
    try { await authAPI.changePassword(pwdForm); setAlert({ msg: 'Password changed successfully', type: 'success' }); setPwdForm({ current_password: '', new_password: '' }) }
    catch (e) { setAlert({ msg: e.response?.data?.error || 'Failed', type: 'error' }) }
  }

  if (!student) return null

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>My Profile</Typography>
      {alert.msg && <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert({ msg: '', type: 'success' })}>{alert.msg}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>Personal Information</Typography>
                <Chip icon={<VerifiedIcon />} label={student.integrity_status} color={student.integrity_status === 'VALID' ? 'success' : 'error'} size="small" />
              </Box>
              <Grid container spacing={1.5}>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Student ID</Typography><Typography fontWeight={600}>{student.student_id}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Full Name</Typography><Typography fontWeight={500}>{student.full_name}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Email</Typography><Typography>{student.email}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Department</Typography><Typography>{student.department_name || '-'}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Semester</Typography><Typography>Semester {student.semester}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">CGPA</Typography><Typography fontWeight={600}>{student.cgpa}</Typography></Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Update Contact Info</Typography>
              <TextField fullWidth label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} sx={{ mb: 1.5 }} size="small" />
              <TextField fullWidth label="Address" multiline rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} sx={{ mb: 1.5 }} size="small" />
              <Button variant="contained" onClick={handleUpdate} size="small">Update Profile</Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Change Password</Typography>
              <TextField fullWidth label="Current Password" type="password" value={pwdForm.current_password} onChange={e => setPwdForm({ ...pwdForm, current_password: e.target.value })} sx={{ mb: 1.5 }} size="small" />
              <TextField fullWidth label="New Password" type="password" value={pwdForm.new_password} onChange={e => setPwdForm({ ...pwdForm, new_password: e.target.value })} sx={{ mb: 2 }} size="small"
                helperText="Min 8 chars, uppercase, lowercase, number, special character" />
              <Button variant="outlined" color="primary" onClick={handleChangePwd} size="small">Change Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Login History</Typography>
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow><TableCell>Action</TableCell><TableCell>IP</TableCell><TableCell>Time</TableCell></TableRow>
                  </TableHead>
                  <TableBody>
                    {history.slice(0, 8).map(l => (
                      <TableRow key={l.id}>
                        <TableCell><Chip label={l.action} size="small" color={l.action === 'LOGIN_SUCCESS' ? 'success' : 'error'} /></TableCell>
                        <TableCell><Typography variant="caption" fontFamily="monospace">{l.ip_address}</Typography></TableCell>
                        <TableCell><Typography variant="caption">{new Date(l.timestamp).toLocaleString()}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
