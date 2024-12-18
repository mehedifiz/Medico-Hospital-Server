import express from 'express'

import { registerUser ,loginUser, getProfile, updateProfile , bookAppointment, listAppointments, cencelAppoinments} from '../controllers/userController.js'
import authUser from '../middleware/AuthUser.js'

const userRouter = express.Router() 

userRouter.post('/register' , registerUser)  
userRouter.post('/login' , loginUser)  
userRouter.get('/get-profile', authUser , getProfile)  
userRouter.post('/update-profie', authUser , updateProfile)  
userRouter.post('/book-appointment' , authUser , bookAppointment)
userRouter.get('/appointments' , authUser , listAppointments)
userRouter.post('/cencel-appointment' , authUser , cencelAppoinments)

export default userRouter