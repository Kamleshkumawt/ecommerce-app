import {Router} from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlistController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, getWishlist)
router.post("/", protect, addToWishlist)
router.delete("/",protect, removeFromWishlist)

export default router