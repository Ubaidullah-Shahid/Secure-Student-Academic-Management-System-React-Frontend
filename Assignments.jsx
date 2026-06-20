import React, { useEffect, useState } from 'react'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button, MenuItem, Select, FormControl, InputLabel, Grid, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ListIcon from '@mui/icons-material/List'
import { teacherAPI } from '../../services/api'

const blank = { title: '', description: '', total_marks: 100, deadline: '', course_id: '' }

export default function TeacherAssignments() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [subOpen, setSubOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [alert, setAlert] = useState('')
  const [error, setError] = useState('')
  const [gradeOpen, setGradeOpen] = useState(false)
  const [gradeSub, setGradeSub] = useState(null)
  const [gradeMarks, setGradeMarks] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')

  useEffect(() => { teacherAPI.getCourses().then(r => setCourses(r.data.courses)) }, [])

  const loadAssignments = () => {
    const params = selectedCourse ? { course_id: selectedCourse } : {}
    teacherAPI.getAssignments(params).then(r => setAssignments(r.data.assignments))
  }
  useEffect(() => { loadAssignments() }, [selectedCourse])

  const handleSave = async () => {
    setError('')
    try {
      const payload = { ...form, course_id: form.course_id || parseInt(selectedCourse) }
      if (editing) { await teacherAPI.updateAssignment(editing.id, payload) }
      else { await teacherAPI.createAssignment(payload) }
      setAlert(editing ? 'Assignment updated' : 'Assignment created')
      setOpen(false); setEditing(null); setForm(blank); loadAssignments()
    } catch (e) { setError(e.response?.data?.error || 'Failed') }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete assignment?')) return
    await teacherAPI.deleteAssignment(id); setAlert('Deleted'); loadAssignments()
  }

  const viewSubmissions = async (aid) => {
    const r = await teacherAPI.getSubmissions(aid)
    setSubmissions(r.data.submissions); setSubOpen(true)
  }

  const handleGrade = async () => {
    await teacherAPI.gradeSubmission(gradeSub.id, { marks_obtained: gradeMarks, feedback: gradeFeedback })
    setAlert('Submission graded'); setGradeOpen(false); setGradeMarks(''); setGradeFeedback('')
    if (gradeSub.assignment_id) {
      const r = await teacherAPI.getSubmissions(gradeSub.assignment_id)
      setSubmissions(r.data.submissions)
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Assignments</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setForm({ ...blank, course_id: selectedCourse }); setOpen(true) }}>Create Assignment</Button>
      </Box>
      {alert && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setAlert('')}>{alert}</Alert>}

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Filter by Course</InputLabel>
        <Select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} label="Filter by Course">
          <MenuItem value="">All Courses</MenuItem>
          {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.code} — {c.name}</MenuItem>)}
        </Select>
      </FormControl>

      <Paper>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Title</TableCell><TableCell>Course</TableCell><TableCell>Total Marks</TableCell>
              <TableCell>Deadline</TableCell><TableCell>Submissions</TableCell><TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assignments.map(a => (
              <TableRow key={a.id} hover>
                <TableCell><Typography fontWeight={500}>{a.title}</Typography></TableCell>
                <TableCell><Chip label={a.course_code} size="small" color="secondary" /></TableCell>
                <TableCell>{a.total_marks}</TableCell>
                <TableCell>
                  {a.deadline ? (
                    <Chip label={new Date(a.deadline).toLocaleDateString()} size="small" color={new Date(a.deadline) < new Date() ? 'error' : 'primary'} />
                  ) : '-'}
                </TableCell>
                <TableCell><Chip label={a.submission_count} size="small" variant="outlined" /></TableCell>
                <TableCell>
                  <IconButton size="small" color="info" onClick={() => viewSubmissions(a.id)}><ListIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="primary" onClick={() => { setEditing(a); setForm({ title: a.title, description: a.description || '', total_marks: a.total_marks, deadline: a.deadline ? a.deadline.slice(0, 16) : '', course_id: a.course_id }); setOpen(true) }}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(a.id)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Assignment' : 'Create Assignment'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}><TextField fullWidth label="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Total Marks" type="number" value={form.total_marks} onChange={e => setForm({ ...form, total_marks: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Deadline" type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}>
              <FormControl fullWidth><InputLabel>Course</InputLabel>
                <Select value={form.course_id} onChange={e => setForm({ ...form, course_id: e.target.value })} label="Course">
                  {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.code} — {c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={subOpen} onClose={() => setSubOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Submissions</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow><TableCell>Student</TableCell><TableCell>Status</TableCell><TableCell>Marks</TableCell><TableCell>Submitted</TableCell><TableCell>Action</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {submissions.map(s => (
                <TableRow key={s.id}>
                  <TableCell>{s.student_name}</TableCell>
                  <TableCell><Chip label={s.status} color={s.status === 'graded' ? 'success' : 'primary'} size="small" /></TableCell>
                  <TableCell>{s.marks_obtained ?? '-'}</TableCell>
                  <TableCell><Typography variant="caption">{new Date(s.submitted_at).toLocaleString()}</Typography></TableCell>
                  <TableCell><Button size="small" onClick={() => { setGradeSub(s); setGradeMarks(s.marks_obtained || ''); setGradeFeedback(s.feedback || ''); setGradeOpen(true) }}>Grade</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions><Button onClick={() => setSubOpen(false)}>Close</Button></DialogActions>
      </Dialog>

      <Dialog open={gradeOpen} onClose={() => setGradeOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Grade Submission — {gradeSub?.student_name}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Marks Obtained" type="number" value={gradeMarks} onChange={e => setGradeMarks(e.target.value)} sx={{ mt: 1, mb: 2 }} />
          <TextField fullWidth label="Feedback" multiline rows={3} value={gradeFeedback} onChange={e => setGradeFeedback(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGradeOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGrade}>Save Grade</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
