import express from "express";
import { createService, getServices, updateService, deleteService } from "../controller/serviceController";

const router = express.Router();

router.post("/", createService);  
router.get("/", getServices);
router.patch("/:id", updateService);
router.delete("/:id", deleteService);

export default router;