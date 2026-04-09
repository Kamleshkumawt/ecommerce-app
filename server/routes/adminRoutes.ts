import { Router } from "express";
import { authorize, protect } from "../middleware/auth.js";
import { getDashboardStats } from "../controllers/adminController.js";

const router = Router();

router.get("/stats", protect, authorize("admin"), getDashboardStats);

export default router;