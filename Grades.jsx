import React, { useEffect, useState } from 'react'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button, MenuItem, Select, FormControl, InputLabel, Grid, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { teacherAPI } from '../../services/api'

const blank = { student_id: '', course_id: '', midterm_marks: '', final_marks: '', assignment_marks: '', quiz_marks: '', semester: '', remarks: '' }

export default function TeacherGrades() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [students, setStudents] = useState([])
  const [grades, setGrades] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(blank)
  const [alert, setAlert] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { teacherAPI.getCourses().then(r => setCourses(r.data.courses)) }, [])

  useEffect(() => {
    if (!selectedCourse) return
    teacherAPI.getCourseStudents(selectedCourse).then(r => setStudents(r.data.students))
    teacherAPI.getGrades({ course_id: selectedCourse }).then(r => setGrades(r.data.grades))
  }, [selectedCourse])

  const handleSave = async () => {
    setError('')
    try {
      await teacherAPI.addGrade({ ...form, course_id: parseInt(selectedCourse) })
      setAlert('Grade saved')
      setOpen(false); setForm(blank)
      teacherAPI.getGrades({ course_id: selectedCourse }).then(r => setGrades(r.data.grades))
    } catch (e) { setError(e.response?.data?.error || 'Failed') }
  }

  const gradeColor = (g) => {
    if (!g) return 'default'
    if (['A+', 'A', 'A-'].includes(g)) return 'success'
    if (['B+', 'B', 'B-'].includes(g)) return 'primary'
    if (['C+', 'C', 'C-'].includes(g)) return 'warning'
    return 'error'
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Grades Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />} disabled={!selectedCourse} onClick={() => { setForm({ ...blank, course_id: selectedCourse }); setOpen(true) }}>Add Grade</Button>
      </Box>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Course</InputLabel>
        <Select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} label="Select Course">
          {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.code} — {c.name}</MenuItem>)}
        </Select>
      </FormControl>

      {alert && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setAlert('')}>{alert}</Alert>}
      <Paper>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Student</TableCell><TableCell>Midterm</TableCell><TableCell>Final</TableCell>
              <TableCell>Assignment</TableCell><TableCell>Quiz</TableCell><TableCell>Total</TableCell><TableCell>Grade</TableCell><TableCell>GPA</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.map(g => (
              <TableRow key={g.id} hover>
                <TableCell><Typography fontWeight={500}>{g.student_name}</Typography></TableCell>
                <TableCell>{g.midterm_marks}</TableCell>
                <TableCell>{g.final_marks}</TableCell>
                <TableCell>{g.assignment_marks}</TableCell>
                <TableCell>{g.quiz_marks}</TableCell>
                <TableCell><Typography fontWeight={600}>{g.total_marks}</Typography></TableCell>
                <TableCell><Chip label={g.grade_letter || '-'} color={gradeColor(g.grade_letter)} size="small" /></TableCell>
                <TableCell>{g.grade_points?.toFixed(1)}</TableCell>
              </TableRow>
            ))}
            {grades.length === 0 && (
              <TableRow><TableCell colSpan={8} align="center"><Typography variant="body2" color="text.secondary" py={3}>No grades recorded for this course</Typography></TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add / Update Grade</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth><InputLabel>Student</InputLabel>
                <Select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} label="Student">
                  {students.map(s => <MenuItem key={s.id} value={s.id}>{s.full_name} ({s.student_id})</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField fullWidth label="Midterm Marks" type="number" inputProps={{ min: 0, max: 30 }} value={form.midterm_marks} onChange={e => setForm({ ...form, midterm_marks: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Final Marks" type="number" inputProps={{ min: 0, max: 50 }} value={form.final_marks} onChange={e => setForm({ ...form, final_marks: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Assignment Marks" type="number" inputProps={{ min: 0, max: 15 }} value={form.assignment_marks} onChange={e => setForm({ ...form, assignment_marks: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Quiz Marks" type="number" inputProps={{ min: 0, max: 10 }} value={form.quiz_marks} onChange={e => setForm({ ...form, quiz_marks: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Semester" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} placeholder="e.g. Fall 2024" /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Remarks" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save Grade</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
