import express from 'express'
import { loginUser, registerUser, fetchUser , updateUser } from '../controllers/userControllers.js'
import { protect } from '../middlewares/authMiddleware.js'
export const router = express.Router()
 

router.route('/').post(registerUser)
router.route('/login').post(loginUser)
router.route('/:id').get(protect, fetchUser).post(protect, updateUser)
