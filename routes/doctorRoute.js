import express from "express";
import {
  appoinmentComplete,
  AppointmentCancel,
  docLogin,
  doctorDash,
  doctorList,
  getDocorAppoinments,
  doctorProfile,
  updateProfile,
} from "../controllers/doctorController.js";
import authDoctor from "../middleware/authdoc.js";

const doctorRouter = express.Router();

doctorRouter.get("/list", doctorList);

doctorRouter.post("/login", docLogin);
doctorRouter.get("/appointments", authDoctor, getDocorAppoinments);
doctorRouter.post("/complete-appointment", authDoctor, appoinmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, AppointmentCancel);
doctorRouter.get("/dashdata", authDoctor, doctorDash);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, updateProfile);

export default doctorRouter;
