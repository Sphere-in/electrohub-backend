import { db } from "../../lib/db.js";
import { z } from "zod";
import cloudinary, { uploadToCloudinary } from "../../lib/cloudinary.js";
// Delete seller account
async function deleteAccount(req, res) {
    const { id } = req.params;
    const sellerId = parseInt(id, 10);
    if (!sellerId || isNaN(sellerId)) {
        res.status(400).json({ error: "Invalid or missing seller id" });
        return;
    }
    try {
        const seller = await db.seller.findUnique({
            where: {
                id: sellerId,
            },
        });
        if (!seller) {
            res.status(404).json({ error: "Seller not found" });
            return;
        }
        const deletedseller = await db.seller.delete({
            where: {
                id: sellerId,
            },
        });
        res.clearCookie("token", { httpOnly: true, secure: true });
        res.status(200).json({
            message: `Seller account of ${deletedseller.name} deleted successfully`,
            seller: deletedseller,
        });
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_DELETING_ACCOUNT", error.message);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
// Get details of a specific seller
async function getSellerDetails(req, res) {
    const { id } = req.params;
    const sellerId = parseInt(id, 10);
    if (isNaN(sellerId)) {
        res.status(400).json({ error: "Invalid or missing sellerId" });
        return;
    }
    try {
        const seller = await db.seller.findUnique({
            where: {
                id: sellerId,
            },
        });
        if (!seller) {
            res.status(404).json({ error: "seller not found" });
            return;
        }
        const { password: _, ...safeSellerData } = seller;
        res.status(200).json({ seller: safeSellerData });
        return;
    }
    catch (error) {
        console.log("ERROR_WHILE_GETTING_SELLER_DETAILS", error.message);
        res
            .status(500)
            .json({ error: "Internal Server Error", details: error.message });
        return;
    }
}
const sellerSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    address: z.string().min(1, "Address is required").optional(),
    phone: z.string().min(10, "Phone must be at least 10 digits").optional(),
    answer: z.string().min(1, "Address is required").optional(),
});
const extractPublicId = (url) => {
    const parts = url.split("/");
    const publicIdwithExtension = parts[parts.length - 1];
    return publicIdwithExtension.split(".")[0];
};
// Update seller details
async function updateSellerDetails(req, res) {
    const { id } = req.params;
    const sellerId = parseInt(id, 10);
    if (isNaN(sellerId)) {
        res.status(400).json({ error: "Invalid or missing sellerId" });
        return;
    }
    try {
        const sellerData = await sellerSchema.parse(req.body);
        const seller = await db.seller.findUnique({
            where: {
                id: sellerId,
            },
        });
        if (!seller) {
            res.status(404).json({ error: "seller not found " });
            return;
        }
        const image = req.file;
        if (image) {
            if (seller.pfp) {
                const imagePublicId = extractPublicId(seller.pfp);
                await cloudinary.uploader.destroy(imagePublicId);
            }
            const imageUrl = await uploadToCloudinary(image.buffer, process.env.SELLER_PFP_FOLDER);
            Object.assign(sellerData, { pfp: imageUrl });
        }
        const updatedseller = await db.seller.update({
            where: {
                id: sellerId,
            },
            data: { ...sellerData },
        });
        const { password: _, ...safesellerData } = updatedseller;
        res.status(200).json({ seller: safesellerData });
        return;
    }
    catch (error) {
        console.error("ERROR_WHILE_UPDATING_SELLER", error);
        if (error.name === "ZodError") {
            res.status(400).json({ errors: error.errors });
            return;
        }
        res
            .status(500)
            .json({ error: "Internal server error", details: error.message });
    }
}
export { deleteAccount, getSellerDetails, updateSellerDetails };
