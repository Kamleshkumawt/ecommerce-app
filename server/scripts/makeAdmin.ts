import { clerkClient } from "@clerk/express";
import userModel from "../models/User.js";

const makeAdmin = async ()=> {
    try {
        const email = process.env.ADMIN_EMAIL!;
        const user = await userModel.findOne({ email, role: "admin" });
        if(user) {
           await clerkClient.users.updateUserMetadata(user.clerkId as string, {publicMetadata: {role: "admin"}});
        }
    } catch (err: any) {
        console.error("Admin promotion failed", err.message);
    }
}

export default makeAdmin;