import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const generateToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Check password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-{}[\]|:;"'<>,./])[^\s]{10,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: 'Password must be at least 10 characters with uppercase, lowercase, number, and special character' 
      })
    }

    // Check for existing username
    const existingUsername = await User.findOne({ username })
    if (existingUsername) {
      return res.status(400).json({ message: 'Username unavailable. Please choose another.' })
    }

    // Check for existing email
    const existingEmail = await User.findOne({ email })
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered. Please use another.' })
    }

    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' })
    let userRole = 'user'

    if (!adminExists && role === 'admin') {
      userRole = 'admin'
    } else if (adminExists && role === 'admin') {
      return res.status(400).json({ message: 'Admin already exists' })
    }

    const user = await User.create({ username, email, password, role: userRole })

    const token = generateToken(user)
    const userResponse = user.toObject()
    delete userResponse.password

    res.status(201).json({ 
      token, 
      user: userResponse,
      message: 'Registration successful'
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ message: err.message || 'Registration failed' })
  }
}

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Email/Username and password required' })
    }

    // Find user by email or username
    const user = await User.findOne({ 
      $or: [{ email: identifier }, { username: identifier }] 
    }).select('+password')

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user)
    const userResponse = user.toObject()
    delete userResponse.password

    res.json({ 
      token, 
      user: userResponse,
      message: 'Login successful'
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ message: err.message || 'Login failed' })
  }
}

export const checkAdminExists = async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' })
    res.json({ adminExists: !!adminExists })
  } catch (err) {
    console.error('Check admin error:', err)
    res.status(500).json({ message: err.message })
  }
}

export const verify = async (req, res) => {
  try {
    res.json({ user: req.user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const logout = (req, res) => {
  res.json({ message: 'Logout successful' })
}
