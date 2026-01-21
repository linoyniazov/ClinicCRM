import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Express } from "express";
import path from "path";
import pool from "./db";
import patientRoutes from "./routes/patientRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import appointmentsRoutes from "./routes/appointmentsRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import authRoutes from "./routes/authRoutes";
import { authenticateToken } from './middleware/authMiddleware';


const initApp = (): Promise<Express> => {
  return new Promise(async (resolve, reject) => {
    try {
      const app = express();
      app.use(cors());
      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));
      
      app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.use('/api/dashboard', authenticateToken, dashboardRoutes);
  app.use('/api/patients', authenticateToken, patientRoutes);
  app.use('/api/appointments', authenticateToken, appointmentsRoutes);
  app.use('/api/services', authenticateToken, serviceRoutes);
  app.use('/api/auth', authRoutes);

      await pool.query("SELECT 1");
      console.log("PostgreSQL connected successfully");

  app.get("/", (_req, res) => {
      res.send("Server is up ✅");
    });

      app.get("/health", async (_req, res) => {
        try {
          await pool.query("SELECT 1");
          res.status(200).send("OK");
        } catch {
          res.status(500).send("DB not ready");
        }
      });

      resolve(app);
    } catch (err) {
      reject(err);
    }
  });
};

export default initApp;
