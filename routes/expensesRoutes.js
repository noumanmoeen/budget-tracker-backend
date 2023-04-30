import express from 'express'
import { protect } from '../middlewares/authMiddleware.js'
 import { createExpense, deleteExpense, getBudgetExpenses, getExpenseById, updateExpense } from '../controllers/expensesControllers.js'
export const router = express.Router()


router.route('/').post(protect, createExpense)
 router.route('/:id').get(protect, getExpenseById).post(protect, updateExpense).delete(protect, deleteExpense)
router.route('/:budgetId').get(protect, getBudgetExpenses)
