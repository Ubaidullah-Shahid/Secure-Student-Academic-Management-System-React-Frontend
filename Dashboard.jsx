import React, { useEffect, useState } from 'react'
import { Box, Typography, Grid, Card, CardContent, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material'
import ClassIcon from '@mui/icons-material/Class'
import PeopleIcon from '@mui/icons-material/People'
import { teacherAPI } from '../../services/api'

export default function TeacherDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => { teacherAPI.dashboard().then(r => setData(r.data)) }, [])
  if (!data) return null

  const { teacher, stats, courses } = data

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={1}>Welcome, {teacher?.full_name}</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>{teacher?.specialization} • {teacher?.department_name}</Typography>

      <Grid container spacing={2} mb={4}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">My Courses</Typography>
                  <Typography variant="h4" fontWeight={700} color="primary.main">{stats.total_courses}</Typography>
                </Box>
                <ClassIcon sx={{ fontSize: 40, color: '#1565c0', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Students</Typography>
                  <Typography variant="h4" fontWeight={700} color="secondary.main">{stats.total_students}</Typography>
                </Box>
                <PeopleIcon sx={{ fontSize: 40, color: '#00796b', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={600} mb={2}>My Courses</Typography>
      <Paper>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Code</TableCell><TableCell>Name</TableCell><TableCell>Department</TableCell>
              <TableCell>Semester</TableCell><TableCell>Enrolled</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map(c => (
              <TableRow key={c.id} hover>
                <TableCell><Chip label={c.code} size="small" color="secondary" /></TableCell>
                <TableCell><Typography fontWeight={500}>{c.name}</Typography></TableCell>
                <TableCell>{c.department_name || '-'}</TableCell>
                <TableCell>{c.semester || '-'}</TableCell>
                <TableCell><Chip label={c.enrollment_count} size="small" variant="outlined" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}
