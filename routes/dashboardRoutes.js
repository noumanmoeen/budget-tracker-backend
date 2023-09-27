import express from 'express'
import { protect } from '../middlewares/authMiddleware.js'
import { getAccountDetails } from '../controllers/dashboardControllers.js'
export const router = express.Router()


router.route('/account-details').get(protect, getAccountDetails)
