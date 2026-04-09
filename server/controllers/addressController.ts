import { Request, Response } from "express";
import Address from "../models/Address.js";

/**
 * @desc Get user address
 * @route GET /api/addresses
 * @access Private
 */

export const getAddresses = async (req: Request, res: Response) => {
    try {
        const addresses = await Address.find({ user: req.user._id }).sort({isDefault: -1, createdAt: -1 });

        res.status(200).json({ success: true, data: addresses });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};


/**
 * @desc Add New address
 * @route POST /api/addresses
 * @access Private
 */

export const addAddresses = async (req: Request, res: Response) => {
    try {
        const { type,street,city,state,country,zipCode,isDefault } = req.body;

        if(isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }

        const newAddress = await Address.create({ user: req.user._id, type,street,city,state,country,zipCode,isDefault: isDefault || "false" });

        res.status(200).json({ success: true, data: newAddress });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Updated address
 * @route PUT /api/addresses/:id
 * @access Private
 */

export const updateAddresses = async (req: Request, res: Response) => {
    try {
        const { type,street,city,state,country,zipCode,isDefault } = req.body;

        let addressItem = await Address.findById(req.params.id);

        if(!addressItem) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        //Ensure user owns address
        if(addressItem.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if(isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }

        addressItem = await Address.findByIdAndUpdate(req.params.id, {type,street,city,state,country,zipCode,isDefault},{new: true});

        res.status(200).json({ success: true, data: addressItem });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * @desc Delete address
 * @route DELETE /api/addresses/:id
 * @access Private
 */

export const deleteAddresses = async (req: Request, res: Response) => {
    try {
        const address = await Address.findById(req.params.id);

        if(!address) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        //Ensure user owns address
        if(address.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        await address.deleteOne();

        res.status(200).json({ success: true, message: "Address deleted" });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};