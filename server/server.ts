import http from "http";
import "dotenv/config.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import makeAdmin from "./scripts/makeAdmin.js";
import { seedProducts } from "./scripts/seedProducts.js";

const port = process.env.PORT || 8000;

const server = http.createServer(app);

await makeAdmin();

// await seedProducts(process.env.MONGO_URI as string);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(port, () => {
      console.log("Server started successfully", {
        port: port,
        environment: process.env.NODE_ENV || "development",
        healthCheck: `http://localhost:${port}/health`,
        apiBase: `http://localhost:${port}/api/auth`,
      });
    });
  } catch (error) {
    console.log(error);
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();