import { Request, Response } from "express";
import Wishlist from "../models/Wishlist.js";

/**
 * @desc Get all products
 * @route GET /api/wishlist
 * @access Private
 */
export const getWishlist = async (req: Request, res: Response) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products", "name images price stock");
        res.status(200).json({ success: true, data: wishlist });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
}

/**
 * @desc Add product to wishlist
 * @route POST /api/wishlist
 * @access Private
 */
export const addToWishlist = async (req: Request, res: Response) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            await Wishlist.create({ user: req.user._id, products: [req.body.productId] });
        } else {
            wishlist.products.push(req.body.productId);
            await wishlist.save();
        }
        res.status(200).json({ success: true, data: wishlist });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
}

/**
 * @desc Remove product from wishlist
 * @route DELETE /api/wishlist
 * @access Private
 */
export const removeFromWishlist = async (req: Request, res: Response) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            return res.status(404).json({ success: false, message: "Wishlist not found" });
        }
        wishlist.products = wishlist.products.filter((product: any) => product.toString() !== req.body.productId);
        await wishlist.save();
        res.status(200).json({ success: true, data: wishlist });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
}