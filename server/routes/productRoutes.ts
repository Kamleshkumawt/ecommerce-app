import {Router} from "express";
import { createProduct, getProduct, getProducts, updateProduct } from "../controllers/productController.js";
import upload from "../middleware/upload.js";
import { authorize, protect } from "../middleware/auth.js";

const router = Router();


/**
 * @desc Get all products
 * @route GET /api/products
 * @access Public
 */
router.get("/", getProducts);

/**
 * @desc Get single product
 * @route GET /api/products/:id
 * @access Public
 */
router.get("/:id", getProduct);

/**
 * @desc add new product(Admin Only)
 * @route POST /api/products
 * @access Private
 */

router.post("/",upload.array("images", 5), protect,authorize("admin"), createProduct);

/**
 * @desc Update product(Admin Only)
 * @route PUT /api/products/:id
 * @access Private
 */

router.put("/:id",upload.array("images", 5),protect,authorize("admin"),updateProduct);

/**
 * @desc Delete product(Admin Only)
 * @route DELETE /api/products/:id
 * @access Private
 */

router.delete("/:id",protect,authorize("admin"),updateProduct);

export default router;