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
