import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema({
        user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
                required: true,
        },
        products: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
            },
        ],
    });
    
    export default mongoose.model("wishlist", WishlistSchema);