import express from 'express'
import { protect } from '../middlewares/authMiddleware.js'
import { createBudget, deleteBudget, getBudgetbyId, getMyBudget, updateBudget } from '../controllers/budgetControllers.js'
export const router = express.Router()


router.route('/').post(protect, createBudget).get(protect, getMyBudget)
// router.route('/:id').get(protect, getMyBudget)
router.route('/:id').get(protect, getBudgetbyId).post(protect, updateBudget).delete(protect, deleteBudget)

// 650420b705896b54eaa5c94d
