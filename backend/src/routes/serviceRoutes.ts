import express from "express";
import { createService, getServices } from "../controller/serviceController";

const router = express.Router();

router.post("/", createService);  
router.get("/", getServices);    

export default router;