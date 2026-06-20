// frontend/src/pages/admin/Reports.jsx  (NEW FILE)
import React, { useState } from 'react'
import {
  Box, Typography, Paper, Button, Table, TableHead, TableRow,
  TableCell, TableBody, Chip, CircularProgress, Alert, Tabs, Tab,
  Divider, TableContainer
} from '@mui/material'
import AssessmentIcon from '@mui/icons-material/Assessment'
import RefreshIcon from '@mui/icons-material/Refresh'
import PeopleIcon from '@mui/icons-material/People'
import SchoolIcon from '@mui/icons-material/School'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import GradeIcon from '@mui/icons-material/Grade'
import SecurityIcon from '@mui/icons-material/Security'
import api from '../../services/api'

function TabPanel({ value, index, children }) {
  return value === index ? <Box pt={2}>{children}</Box> : null
}

function StatusChip({ val, okLabel = 'OK', warnLabel = 'LOW' }) {
  return (
    <Chip
      label={val}
      size="small"
      color={val === okLabel ? 'success' : val === warnLabel ? 'warning' : 'default'}
      variant="outlined"
    />
  )
}

// ── Student Report Tab ──────────────────────────────────────────────────────
function StudentReport() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true); setError('')
    api.get('/reports/students')
      .then(({ data }) => setData(data))
      .catch(() => setError('Failed to load student report'))
      .finally(() => setLoading(false))
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={600}>Student Academic Summary</Typography>
        <Button size="small" startIcon={<RefreshIcon />} variant="outlined" onClick={load}>
          {loading ? 'Loading…' : 'Generate Report'}
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box textAlign="center" py={4}><CircularProgress /></Box>}
      {data && (
        <>
          <Typography variant="caption" color="text.secondary">
            Generated: {new Date(data.generated_at).toLocaleString()} · Total: {data.total} students
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  {['Student ID','Name','Department','Semester','Courses','CGPA','Attendance %','Integrity'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.78rem' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.report.map((r, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{r.student_id}</TableCell>
                    <TableCell>{r.full_name}</TableCell>
                    <TableCell>{r.department}</TableCell>
                    <TableCell>{r.semester}</TableCell>
                    <TableCell>{r.enrolled_courses}</TableCell>
                    <TableCell>
                      <Chip label={r.cgpa} size="small"
                        color={r.cgpa >= 3 ? 'success' : r.cgpa >= 2 ? 'warning' : 'error'}
                        variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={`${r.attendance_percentage}%`} size="small"
                        color={r.attendance_percentage >= 75 ? 'success' : 'warning'}
                        variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={r.integrity_status} size="small"
                        color={r.integrity_status === 'VALID' ? 'success' : r.integrity_status === 'TAMPERED' ? 'error' : 'default'}
                        variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  )
}

// ── Teacher Report Tab ──────────────────────────────────────────────────────
function TeacherReport() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true); setError('')
    api.get('/reports/teachers')
      .then(({ data }) => setData(data))
      .catch(() => setError('Failed to load teacher report'))
      .finally(() => setLoading(false))
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={600}>Teacher Workload Report</Typography>
        <Button size="small" startIcon={<RefreshIcon />} variant="outlined" onClick={load}>
          {loading ? 'Loading…' : 'Generate Report'}
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box textAlign="center" py={4}><CircularProgress /></Box>}
      {data && (
        <>
          <Typography variant="caption" color="text.secondary">
            Generated: {new Date(data.generated_at).toLocaleString()} · Total: {data.total} teachers
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  {['Teacher ID','Name','Department','Courses Assigned','Course Names','Total Students'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.78rem' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.report.map((r, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{r.teacher_id}</TableCell>
                    <TableCell>{r.full_name}</TableCell>
                    <TableCell>{r.department}</TableCell>
                    <TableCell>
                      <Chip label={r.courses_assigned} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{r.course_names.join(', ') || '—'}</Typography>
                    </TableCell>
                    <TableCell>{r.total_students}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  )
}

// ── Attendance Report Tab ───────────────────────────────────────────────────
function AttendanceReport() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(null)

  const load = () => {
    setLoading(true); setError('')
    api.get('/reports/attendance')
      .then(({ data }) => setData(data))
      .catch(() => setError('Failed to load attendance report'))
      .finally(() => setLoading(false))
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={600}>Attendance Report (Per Course)</Typography>
        <Button size="small" startIcon={<RefreshIcon />} variant="outlined" onClick={load}>
          {loading ? 'Loading…' : 'Generate Report'}
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box textAlign="center" py={4}><CircularProgress /></Box>}
      {data && data.report.map((course, ci) => (
        <Paper key={ci} variant="outlined" sx={{ mb: 2 }}>
          <Box
            px={2} py={1.5} display="flex" alignItems="center" justifyContent="space-between"
            sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            onClick={() => setExpanded(expanded === ci ? null : ci)}
          >
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {course.course_code} — {course.course_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Teacher: {course.teacher} · {course.enrolled_students} students
              </Typography>
            </Box>
            <Typography variant="caption" color="primary.main">
              {expanded === ci ? '▲ collapse' : '▼ expand'}
            </Typography>
          </Box>
          {expanded === ci && (
            <>
              <Divider />
              <TableContainer>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      {['Student ID','Name','Total','Present','Absent','%','Status'].map(h => (
                        <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {course.students.map((s, si) => (
                      <TableRow key={si} hover>
                        <TableCell>{s.student_id}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell>{s.total_classes}</TableCell>
                        <TableCell>{s.present}</TableCell>
                        <TableCell>{s.absent}</TableCell>
                        <TableCell>{s.percentage}%</TableCell>
                        <TableCell>
                          <Chip label={s.status} size="small"
                            color={s.status === 'OK' ? 'success' : 'warning'} variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Paper>
      ))}
    </Box>
  )
}

// ── Grade Report Tab ────────────────────────────────────────────────────────
function GradeReport() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true); setError('')
    api.get('/reports/grades')
      .then(({ data }) => setData(data))
      .catch(() => setError('Failed to load grade report'))
      .finally(() => setLoading(false))
  }

  const gradeKeys = ['A+','A','A-','B+','B','B-','C+','C','C-','D','F']

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={600}>Grade Distribution Report</Typography>
        <Button size="small" startIcon={<RefreshIcon />} variant="outlined" onClick={load}>
          {loading ? 'Loading…' : 'Generate Report'}
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box textAlign="center" py={4}><CircularProgress /></Box>}
      {data && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem' }}>Course</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem' }}>Teacher</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem' }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem' }}>Avg GPA</TableCell>
                {gradeKeys.map(g => (
                  <TableCell key={g} sx={{ fontWeight: 600, fontSize: '0.75rem', textAlign: 'center' }}>{g}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.report.map((r, i) => (
                <TableRow key={i} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{r.course_code}</Typography>
                    <Typography variant="caption" color="text.secondary">{r.course_name}</Typography>
                  </TableCell>
                  <TableCell>{r.teacher}</TableCell>
                  <TableCell>{r.total_graded}</TableCell>
                  <TableCell>
                    <Chip label={r.average_gpa} size="small"
                      color={r.average_gpa >= 3 ? 'success' : r.average_gpa >= 2 ? 'warning' : 'error'}
                      variant="outlined" />
                  </TableCell>
                  {gradeKeys.map(g => (
                    <TableCell key={g} sx={{ textAlign: 'center' }}>
                      {r.grade_distribution[g] > 0
                        ? <Chip label={r.grade_distribution[g]} size="small"
                            color={g.startsWith('A') ? 'success' : g === 'F' ? 'error' : 'default'}
                            variant="filled" sx={{ height: 18, fontSize: '0.7rem' }} />
                        : <Typography variant="caption" color="text.disabled">0</Typography>
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}

// ── Security Report Tab ─────────────────────────────────────────────────────
function SecurityReport() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true); setError('')
    api.get('/reports/security')
      .then(({ data }) => setData(data))
      .catch(() => setError('Failed to load security report'))
      .finally(() => setLoading(false))
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight={600}>Security Summary Report</Typography>
        <Button size="small" startIcon={<RefreshIcon />} variant="outlined" onClick={load}>
          {loading ? 'Loading…' : 'Generate Report'}
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <Box textAlign="center" py={4}><CircularProgress /></Box>}
      {data && (
        <Box>
          {/* Summary cards */}
          <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(160px, 1fr))" gap={1.5} mb={3}>
            {[
              { label: 'Total Users', val: data.summary.total_users, color: 'primary' },
              { label: 'Active Users', val: data.summary.active_users, color: 'success' },
              { label: 'Locked Accounts', val: data.summary.locked_accounts, color: 'error' },
              { label: 'Failed Logins', val: data.summary.total_failed_logins, color: 'warning' },
              { label: 'Successful Logins', val: data.summary.total_successful_logins, color: 'success' },
              { label: 'Account Locks', val: data.summary.total_account_locks, color: 'error' }
            ].map((s, i) => (
              <Paper key={i} variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={700} color={`${s.color}.main`}>{s.val}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </Paper>
            ))}
          </Box>

          {/* Integrity */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>Data Integrity Status</Typography>
            <Box display="flex" gap={2}>
              <Chip label={`✓ VALID: ${data.integrity.VALID || 0}`} color="success" variant="outlined" />
              <Chip label={`⚠ TAMPERED: ${data.integrity.TAMPERED || 0}`} color="error" variant="outlined" />
              <Chip label={`? UNVERIFIED: ${data.integrity.UNVERIFIED || 0}`} color="default" variant="outlined" />
            </Box>
          </Paper>

          {/* Recent events */}
          <Typography variant="subtitle2" fontWeight={600} mb={1}>Recent Security Events</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  {['Timestamp','User','Action','IP Address','Status'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: '0.78rem' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.recent_events.map((e, i) => (
                  <TableRow key={i} hover>
                    <TableCell>
                      <Typography variant="caption">{new Date(e.timestamp).toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell>{e.username || '—'}</TableCell>
                    <TableCell>
                      <Chip label={e.action} size="small"
                        color={e.action.includes('FAIL') || e.action.includes('LOCK') ? 'error' : 'default'}
                        variant="outlined" sx={{ fontSize: '0.7rem' }} />
                    </TableCell>
                    <TableCell><Typography variant="caption">{e.ip_address}</Typography></TableCell>
                    <TableCell>
                      <Chip label={e.status} size="small"
                        color={e.status === 'SUCCESS' ? 'success' : 'error'} variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  )
}

// ── Main Reports Page ───────────────────────────────────────────────────────
export default function AdminReports() {
  const [tab, setTab] = useState(0)

  const tabs = [
    { label: 'Students', icon: <SchoolIcon fontSize="small" /> },
    { label: 'Teachers', icon: <PeopleIcon fontSize="small" /> },
    { label: 'Attendance', icon: <CheckBoxIcon fontSize="small" /> },
    { label: 'Grades', icon: <GradeIcon fontSize="small" /> },
    { label: 'Security', icon: <SecurityIcon fontSize="small" /> }
  ]

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <AssessmentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5">Reports</Typography>
          <Typography variant="body2" color="text.secondary">
            Generate academic and security reports
          </Typography>
        </Box>
      </Box>

      <Paper variant="outlined">
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', px: 1 }}
        >
          {tabs.map((t, i) => (
            <Tab key={i} label={t.label} icon={t.icon} iconPosition="start"
              sx={{ fontSize: '0.8rem', minHeight: 48 }} />
          ))}
        </Tabs>

        <Box px={3} py={2}>
          <TabPanel value={tab} index={0}><StudentReport /></TabPanel>
          <TabPanel value={tab} index={1}><TeacherReport /></TabPanel>
          <TabPanel value={tab} index={2}><AttendanceReport /></TabPanel>
          <TabPanel value={tab} index={3}><GradeReport /></TabPanel>
          <TabPanel value={tab} index={4}><SecurityReport /></TabPanel>
        </Box>
      </Paper>
    </Box>
  )
}
