import React, { useEffect, useState } from 'react'
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Grid, Chip, IconButton, Alert, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { adminAPI } from '../../services/api'

const blank = { code: '', name: '', description: '', credit_hours: 3, department_id: '', teacher_id: '', semester: '' }

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [depts, setDepts] = useState([])
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [open, setOpen] = useState(false)
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [enrollCourse, setEnrollCourse] = useState(null)
  const [enrollStudent, setEnrollStudent] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [alert, setAlert] = useState('')
  const [error, setError] = useState('')

  const load = () => {
    adminAPI.getCourses().then(r => setCourses(r.data.courses))
    adminAPI.getDepartments().then(r => setDepts(r.data.departments))
    adminAPI.getTeachers().then(r => setTeachers(r.data.teachers))
    adminAPI.getStudents().then(r => setStudents(r.data.students))
  }
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setError('')
    try {
      if (editing) { await adminAPI.updateCourse(editing.id, form) }
      else { await adminAPI.createCourse(form) }
      setAlert(editing ? 'Course updated' : 'Course created')
      setOpen(false); setEditing(null); setForm(blank); load()
    } catch (e) { setError(e.response?.data?.error || 'Operation failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return
    await adminAPI.deleteCourse(id); setAlert('Course deleted'); load()
  }

  const handleEnroll = async () => {
    try {
      await adminAPI.enrollStudent(enrollCourse.id, { student_id: enrollStudent })
      setAlert('Student enrolled'); setEnrollOpen(false); setEnrollStudent(''); load()
    } catch (e) { setError(e.response?.data?.error || 'Enrollment failed') }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Course Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setForm(blank); setOpen(true) }}>Add Course</Button>
      </Box>
      {alert && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setAlert('')}>{alert}</Alert>}
      <Paper>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Department</TableCell>
              <TableCell>Teacher</TableCell><TableCell>Credits</TableCell><TableCell>Semester</TableCell>
              <TableCell>Enrolled</TableCell><TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map(c => (
              <TableRow key={c.id} hover>
                <TableCell><Chip label={c.code} size="small" color="secondary" /></TableCell>
                <TableCell><Typography fontWeight={500}>{c.name}</Typography></TableCell>
                <TableCell>{c.department_name || '-'}</TableCell>
                <TableCell>{c.teacher_name || <Chip label="Unassigned" size="small" />}</TableCell>
                <TableCell>{c.credit_hours}</TableCell>
                <TableCell>{c.semester || '-'}</TableCell>
                <TableCell><Chip label={c.enrollment_count} size="small" variant="outlined" /></TableCell>
                <TableCell>
                  <IconButton size="small" color="success" onClick={() => { setEnrollCourse(c); setEnrollOpen(true) }}><PersonAddIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="primary" onClick={() => { setEditing(c); setForm({ name: c.name, description: c.description || '', credit_hours: c.credit_hours, department_id: c.department_id || '', teacher_id: c.teacher_id || '', semester: c.semester || '' }); setOpen(true) }}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Course' : 'Add Course'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {!editing && <Grid item xs={6}><TextField fullWidth label="Course Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required /></Grid>}
            <Grid item xs={editing ? 12 : 6}><TextField fullWidth label="Course Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Credit Hours" type="number" value={form.credit_hours} onChange={e => setForm({ ...form, credit_hours: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Semester" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth><InputLabel>Department</InputLabel>
                <Select value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })} label="Department">
                  {depts.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth><InputLabel>Teacher</InputLabel>
                <Select value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })} label="Teacher">
                  {teachers.map(t => <MenuItem key={t.id} value={t.id}>{t.full_name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={enrollOpen} onClose={() => setEnrollOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Enroll Student in {enrollCourse?.name}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Student</InputLabel>
            <Select value={enrollStudent} onChange={e => setEnrollStudent(e.target.value)} label="Select Student">
              {students.map(s => <MenuItem key={s.id} value={s.id}>{s.full_name} ({s.student_id})</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEnrollOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEnroll} disabled={!enrollStudent}>Enroll</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
