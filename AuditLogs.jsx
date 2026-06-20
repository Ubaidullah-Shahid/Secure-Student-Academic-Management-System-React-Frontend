import React, { useEffect, useState } from 'react'
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, TextField, Pagination, Alert } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { adminAPI } from '../../services/api'

const statusColor = { SUCCESS: 'success', FAILED: 'error', BLOCKED: 'warning', LOCKED: 'error' }
const actionColor = {
  LOGIN_SUCCESS: '#2e7d32', LOGIN_FAILED: '#c62828', ACCOUNT_LOCKED: '#c62828',
  LOGOUT: '#37474f', STUDENT_CREATED: '#1565c0', STUDENT_DELETED: '#e65100',
  TEACHER_CREATED: '#1565c0', PASSWORD_CHANGED: '#6a1b9a', PASSWORD_RESET: '#6a1b9a'
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const load = (p = 1) => {
    adminAPI.getAuditLogs({ page: p, per_page: 30 }).then(r => {
      setLogs(r.data.logs); setTotal(r.data.total); setPages(r.data.pages)
    })
  }
  useEffect(() => load(page), [page])

  const filtered = logs.filter(l =>
    `${l.action} ${l.username} ${l.ip_address} ${l.resource}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={1}>Audit Logs</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Complete trail of all system events • Total: {total} records</Typography>
      <TextField fullWidth placeholder="Filter logs..." value={search} onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} sx={{ mb: 2 }} />
      <Paper>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#0d1b3e' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>ID</TableCell>
              <TableCell sx={{ color: '#fff' }}>Action</TableCell>
              <TableCell sx={{ color: '#fff' }}>User</TableCell>
              <TableCell sx={{ color: '#fff' }}>Resource</TableCell>
              <TableCell sx={{ color: '#fff' }}>IP Address</TableCell>
              <TableCell sx={{ color: '#fff' }}>Status</TableCell>
              <TableCell sx={{ color: '#fff' }}>Details</TableCell>
              <TableCell sx={{ color: '#fff' }}>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(log => (
              <TableRow key={log.id} hover>
                <TableCell><Typography variant="caption" color="text.secondary">#{log.id}</Typography></TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} sx={{ color: actionColor[log.action] || '#333', fontSize: '0.78rem' }}>
                    {log.action}
                  </Typography>
                </TableCell>
                <TableCell>{log.username || '-'}</TableCell>
                <TableCell>
                  {log.resource ? <Chip label={`${log.resource}${log.resource_id ? ' #' + log.resource_id : ''}`} size="small" variant="outlined" /> : '-'}
                </TableCell>
                <TableCell><Typography variant="caption" fontFamily="monospace">{log.ip_address || '-'}</Typography></TableCell>
                <TableCell><Chip label={log.status} color={statusColor[log.status] || 'default'} size="small" /></TableCell>
                <TableCell><Typography variant="caption" sx={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details || '-'}</Typography></TableCell>
                <TableCell><Typography variant="caption">{new Date(log.timestamp).toLocaleString()}</Typography></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination count={pages} page={page} onChange={(_, p) => { setPage(p); load(p) }} color="primary" />
      </Box>
    </Box>
  )
}
