import api from "@/constants/api";
import { Product, WishlistContextType } from "@/constants/types";
import { useAuth } from "@clerk/expo";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { getToken } = useAuth();
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await api.get("/wishlist", {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            setWishlist(data.data);
        } catch (err) {
            console.error("Failed to fetch wishlist:", err);
        } finally {
            setLoading(false);
        }
    }

    const toggleWishlist = async (product:Product) => {
        setWishlist((prev) => {
            const exists = prev.some((p) => p._id === product._id);
            if (exists) {
                return prev.filter((p) => p._id !== product._id);
            }
            return [...prev, product];
        });
    }

    const isInWishlist = (productId: string) => {
        return wishlist.some((p) => p._id === productId);
    }

    useEffect(() => {
        fetchWishlist();
    }, []);

    return (
        <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}