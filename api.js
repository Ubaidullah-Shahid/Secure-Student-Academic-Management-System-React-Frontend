// frontend/src/services/api.js  (REPLACE existing file)
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post('/api/auth/refresh', {}, {
            headers: { Authorization: `Bearer ${refresh}` }
          })
          localStorage.setItem('access_token', data.access_token)
          if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
          original.headers.Authorization = `Bearer ${data.access_token}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
  refresh: (token) => api.post('/auth/refresh', {}, { headers: { Authorization: `Bearer ${token}` } })
}

export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  resetPassword: (id, data) => api.post(`/admin/users/${id}/reset-password`, data),
  unlockUser: (id) => api.post(`/admin/users/${id}/unlock`),
  getStudents: () => api.get('/admin/students'),
  createStudent: (data) => api.post('/admin/students', data),
  updateStudent: (id, data) => api.put(`/admin/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/admin/students/${id}`),
  getTeachers: () => api.get('/admin/teachers'),
  createTeacher: (data) => api.post('/admin/teachers', data),
  updateTeacher: (id, data) => api.put(`/admin/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/admin/teachers/${id}`),
  getDepartments: () => api.get('/admin/departments'),
  createDepartment: (data) => api.post('/admin/departments', data),
  updateDepartment: (id, data) => api.put(`/admin/departments/${id}`, data),
  deleteDepartment: (id) => api.delete(`/admin/departments/${id}`),
  getCourses: () => api.get('/admin/courses'),
  createCourse: (data) => api.post('/admin/courses', data),
  updateCourse: (id, data) => api.put(`/admin/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  enrollStudent: (courseId, data) => api.post(`/admin/courses/${courseId}/enroll`, data),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
  getLockedAccounts: () => api.get('/admin/security/locked-accounts'),
  getIntegrityReport: () => api.get('/admin/security/integrity-report'),
  getFailedLogins: () => api.get('/admin/security/failed-logins'),
  getNotifications: () => api.get('/admin/notifications'),
  sendNotification: (data) => api.post('/admin/notifications', data),
  deleteNotification: (id) => api.delete(`/admin/notifications/${id}`)
}

export const teacherAPI = {
  dashboard: () => api.get('/teacher/dashboard'),
  getCourses: () => api.get('/teacher/courses'),
  getCourseStudents: (cid) => api.get(`/teacher/courses/${cid}/students`),
  getAttendance: (params) => api.get('/teacher/attendance', { params }),
  markAttendance: (data) => api.post('/teacher/attendance', data),
  updateAttendance: (id, data) => api.put(`/teacher/attendance/${id}`, data),
  attendanceReport: (cid) => api.get(`/teacher/attendance/report/${cid}`),
  getGrades: (params) => api.get('/teacher/grades', { params }),
  addGrade: (data) => api.post('/teacher/grades', data),
  getAssignments: (params) => api.get('/teacher/assignments', { params }),
  createAssignment: (data) => api.post('/teacher/assignments', data),
  updateAssignment: (id, data) => api.put(`/teacher/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/teacher/assignments/${id}`),
  getSubmissions: (aid) => api.get(`/teacher/assignments/${aid}/submissions`),
  gradeSubmission: (sid, data) => api.put(`/teacher/submissions/${sid}/grade`, data),
  getClassPerformance: (cid) => api.get(`/reports/class-performance/${cid}`)
}

export const studentAPI = {
  dashboard: () => api.get('/student/dashboard'),
  getProfile: () => api.get('/student/profile'),
  updateProfile: (data) => api.put('/student/profile', data),
  getCourses: () => api.get('/student/courses'),
  getAttendance: (params) => api.get('/student/attendance', { params }),
  getGrades: () => api.get('/student/grades'),
  getAssignments: () => api.get('/student/assignments'),
  submitAssignment: (aid, data) => api.post(`/student/assignments/${aid}/submit`, data),
  getNotifications: () => api.get('/student/notifications'),
  markNotificationRead: (id) => api.put(`/student/notifications/${id}/read`),
  getLoginHistory: () => api.get('/student/security/login-history')
}

export const reportsAPI = {
  students: () => api.get('/reports/students'),
  teachers: () => api.get('/reports/teachers'),
  attendance: () => api.get('/reports/attendance'),
  grades: () => api.get('/reports/grades'),
  security: () => api.get('/reports/security'),
  classPerformance: (cid) => api.get(`/reports/class-performance/${cid}`)
}

export default api
