import api from './api'

export const authService = {
  registerUser: (data) => api.post('/auth/register', data),
  loginUser: (identifier, password) => api.post('/auth/login', { identifier, password }),
  verifyUser: () => api.get('/auth/verify'),
  checkAdminExists: () => api.get('/auth/check-admin')
}


