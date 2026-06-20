// frontend/src/App.jsx  (REPLACE existing file)
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminStudents from './pages/admin/Students'
import AdminTeachers from './pages/admin/Teachers'
import AdminDepartments from './pages/admin/Departments'
import AdminCourses from './pages/admin/Courses'
import AdminUsers from './pages/admin/Users'
import AdminAuditLogs from './pages/admin/AuditLogs'
import AdminSecurity from './pages/admin/SecurityCenter'
import AdminReports from './pages/admin/Reports'
import AdminNotifications from './pages/admin/Notifications'
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherAttendance from './pages/teacher/Attendance'
import TeacherGrades from './pages/teacher/Grades'
import TeacherAssignments from './pages/teacher/Assignments'
import TeacherAnnouncements from './pages/teacher/Announcements'
import StudentDashboard from './pages/student/Dashboard'
import StudentProfile from './pages/student/Profile'
import StudentGrades from './pages/student/Grades'
import StudentAttendance from './pages/student/Attendance'
import StudentAssignments from './pages/student/Assignments'
import StudentNotifications from './pages/student/Notifications'
import { CircularProgress, Box } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: { main: '#1565c0', dark: '#0d47a1', light: '#5e92f3' },
    secondary: { main: '#00796b', dark: '#004c40', light: '#48a999' },
    error: { main: '#c62828' },
    warning: { main: '#e65100' },
    success: { main: '#2e7d32' },
    background: { default: '#f0f2f5', paper: '#ffffff' }
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 }
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } },
    MuiCard: { styleOverrides: { root: { boxShadow: '0 2px 12px rgba(0,0,0,0.08)' } } }
  }
})

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}/dashboard`} replace />
  return children
}

const AppRoutes = () => {
  const { user, loading } = useAuth()
  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />} />
      <Route path="/" element={<Navigate to={user ? `/${user.role}/dashboard` : '/login'} replace />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="teachers" element={<AdminTeachers />} />
        <Route path="departments" element={<AdminDepartments />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="security" element={<AdminSecurity />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="notifications" element={<AdminNotifications />} />
      </Route>

      {/* Teacher */}
      <Route path="/teacher" element={<ProtectedRoute roles={['teacher', 'admin']}><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<TeacherDashboard />} />
        <Route path="attendance" element={<TeacherAttendance />} />
        <Route path="grades" element={<TeacherGrades />} />
        <Route path="assignments" element={<TeacherAssignments />} />
        <Route path="announcements" element={<TeacherAnnouncements />} />
      </Route>

      {/* Student */}
      <Route path="/student" element={<ProtectedRoute roles={['student', 'admin']}><Layout /></ProtectedRoute>}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="grades" element={<StudentGrades />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="assignments" element={<StudentAssignments />} />
        <Route path="notifications" element={<StudentNotifications />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
