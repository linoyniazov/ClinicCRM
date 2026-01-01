import express from "express";
import {createPatient, getPatientById, getPatients, updatePatient} from "../controller/patientController";

const router = express.Router();

router.post("/", createPatient);
router.get("/", getPatients);
router.patch("/:id", updatePatient);
router.get("/:id", getPatientById);



export default router;
