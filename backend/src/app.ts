import initApp from "./server";

const port = process.env.PORT || 3000;

initApp()
  .then((app) => {
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
