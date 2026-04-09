import { Request, Response } from "express";
import Products from "../models/Products.js";
import cloudinary from "../config/cloudinary.js";

//**
// * @desc Get all products
// * @route GET /api/products
// * @access Public
//  */
export const getProducts = async (req: Request, res: Response) => {
    try {
        const {page = 1, limit = 10} = req.query;
        const query: any = {isActive: true};

        const total = await Products.countDocuments(query);
        const products = await Products.find(query).skip((Number(page)-1)*Number(limit)).limit(Number(limit));

        res.json({success: true, data: products, pagination: {total, page: Number(page), pages:Math.ceil(total/Number(limit))}});
    } catch (err:any) {
        res.status(500).json({success: false, message: err.message});
    }
};

//**
// * @desc Get single product
// * @route GET /api/products/:id
// * @access Public
//  */

export const getProduct = async (req: Request, res: Response) => {
    try {
        const product = await Products.findById(req.params.id);
        if(!product) {
            return res.status(404).json({success: false, message: "Product not found"});
        }
        res.json({success: true, data: product});
    } catch (err:any) {
        res.status(500).json({success: false, message: err.message});
    }
};

// **
// * @desc Create product
// * @route POST /api/products
// * @access Private
//  */
export const createProduct = async (req: Request, res: Response) => {
    try {
        let images: string[] = [];

        if(req.body.existingImages){
            if(Array.isArray(req.body.existingImages)){
                images = [...req.body.existingImages]
            }
        }

        // Handle file uploads
        if(req.files && (req.files as any ).length > 0){
            const uploadPromises = (req.files as any).map((file: any)=>{
                return new Promise((resolve, reject)=>{
                    const uploadStream = cloudinary.uploader.upload_stream({folder: 'ecom-app/products'}, (error, result)=>{
                        if(error){
                            reject(error);
                        }else{
                            resolve(result!.secure_url);
                        }
                    })
                    uploadStream.end(file.buffer);
                })
            })
            images = await Promise.all(uploadPromises);
        }

        let sizes = req.body.sizes || [];
        if(typeof sizes === "string"){
            try {
                sizes = JSON.parse(sizes);
            } catch (error) {
                sizes = sizes.split(",").map((s:string)=>s.trim()).filter((s:string)=>s !== "");
            }
        }

        // Ensure they are arrays 
        if(!Array.isArray(sizes)) sizes = [sizes];

        const productData = {
            ...req.body,
            images: images,
            sizes
        }

        if(images.length === 0){
            return res.status(400).json({success: false, message: "Product must have at least one image"});
        }

        const product = await Products.create(productData);

        res.status(201).json({success: true, data: product});

    } catch (err:any) {
        res.status(500).json({success: false, message: err.message});
    }
};

//**
// * @desc Update product
// * @route PUT /api/products/:id
// * @access Private
//  */

export const updateProduct = async (req: Request, res: Response) => {
    try {
        let images: string[] = [];

        // Handle file uploads
        if(req.files && (req.files as any ).length > 0){
            const uploadPromises = (req.files as any).map((file: any)=>{
                return new Promise((resolve, reject)=>{
                    const uploadStream = cloudinary.uploader.upload_stream({folder: 'ecom-app/products'}, (error, result)=>{
                        if(error){
                            reject(error);
                        }else{
                            resolve(result!.secure_url);
                        }
                    })
                    uploadStream.end(file.buffer);
                })
            })
            const newImages = await Promise.all(uploadPromises);
            images = [...images, ...newImages];
        }

        const updates = {...req.body};

        if(req.body.sizes) {
            let sizes = req.body.sizes;
            if(typeof sizes === "string"){
                try {
                    sizes = JSON.parse(sizes);
                } catch (error) {
                    sizes = sizes.split(",").map((s:string)=>s.trim()).filter((s:string)=>s !== "");
                }
            }
            
            if(!Array.isArray(sizes)) sizes = [sizes];
            updates.sizes = sizes;
        }

        if(req.body.existingImages || (req.files && (req.files as any ).length > 0)){
            updates.images = images;
        }

        delete updates.existingImages;

        const product = await Products.findByIdAndUpdate(req.params.id, updates,{
            new: true,
            runValidators: true
        })

        if (!product) {
            return res.status(404).json({ success:false, message: "Product not found" });
        }

        res.json({success: true, data: product});

    } catch (err:any) {
        res.status(500).json({success: false, message: err.message});
    }
};


//**
// * @desc Delete product
// * @route DELETE /api/products/:id
// * @access Private
//  */

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const product = await Products.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success:false, message: "Product not found" });
        }
        //Delete images from cloudinary

        if(product.images && product.images.length > 0){
            const deletePromises = product.images.map((imageUrl)=>{
                const publicIdMatch = imageUrl.match(/\/v\d+\/(.+)\.[a-z]+$/);
                const publicId = publicIdMatch ? publicIdMatch[1] : null;
                if(publicId){
                    return cloudinary.uploader.destroy(publicId);
                }
                return Promise.resolve();
            })
            await Promise.all(deletePromises);
        }

        await Products.findByIdAndDelete(req.params.id);


        res.json({success: true, message: "Product deleted"});
    } catch (err:any) {
        res.status(500).json({success: false, message: err.message});
    }
};