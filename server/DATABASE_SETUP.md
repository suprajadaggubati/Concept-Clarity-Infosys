# Concept Clarity - MongoDB Database Setup

## Folder Structure

```
server/
├── config/
│   └── db.js                    (MongoDB Connection)
├── models/
│   ├── User.js                  (User Schema)
│   ├── Chat.js                  (Chat Session Schema)
│   ├── Message.js               (Message Schema)
│   └── Feedback.js              (Feedback Schema)
├── controllers/
│   ├── userController.js        (User CRUD Operations)
│   ├── chatController.js        (Chat CRUD Operations)
│   └── feedbackController.js    (Feedback CRUD Operations)
├── routes/
│   ├── userRoutes.js            (User Endpoints)
│   ├── chatRoutes.js            (Chat Endpoints)
│   └── feedbackRoutes.js        (Feedback Endpoints)
└── package.json
```

---

## Database Configuration

### config/db.js
```javascript
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/concept-clarity'
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('MongoDB Connected')
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message)
    process.exit(1)
  }
}
```

---

## MongoDB Models/Schemas

### models/User.js
```javascript
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
)

userSchema.index({ email: 1 })
userSchema.index({ username: 1 })

export default mongoose.model('User', userSchema)
```

### models/Chat.js
```javascript
import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
)

chatSchema.index({ userId: 1 })
chatSchema.index({ createdAt: -1 })

export default mongoose.model('Chat', chatSchema)
```

### models/Message.js
```javascript
import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    sender: {
      type: String,
      enum: ['user', 'bot'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
  },
  { timestamps: true }
)

messageSchema.index({ chatId: 1 })
messageSchema.index({ createdAt: -1 })

export default mongoose.model('Message', messageSchema)
```

### models/Feedback.js
```javascript
import mongoose from 'mongoose'

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
    },
  },
  { timestamps: true }
)

feedbackSchema.index({ userId: 1 })
feedbackSchema.index({ createdAt: -1 })

export default mongoose.model('Feedback', feedbackSchema)
```

---

## CRUD Controllers

### controllers/userController.js
```javascript
import User from '../models/User.js'
import bcryptjs from 'bcryptjs'

export const userController = {
  createUser: async (req, res) => {
    try {
      const { username, email, password, role = 'user' } = req.body

      const existingUser = await User.findOne({ $or: [{ email }, { username }] })
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' })
      }

      const hashedPassword = await bcryptjs.hash(password, 10)

      const user = new User({
        username,
        email,
        password: hashedPassword,
        role,
      })

      await user.save()
      res.status(201).json({ message: 'User created successfully', userId: user._id })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  getUser: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password')
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      res.status(200).json(user)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select('-password')
      res.status(200).json(users)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  updateUser: async (req, res) => {
    try {
      const { username, email, avatar } = req.body
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { username, email, avatar },
        { new: true, runValidators: true }
      ).select('-password')

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      res.status(200).json({ message: 'User updated successfully', user })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id)
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      res.status(200).json({ message: 'User deleted successfully' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },
}
```

### controllers/chatController.js
```javascript
import Chat from '../models/Chat.js'
import Message from '../models/Message.js'

export const chatController = {
  createChat: async (req, res) => {
    try {
      const { userId, title } = req.body

      const chat = new Chat({
        userId,
        title,
      })

      await chat.save()
      res.status(201).json({ message: 'Chat created successfully', chat })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  getChat: async (req, res) => {
    try {
      const chat = await Chat.findById(req.params.id).populate('userId', '-password')
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' })
      }
      const messages = await Message.find({ chatId: chat._id }).sort({ createdAt: -1 })
      res.status(200).json({ chat, messages })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  getUserChats: async (req, res) => {
    try {
      const chats = await Chat.find({ userId: req.params.userId }).sort({ createdAt: -1 })
      res.status(200).json(chats)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  updateChat: async (req, res) => {
    try {\n      const { title } = req.body
      const chat = await Chat.findByIdAndUpdate(
        req.params.id,
        { title },
        { new: true, runValidators: true }
      )

      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' })
      }
      res.status(200).json({ message: 'Chat updated successfully', chat })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  deleteChat: async (req, res) => {
    try {
      const chat = await Chat.findByIdAndDelete(req.params.id)
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' })
      }
      await Message.deleteMany({ chatId: chat._id })
      res.status(200).json({ message: 'Chat and messages deleted successfully' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },
}
```

### controllers/feedbackController.js
```javascript
import Feedback from '../models/Feedback.js'

export const feedbackController = {
  createFeedback: async (req, res) => {
    try {
      const { userId, rating, comment, sentiment = 'neutral' } = req.body

      const feedback = new Feedback({
        userId,
        rating,
        comment,
        sentiment,
      })

      await feedback.save()
      res.status(201).json({ message: 'Feedback created successfully', feedback })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  getFeedback: async (req, res) => {
    try {
      const feedback = await Feedback.findById(req.params.id).populate('userId', '-password')
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' })
      }
      res.status(200).json(feedback)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  getAllFeedback: async (req, res) => {
    try {
      const feedback = await Feedback.find().populate('userId', '-password').sort({ createdAt: -1 })
      res.status(200).json(feedback)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  getUserFeedback: async (req, res) => {
    try {
      const feedback = await Feedback.find({ userId: req.params.userId }).sort({ createdAt: -1 })
      res.status(200).json(feedback)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  updateFeedback: async (req, res) => {
    try {
      const { rating, comment, sentiment } = req.body
      const feedback = await Feedback.findByIdAndUpdate(
        req.params.id,
        { rating, comment, sentiment },
        { new: true, runValidators: true }
      )

      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' })
      }
      res.status(200).json({ message: 'Feedback updated successfully', feedback })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },

  deleteFeedback: async (req, res) => {
    try {
      const feedback = await Feedback.findByIdAndDelete(req.params.id)
      if (!feedback) {
        return res.status(404).json({ message: 'Feedback not found' })
      }
      res.status(200).json({ message: 'Feedback deleted successfully' })
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  },
}
```

---

## Express Routes

### routes/userRoutes.js
```javascript
import express from 'express'
import { userController } from '../controllers/userController.js'

const router = express.Router()

router.post('/', userController.createUser)
router.get('/', userController.getAllUsers)
router.get('/:id', userController.getUser)
router.put('/:id', userController.updateUser)
router.delete('/:id', userController.deleteUser)

export default router
```

### routes/chatRoutes.js
```javascript
import express from 'express'
import { chatController } from '../controllers/chatController.js'

const router = express.Router()

router.post('/', chatController.createChat)
router.get('/:id', chatController.getChat)
router.get('/user/:userId', chatController.getUserChats)
router.put('/:id', chatController.updateChat)
router.delete('/:id', chatController.deleteChat)

export default router
```

### routes/feedbackRoutes.js
```javascript
import express from 'express'
import { feedbackController } from '../controllers/feedbackController.js'

const router = express.Router()

router.post('/', feedbackController.createFeedback)
router.get('/', feedbackController.getAllFeedback)
router.get('/:id', feedbackController.getFeedback)
router.get('/user/:userId', feedbackController.getUserFeedback)
router.put('/:id', feedbackController.updateFeedback)
router.delete('/:id', feedbackController.deleteFeedback)

export default router
```

---

## API Endpoints

### Users
- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Chats
- `POST /api/chats` - Create chat
- `GET /api/chats/:id` - Get chat with messages
- `GET /api/chats/user/:userId` - Get user's chats
- `PUT /api/chats/:id` - Update chat title
- `DELETE /api/chats/:id` - Delete chat and messages

### Feedback
- `POST /api/feedback` - Create feedback
- `GET /api/feedback` - Get all feedback
- `GET /api/feedback/:id` - Get feedback by ID
- `GET /api/feedback/user/:userId` - Get user's feedback
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback

---

## Integration Steps

1. Import `connectDB` in server.js:
```javascript
import { connectDB } from './config/db.js'

// Call in main app
connectDB()
```

2. Add routes to server.js:
```javascript
import userRoutes from './routes/userRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import feedbackRoutes from './routes/feedbackRoutes.js'

app.use('/api/users', userRoutes)
app.use('/api/chats', chatRoutes)
app.use('/api/feedback', feedbackRoutes)
```

3. Update .env:
```
MONGODB_URI=mongodb://localhost:27017/concept-clarity
```

4. Ensure package.json has required dependencies:
```json
{
  "dependencies": {
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3"
  }
}
```
