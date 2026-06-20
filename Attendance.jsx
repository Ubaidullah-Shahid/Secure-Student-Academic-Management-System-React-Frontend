import React, { useEffect, useState } from 'react'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, Button, MenuItem, Select, FormControl, InputLabel, Grid, Alert, ToggleButton, ToggleButtonGroup, TextField } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { teacherAPI } from '../../services/api'

const statusColor = { present: 'success', absent: 'error', late: 'warning' }

export default function TeacherAttendance() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [report, setReport] = useState([])
  const [tab, setTab] = useState('mark')
  const [alert, setAlert] = useState('')

  useEffect(() => { teacherAPI.getCourses().then(r => setCourses(r.data.courses)) }, [])

  useEffect(() => {
    if (!selectedCourse) return
    teacherAPI.getCourseStudents(selectedCourse).then(r => {
      setStudents(r.data.students)
      const init = {}
      r.data.students.forEach(s => { init[s.id] = 'present' })
      setAttendance(init)
    })
    if (tab === 'report') teacherAPI.attendanceReport(selectedCourse).then(r => setReport(r.data.report))
  }, [selectedCourse, tab])

  const handleSave = async () => {
    const records = students.map(s => ({ student_id: s.id, status: attendance[s.id] || 'present' }))
    try {
      await teacherAPI.markAttendance({ records, date, course_id: parseInt(selectedCourse) })
      setAlert('Attendance saved successfully')
    } catch (e) { setAlert(e.response?.data?.error || 'Failed to save') }
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Attendance Management</Typography>
      {alert && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setAlert('')}>{alert}</Alert>}

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={5}>
          <FormControl fullWidth>
            <InputLabel>Select Course</InputLabel>
            <Select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} label="Select Course">
              {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.code} — {c.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField fullWidth label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={3}>
          <ToggleButtonGroup value={tab} exclusive onChange={(_, v) => v && setTab(v)} fullWidth>
            <ToggleButton value="mark">Mark</ToggleButton>
            <ToggleButton value="report">Report</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>

      {tab === 'mark' && selectedCourse && (
        <>
          <Paper sx={{ mb: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                <TableRow><TableCell>Roll No</TableCell><TableCell>Student Name</TableCell><TableCell>Status</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {students.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell><Typography fontWeight={600}>{s.student_id}</Typography></TableCell>
                    <TableCell>{s.full_name}</TableCell>
                    <TableCell>
                      <ToggleButtonGroup exclusive size="small" value={attendance[s.id] || 'present'}
                        onChange={(_, v) => v && setAttendance({ ...attendance, [s.id]: v })}>
                        <ToggleButton value="present" sx={{ '&.Mui-selected': { bgcolor: '#2e7d32', color: '#fff' } }}>Present</ToggleButton>
                        <ToggleButton value="absent" sx={{ '&.Mui-selected': { bgcolor: '#c62828', color: '#fff' } }}>Absent</ToggleButton>
                        <ToggleButton value="late" sx={{ '&.Mui-selected': { bgcolor: '#e65100', color: '#fff' } }}>Late</ToggleButton>
                      </ToggleButtonGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={!students.length}>
            Save Attendance ({students.length} students)
          </Button>
        </>
      )}

      {tab === 'report' && (
        <Paper>
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow><TableCell>Roll No</TableCell><TableCell>Name</TableCell><TableCell>Total</TableCell><TableCell>Present</TableCell><TableCell>Absent</TableCell><TableCell>Percentage</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {report.map(r => (
                <TableRow key={r.student_id} hover>
                  <TableCell fontWeight={600}>{r.roll_no}</TableCell>
                  <TableCell>{r.student_name}</TableCell>
                  <TableCell>{r.total_classes}</TableCell>
                  <TableCell><Chip label={r.present} color="success" size="small" /></TableCell>
                  <TableCell><Chip label={r.absent} color="error" size="small" /></TableCell>
                  <TableCell>
                    <Chip label={`${r.percentage}%`} color={r.percentage >= 75 ? 'success' : r.percentage >= 60 ? 'warning' : 'error'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  )
}
