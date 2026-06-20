import React, { useState, useEffect } from 'react'
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
  InputAdornment, IconButton, LinearProgress, Chip, Divider
} from '@mui/material'
import SecurityIcon from '@mui/icons-material/Security'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import LockIcon from '@mui/icons-material/Lock'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [locked, setLocked] = useState(false)
  const [remaining, setRemaining] = useState(0)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!locked || remaining <= 0) return
    const timer = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { setLocked(false); clearInterval(timer); return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [locked, remaining])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (locked) return
    setLoading(true)
    setError('')
    try {
      const user = await login(form)
      navigate(`/${user.role}/dashboard`)
    } catch (err) {
      const data = err.response?.data
      setError(data?.error || 'Login failed')
      if (data?.locked) {
        setLocked(true)
        setRemaining(data.remaining || 60)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0d1b3e 0%, #1565c0 50%, #0d47a1 100%)',
      p: 2
    }}>
      <Card sx={{ width: '100%', maxWidth: 440, borderRadius: 3, overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        <Box sx={{ background: 'linear-gradient(135deg, #1565c0, #0d47a1)', p: 4, textAlign: 'center' }}>
          <SecurityIcon sx={{ fontSize: 56, color: '#fff', mb: 1 }} />
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>SAMS</Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            Secure Academic Management System
          </Typography>
        </Box>
        <CardContent sx={{ p: 4 }}>
          {locked && (
            <Alert severity="error" icon={<LockIcon />} sx={{ mb: 2 }}>
              Account locked. Try again in <strong>{remaining}s</strong>
            </Alert>
          )}
          {error && !locked && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Username" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              sx={{ mb: 2 }} required disabled={locked}
              InputProps={{ startAdornment: <InputAdornment position="start">@</InputAdornment> }}
            />
            <TextField
              fullWidth label="Password" type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              sx={{ mb: 3 }} required disabled={locked}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(!showPass)}>
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button fullWidth variant="contained" type="submit" disabled={loading || locked}
              sx={{ py: 1.5, fontSize: '1rem', background: 'linear-gradient(135deg, #1565c0, #0d47a1)' }}>
              {loading ? 'Authenticating...' : 'Secure Login'}
            </Button>
          </form>
          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" color="text.secondary" display="block" align="center" mb={1}>
            Default Credentials
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip size="small" label="admin / Admin@1234" variant="outlined" color="error" />
            <Chip size="small" label="teacher1 / Teacher@1234" variant="outlined" color="primary" />
            <Chip size="small" label="student1 / Student@1234" variant="outlined" color="success" />
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
