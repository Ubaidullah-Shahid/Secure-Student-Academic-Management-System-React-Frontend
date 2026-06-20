// frontend/src/pages/teacher/Announcements.jsx  (NEW FILE)
import React, { useEffect, useState } from 'react'
import {
  Box, Typography, Paper, Button, TextField, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Alert, Snackbar,
  Table, TableHead, TableRow, TableCell, TableBody, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from '@mui/material'
import CampaignIcon from '@mui/icons-material/Campaign'
import AddIcon from '@mui/icons-material/Add'
import { teacherAPI, adminAPI } from '../../services/api'
import api from '../../services/api'

// Teacher sends notifications to students in their courses
export default function TeacherAnnouncements() {
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [sent, setSent] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' })
  const [dialog, setDialog] = useState(false)
  const [form, setForm] = useState({
    title: '', message: '', course_id: '', recipient_id: '', type: 'info', broadcast_course: false
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    teacherAPI.getCourses()
      .then(({ data }) => setCourses(data.courses || []))
      .finally(() => setLoading(false))
  }, [])

  const loadStudents = (cid) => {
    if (!cid) { setStudents([]); return }
    teacherAPI.getCourseStudents(cid)
      .then(({ data }) => setStudents(data.students || []))
  }

  const handleCourseChange = (cid) => {
    setForm(f => ({ ...f, course_id: cid, recipient_id: '' }))
    loadStudents(cid)
  }

  const handleSend = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      setToast({ open: true, msg: 'Title and message are required', severity: 'error' })
      return
    }
    setSubmitting(true)
    try {
      // Teacher uses admin notification endpoint (teacher_required allows admin+teacher)
      let payload = {
        title: form.title,
        message: form.message,
        type: form.type,
      }
      if (form.broadcast_course && form.course_id) {
        // Send to all students in selected course
        const targets = students
        let count = 0
        for (const s of targets) {
          await api.post('/admin/notifications', {
            ...payload, recipient_id: s.user_id
          })
          count++
        }
        setToast({ open: true, msg: `Announcement sent to ${count} students`, severity: 'success' })
      } else if (form.recipient_id) {
        await api.post('/admin/notifications', { ...payload, recipient_id: parseInt(form.recipient_id) })
        setToast({ open: true, msg: 'Notification sent successfully', severity: 'success' })
      } else {
        setToast({ open: true, msg: 'Select a recipient or enable broadcast', severity: 'error' })
        setSubmitting(false); return
      }
      setDialog(false)
      setForm({ title: '', message: '', course_id: '', recipient_id: '', type: 'info', broadcast_course: false })
    } catch {
      setToast({ open: true, msg: 'Failed to send notification', severity: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
      <CircularProgress />
    </Box>
  )

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <CampaignIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h5">Announcements</Typography>
            <Typography variant="body2" color="text.secondary">
              Send notifications to students in your courses
            </Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialog(true)}>
          New Announcement
        </Button>
      </Box>

      {/* Course cards */}
      {courses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No courses assigned yet</Typography>
        </Paper>
      ) : (
        <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={2}>
          {courses.map(c => (
            <Paper key={c.id} variant="outlined" sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>{c.name}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>{c.code}</Typography>
              <Chip label={`${c.enrolled_students ?? 0} students`} size="small" color="primary" variant="outlined" />
              <Box mt={1.5}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<CampaignIcon />}
                  onClick={() => {
                    handleCourseChange(c.id)
                    setForm(f => ({ ...f, course_id: c.id, broadcast_course: true }))
                    setDialog(true)
                  }}
                >
                  Announce to class
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Send Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Announcement / Notification</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Course</InputLabel>
              <Select value={form.course_id} label="Course"
                onChange={e => handleCourseChange(e.target.value)}>
                <MenuItem value="">— Select Course —</MenuItem>
                {courses.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name} ({c.code})</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Recipient</InputLabel>
              <Select value={form.broadcast_course ? '__broadcast__' : form.recipient_id}
                label="Recipient"
                onChange={e => {
                  if (e.target.value === '__broadcast__') {
                    setForm(f => ({ ...f, broadcast_course: true, recipient_id: '' }))
                  } else {
                    setForm(f => ({ ...f, broadcast_course: false, recipient_id: e.target.value }))
                  }
                }}>
                <MenuItem value="__broadcast__">📢 All students in this course</MenuItem>
                {students.map(s => (
                  <MenuItem key={s.user_id} value={s.user_id}>
                    {s.full_name} ({s.student_id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select value={form.type} label="Type"
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="error">Urgent</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Title" size="small" fullWidth
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              inputProps={{ maxLength: 200 }}
            />
            <TextField
              label="Message" size="small" fullWidth multiline rows={4}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              inputProps={{ maxLength: 1000 }}
              helperText={`${form.message.length}/1000`}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSend} disabled={submitting}
            startIcon={<CampaignIcon />}>
            {submitting ? 'Sending…' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open} autoHideDuration={4000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast(t => ({ ...t, open: false }))}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}
