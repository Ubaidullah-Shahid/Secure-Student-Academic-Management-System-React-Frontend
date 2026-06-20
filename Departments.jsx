import React, { useEffect, useState } from 'react'
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Chip, IconButton, Alert } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { adminAPI } from '../../services/api'

const blank = { name: '', code: '', description: '', head_name: '' }

export default function AdminDepartments() {
  const [depts, setDepts] = useState([])
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [alert, setAlert] = useState('')
  const [error, setError] = useState('')

  const load = () => { adminAPI.getDepartments().then(r => setDepts(r.data.departments)) }
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setError('')
    try {
      if (editing) { await adminAPI.updateDepartment(editing.id, form) }
      else { await adminAPI.createDepartment(form) }
      setAlert(editing ? 'Department updated' : 'Department created')
      setOpen(false); setEditing(null); setForm(blank); load()
    } catch (e) { setError(e.response?.data?.error || 'Operation failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return
    await adminAPI.deleteDepartment(id); setAlert('Department deleted'); load()
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Department Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setForm(blank); setOpen(true) }}>Add Department</Button>
      </Box>
      {alert && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setAlert('')}>{alert}</Alert>}
      <Paper>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Head</TableCell>
              <TableCell>Students</TableCell><TableCell>Courses</TableCell><TableCell>Teachers</TableCell><TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {depts.map(d => (
              <TableRow key={d.id} hover>
                <TableCell><Chip label={d.code} size="small" color="primary" /></TableCell>
                <TableCell><Typography fontWeight={500}>{d.name}</Typography></TableCell>
                <TableCell>{d.head_name || '-'}</TableCell>
                <TableCell>{d.student_count}</TableCell>
                <TableCell>{d.course_count}</TableCell>
                <TableCell>{d.teacher_count}</TableCell>
                <TableCell>
                  <IconButton size="small" color="primary" onClick={() => { setEditing(d); setForm({ name: d.name, description: d.description || '', head_name: d.head_name || '' }); setOpen(true) }}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(d.id)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Department' : 'Add Department'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {!editing && <Grid item xs={6}><TextField fullWidth label="Code (e.g. CS)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required /></Grid>}
            <Grid item xs={editing ? 12 : 6}><TextField fullWidth label="Department Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Head Name" value={form.head_name} onChange={e => setForm({ ...form, head_name: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Grid>
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
