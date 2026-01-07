import express from "express";
import { getDashboardStats } from "../controller/dashboardController";

const router = express.Router();

router.get("/stats", getDashboardStats);

export default router;

