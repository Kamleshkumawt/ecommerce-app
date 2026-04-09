import { Request, Response } from "express";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Products from "../models/Products.js";


/**
 * @desc Get Order
 * @route GET /api/orders
 * @access Private
*/

export const getOrders = async (req: Request, res: Response) => {
    try {
        const query = {user: req.user._id};
        const orders = await Order.find(query).populate("items.product", "name images").sort({createdAt: -1});

        res.status(200).json({ success: true, data: orders });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Get Order
 * @route GET /api/orders/:id
 * @access Private
 */

export const getOrder = async (req: Request, res: Response) => {
    try {
        const order = await Order.findById(req.params.id).populate("items.product", "name images");

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }
        if(order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        res.status(200).json({ success: true, data: order });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Create Order
 * @route POST /api/orders
 * @access Private
 */

export const createOrder = async (req: Request, res: Response) => {
    try {
          const {shippingAddress, notes} = req.body;
          const cart = await Cart.findOne({user: req.user._id}).populate("items.product");
          if(!cart || cart.items.length === 0) {
            return res.status(400).json({success: false, message: "Cart is empty"});
          }

          //verify stoke and prepare order items
          const orderItems = [];
          for (const item of cart.items) {
            const product = await Products.findById(item.product._id);
            if(!product || product.stock < item.quantity) {
                return res.status(400).json({success: false, message: "Product stock is not enough"});
            }
            orderItems.push({product: item.product._id, name:(item.product as any).name, quantity: item.quantity, price: item.price,size:item.size});
            product.stock -= item.quantity;
            await product.save();
          }
          
          const subtotal = cart.totalAmount;
          const shippingCost = 0;
          const tax = 0;
          const totalAmount = subtotal + shippingCost + tax;

          const order = await Order.create({
            user:req.user._id,
            items:orderItems,
            shippingAddress,
            paymentMethod: req.body.paymentMethod || "cash",
            paymentStatus: "pending",
            subtotal,
            shippingCost,
            tax,
            totalAmount,
            notes,
            paymentIntentId: req.body.paymentIntentId,
            orderNumber: "ORD-"+ Date.now(),
          })

          if(req.body.paymentMethod !== "stripe") {
            cart.items = [];
            cart.totalAmount = 0;
            await cart.save();
          }

          res.status(200).json({success: true, data: order});
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};


/**
 * @desc Update Order status
 * @route POST /api/orders/:id/status
 * @access Private
 */


export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
          const {orderStatus, paymentStatus} = req.body;
          const order = await Order.findById(req.params.id);

          if(!order){
            return res.status(404).json({success: false, message: "Order not found"});
          }

          if(orderStatus) order.orderStatus = orderStatus;
          if(paymentStatus) order.paymentStatus = paymentStatus;
          if(orderStatus === "delivered") order.deliveredAt = Date.now();

          await order.save();
          res.status(200).json({success: true, data: order});
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};


/**
 * @desc Get all Order for admin
 * @route GET /api/orders
 * @access Private
*/

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const {page = 1, limit = 20, status } = req.query;
        const query: any = {};

        if(status) query.orderStatus = status;
        const total = await Order.countDocuments(query);
        const orders = await Order.find(query).populate("user", "name email").populate("items.product", "name").skip((Number(page)-1)*Number(limit)));
        
        res.status(200).json({ success: true, data: orders, pagination: {total, page: Number(page), pages: Math.ceil(orders.length/Number(limit))} });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};
