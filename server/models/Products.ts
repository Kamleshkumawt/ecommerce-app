import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    images: [{
        type: String,
    }],
    sizes: [{
        type: String,
    }],
    category: {
        type: String,
        required: true,
        enum: ["Men", "Women", "Kids", "Shoes", "Bags", "Other"],
        default: "Other"
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    isFeatured: {
        type: Boolean,
        default: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    } 
}, { timestamps: true });

productSchema.index({ name: "text", description: "text" });

export default mongoose.model("product", productSchema);