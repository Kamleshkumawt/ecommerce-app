import mongoose from "mongoose";
import { IOrder } from "../types/index.js";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true,
    },
    name:{
        type: String
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    size: {
        type: String,
    },
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    orderNumber: {
      type: String,
      unique: true,  
    },
    items: [orderItemSchema],
    shippingAddress: {
       street: { type: String, required: true },
       city: { type: String, required: true },
       state: { type: String, required: true },
       zipCode: { type: String, required: true },
       country: { type: String, required: true },
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ["cash", "stripe"],
        default: "cash",
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
    },
   paymentIntentId: {
       type: String,
   },
   orderStatus: {
       type: String,
       required: true,
       enum: ["placed", "processing", "shipped", "delivered", "cancelled"],
       default: "placed",
   },
   subtotal: {
       type: Number,
       required: true,
       min: 0,
   },
   shippingCost: {
       type: Number,
       required: true,
       min: 0,
   },
   tax: {
       type: Number,
       required: true,
       min: 0,
   },
   totalAmount: {
       type: Number,
       required: true,
       min: 0,
   },
   notes: {
       type: String,
   },
   deliveredAt: Date,
},{timestamps: true});

const Order = mongoose.model<IOrder>("order", orderSchema);
export default Order;