import {Router} from "express";
import { protect } from "../middleware/auth.js";
import { addToCart, clearCart, getCart, removeCartItem, updateCartItem } from "../controllers/cartController.js";

const router = Router();

/**
 * @desc Get all products
 * @route GET /api/products
 * @access Private
 */
router.get("/",protect, getCart );

/**
 * @desc add to Cart
 * @route POST /api/products
 * @access Private
 */

router.post("/add",protect, addToCart);

/**
 * @dsc Update cart item quantity
 * @route PUT /api/products
 * @access Private
 */

router.put("/item/:productId",protect,updateCartItem);

/**
 * @desc Remove cart item
 * @route DELETE /api/products
 * @access Private
 */

router.delete("/item/:productId",protect,removeCartItem);

/**
 * @desc Delete cart
 * @route DELETE /api/products
 * @access Private
 */

router.delete("/",protect,clearCart);

export default router;