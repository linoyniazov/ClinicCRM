import express from "express";
import {createPatient, getPatientById, getPatients, updatePatient, getPatientHistory, getPatientImages, uploadPatientImage} from "../controller/patientController";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

router.post("/", createPatient);
router.get("/", getPatients);
router.patch("/:id", updatePatient);
router.get("/:id", getPatientById);
router.get("/:id/history", getPatientHistory);
router.get("/:id/images", getPatientImages);
router.post("/:id/images", upload.single('image'), uploadPatientImage);


export default router;
