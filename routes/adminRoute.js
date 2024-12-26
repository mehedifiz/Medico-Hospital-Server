import express from "express";
import {
  addDoctors,
  adminDashboard,
  allDoctors,
  appointmentsAdmin,
  cencelAppoinments,
  loginAdmin,
} from "../controllers/adminController.js";
import upload from "../middleware/multer.js";
import authAdmin from "../middleware/Authadmin.js";
import { changeAvailablity } from "../controllers/doctorController.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctors);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availablity", authAdmin, changeAvailablity);
adminRouter.get('/appointments' , authAdmin ,appointmentsAdmin)
adminRouter.post('/cencel-appoinment' , authAdmin ,cencelAppoinments)
adminRouter.get('/dashboard' , authAdmin ,adminDashboard)

export default adminRouter;
