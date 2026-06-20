import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Chip,
  IconButton, Alert, MenuItem, Select, FormControl, InputLabel, Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SearchIcon from '@mui/icons-material/Search'
import VerifiedIcon from '@mui/icons-material/Verified'
import WarningIcon from '@mui/icons-material/Warning'
import { adminAPI } from '../../services/api'

const blank = { username: '', email: '', password: '', first_name: '', last_name: '', teacher_id: '', phone: '', specialization: '', qualification: '', department_id: '' }

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([])
  const [depts, setDepts] = useState([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [alert, setAlert] = useState('')
  const [error, setError] = useState('')

  const load = () => {
    adminAPI.getTeachers().then(r => setTeachers(r.data.teachers))
    adminAPI.getDepartments().then(r => setDepts(r.data.departments))
  }
  useEffect(() => { load() }, [])
    try {
      if (editing) { await adminAPI.updateTeacher(editing.id, form) }
      else { await adminAPI.createTeacher(form) }
      setAlert(editing ? 'Teacher updated' : 'Teacher created')
      setOpen(false); setEditing(null); setForm(blank); load()
    } catch (e) { setError(e.response?.data?.error || 'Operation failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return
    await adminAPI.deleteTeacher(id); setAlert('Teacher deleted'); load()
  }

  const filtered = teachers.filter(t =>
    `${t.first_name} ${t.last_name} ${t.teacher_id} ${t.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Teacher Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setForm(blank); setOpen(true) }}>Add Teacher</Button>
      </Box>
      {alert && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setAlert('')}>{alert}</Alert>}
      <TextField fullWidth placeholder="Search teachers..." value={search} onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ mb: 2 }} />
      <Paper>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Teacher ID</TableCell><TableCell>Name</TableCell><TableCell>Email</TableCell>
              <TableCell>Department</TableCell><TableCell>Specialization</TableCell>
              <TableCell>Integrity</TableCell><TableCell>Courses</TableCell><TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(t => (
              <TableRow key={t.id} hover>
                <TableCell><Typography variant="body2" fontWeight={600}>{t.teacher_id}</Typography></TableCell>
                <TableCell>{t.full_name}</TableCell>
                <TableCell>{t.email}</TableCell>
                <TableCell>{t.department_name || '-'}</TableCell>
                <TableCell>{t.specialization || '-'}</TableCell>
                <TableCell>
                  <Tooltip title={t.integrity_status}>
                    <span>{t.integrity_status === 'VALID' ? <VerifiedIcon color="success" fontSize="small" /> : <WarningIcon color="warning" fontSize="small" />}</span>
                  </Tooltip>
                </TableCell>
                <TableCell><Chip label={t.course_count} size="small" variant="outlined" /></TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={() => { setEditing(t); setForm({ first_name: t.first_name, last_name: t.last_name, phone: t.phone || '', specialization: t.specialization || '', qualification: t.qualification || '', department_id: t.department_id || '' }); setOpen(true) }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(t.id)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {!editing && <>
              <Grid item xs={6}><TextField fullWidth label="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Teacher ID" value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })} required /></Grid>
            </>}
            <Grid item xs={6}><TextField fullWidth label="First Name" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Last Name" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Specialization" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Qualification" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })} label="Department">
                  {depts.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
