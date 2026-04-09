import {Router} from "express";
import { addAddresses, deleteAddresses, getAddresses, updateAddresses } from "../controllers/addressController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

/**
 * @desc Get Address
 * @route GET /api/addresses
 * @access Private
 */
router.get("/",protect, getAddresses );

/**
 * @desc Add Address
 * @route POST /api/addresses
 * @access Private
 */
router.post("/",protect, addAddresses );

/**
 * @desc Update Address
 * @route PUT /api/addresses/:id
 * @access Private
 */
router.put("/:id",protect, updateAddresses );

/**
 * @desc Delete Address
 * @route DELETE /api/addresses
 * @access Private
 */
router.delete("/:id",protect, deleteAddresses );

export default router;