import dotenv from "dotenv";
dotenv.config();

import express, { Express } from "express";

const initApp = (): Promise<Express> => {
  return new Promise((resolve) => {
    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.get("/", (_req, res) => {
      res.send("Server is up ✅");
    });

    app.get("/health", (_req, res) => {
      res.status(200).send("OK");
    });

    resolve(app);
  });
};

export default initApp;
