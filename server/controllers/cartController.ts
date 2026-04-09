import { Request, Response } from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Products.js";

/**
 * @desc get Cart
 * @route GET /api/cart
 * @access Private
 */
export const getCart = async (req: Request, res: Response) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate("items.product","name images price stock");

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        res.status(200).json({ success: true, data: cart });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Add item to cart
 * @route POST /api/cart/add
 * @access Private
 */
export const addToCart = async (req: Request, res: Response) => {
    try {
        const {productId, quantity = 1, size} = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (product.stock < quantity) {
            return res.status(400).json({ success: false, message: "Product stock is not enough" });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }

        // Find item with same product and size

        const existingItem = cart.items.find((item)=>{
            return item.product.toString() === productId && item.size === size;
        })

        if(existingItem){
            existingItem.quantity += quantity;
            existingItem.price = product.price;
        }else {
            cart.items.push({ 
                product: productId,
                quantity,
                price: product.price,
                size
            })
        }

        cart.calculateTotal();
        await cart.save();

        await cart.populate("items.product", "name images price stock");

        res.status(200).json({ success: true, data: cart });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Update cart
 * @route PUT /api/cart/update
 * @access Private
 */

export const updateCartItem = async (req: Request, res: Response) => {
    try {
        const {quantity, size} = req.body;
        const {productId} = req.params;

        const cart = await Cart.findOne({user: req.user._id});

        if(!cart){
            return res.status(404).json({success: false, message: "Cart not found"});
        }

        const item = cart.items.find((item)=> item.product.toString() === productId && item.size === size);

        if(!item){
            return res.status(404).json({success: false, message: "Item not found"});
        }

        if(quantity <= 0){
            cart.items = cart.items.filter((item)=> item.product.toString() !== productId);
        } else {
            const product = await Product.findById(productId);
            if(product!.stock < quantity){
                return res.status(400).json({success: false, message: "Product stock is not enough"});
            }
            item.quantity = quantity;
        }

        cart.calculateTotal();
        await cart.save();
        await cart.populate("items.product","name images price stock");
        res.status(200).json({success: true, data: cart});
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Remove item from cart
 * @route DELETE /api/cart/delete
 * @access Private
*/

export const removeCartItem = async (req: Request, res: Response) => {
    try {
        const {size} = req.query;
        const cart = await Cart.findOne({user: req.user._id});

        if(!cart || !size){
            return res.status(404).json({success: false, message: "Cart not found"});
        }

        cart.items = cart.items.filter((item)=> item.product.toString()  !== req.params.productId || item.size !== size);
        cart.calculateTotal();
        await cart.save();
        await cart.populate("items.product","name images price stock");
        res.status(200).json({ success: true, data: cart });      
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Delete cart
 * @route DELETE /api/cart/delete
 * @access Private
*/

export const clearCart = async (req: Request, res: Response) => {
    try {
        const cart = await Cart.findOne({user: req.user._id});

        if(cart){
           cart.items = [];
           cart.totalAmount = 0;
           await cart.save(); 
        }

        res.status(200).json({ success: true, message: "Cart cleared" });    
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};