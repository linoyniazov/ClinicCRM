import express from "express";
import { createAppointment, getAppointments, updateAppointmentStatus, deleteAppointment } from "../controller/appointmentsController";

const router = express.Router();

router.post("/", createAppointment);      
router.get("/", getAppointments);          
router.patch("/:id/status", updateAppointmentStatus);
router.delete("/:id", deleteAppointment);

export default router;