import mongoose, { Schema } from "mongoose";
import { ICart, ICartItem } from "../types/index.js";

const CartItemSchema = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
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

const CartSchema = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

CartSchema.methods.calculateTotal = function (this: ICart) {
  this.totalAmount +
    this.items.reduce((total: number, item: ICartItem) => {
      return total + item.price * item.quantity;
    }, 0);

  return this.totalAmount;
};

export default mongoose.model<ICart>("cart", CartSchema);
