import express from "express";
import {createPatient, getPatients } from "../controller/patientController";

const router = express.Router();

router.post("/", createPatient);
router.get("/", getPatients);

export default router;
