import express from "express";
import {createPatient, getPatientById, getPatients, updatePatient, getPatientHistory, getPatientImages} from "../controller/patientController";

const router = express.Router();

router.post("/", createPatient);
router.get("/", getPatients);
router.patch("/:id", updatePatient);
router.get("/:id", getPatientById);
router.get("/:id/history", getPatientHistory);
router.get("/:id/images", getPatientImages);


export default router;
