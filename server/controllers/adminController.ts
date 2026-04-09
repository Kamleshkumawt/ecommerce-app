import { Request, Response } from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Products from "../models/Products.js";


/**
 * @desc Get dashboard stats
 * @route GET /api/admin/stats
 * @access Private
 */
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Products.countDocuments();

        const validOrders = await Order.find({ orderStatus: {$ne: "cancelled"} });
        const totalRevenue = validOrders.reduce((total, order) => total + order.totalAmount, 0);
        const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email");

        res.status(200).json({ success: true, data:{totalUsers, totalOrders, totalProducts, totalRevenue, recentOrders} });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
}
