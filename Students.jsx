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

const integrityIcon = { VALID: <VerifiedIcon color="success" fontSize="small" />, TAMPERED: <WarningIcon color="error" fontSize="small" />, UNVERIFIED: <WarningIcon color="warning" fontSize="small" /> }

const blank = { username: '', email: '', password: '', first_name: '', last_name: '', student_id: '', phone: '', gender: '', semester: 1, department_id: '' }

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [depts, setDepts] = useState([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [alert, setAlert] = useState('')
  const [error, setError] = useState('')

  const load = () => {
    adminAPI.getStudents().then(r => setStudents(r.data.students))
    adminAPI.getDepartments().then(r => setDepts(r.data.departments))
  }
  useEffect(() => { load() }, [])
    try {
      if (editing) {
        await adminAPI.updateStudent(editing.id, form)
      } else {
        await adminAPI.createStudent(form)
      }
      setAlert(editing ? 'Student updated' : 'Student created')
      setOpen(false); setEditing(null); setForm(blank); load()
    } catch (e) {
      setError(e.response?.data?.error || 'Operation failed')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return
    await adminAPI.deleteStudent(id)
    setAlert('Student deleted'); load()
  }

  const filtered = students.filter(s =>
    `${s.first_name} ${s.last_name} ${s.student_id} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Student Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setForm(blank); setOpen(true) }}>
          Add Student
        </Button>
      </Box>
      {alert && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setAlert('')}>{alert}</Alert>}
      <TextField fullWidth placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ mb: 2 }} />
      <Paper>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Student ID</TableCell><TableCell>Name</TableCell><TableCell>Email</TableCell>
              <TableCell>Department</TableCell><TableCell>Semester</TableCell>
              <TableCell>Integrity</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s.id} hover>
                <TableCell><Typography variant="body2" fontWeight={600}>{s.student_id}</Typography></TableCell>
                <TableCell>{s.full_name}</TableCell>
                <TableCell>{s.email}</TableCell>
                <TableCell>{s.department_name || '-'}</TableCell>
                <TableCell>Sem {s.semester}</TableCell>
                <TableCell>
                  <Tooltip title={s.integrity_status}>
                    <span>{integrityIcon[s.integrity_status] || '-'}</span>
                  </Tooltip>
                </TableCell>
                <TableCell><Chip label={s.is_active ? 'Active' : 'Inactive'} color={s.is_active ? 'success' : 'default'} size="small" /></TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={() => { setEditing(s); setForm({ first_name: s.first_name, last_name: s.last_name, phone: s.phone || '', gender: s.gender || '', semester: s.semester, department_id: s.department_id || '' }); setOpen(true) }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(s.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {!editing && <>
              <Grid item xs={6}><TextField fullWidth label="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /></Grid>
              <Grid item xs={12}><TextField fullWidth label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></Grid>
              <Grid item xs={6}><TextField fullWidth label="Student ID" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} required /></Grid>
            </>}
            <Grid item xs={6}><TextField fullWidth label="First Name" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Last Name" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} label="Gender">
                  <MenuItem value="Male">Male</MenuItem><MenuItem value="Female">Female</MenuItem><MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField fullWidth label="Semester" type="number" inputProps={{ min: 1, max: 8 }} value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} /></Grid>
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
