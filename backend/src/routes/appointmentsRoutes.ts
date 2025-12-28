import express from "express";
import { createAppointment, getAppointments, updateAppointmentStatus } from "../controller/appointmentsController";

const router = express.Router();

router.post("/", createAppointment);      
router.get("/", getAppointments);          
router.patch("/:id/status", updateAppointmentStatus);

export default router;