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
