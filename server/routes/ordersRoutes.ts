import {Router} from "express";
import { authorize, protect } from "../middleware/auth.js";
import { createOrder, getAllOrders, getOrder, getOrders, updateOrderStatus } from "../controllers/ordersController.js";

const router = Router();

router.get("/", protect, getOrders)

router.get("/:id", protect, getOrder)

router.post("/", protect, createOrder)

router.put("/:id/status", protect, authorize("admin"), updateOrderStatus);

router.get("/", protect, authorize("admin"), getAllOrders);

export default router