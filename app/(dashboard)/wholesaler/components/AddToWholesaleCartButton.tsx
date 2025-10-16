'use client';
import { Button } from "@/components/ui/button";
import { useWholesaleCartStore } from "@/lib/wholesaleCartStore";
import { Product } from "@prisma/client";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";

export default function AddToWholesaleCartButton({ product }: { product: Product }) {
    const { addToCart, items } = useWholesaleCartStore();
    
    const handleAddToCart = () => {
        const existingItem = items.find(item => item.id === product.id);
        
        if (!existingItem) {
            // If the item is not in the cart, add the minimum quantity for the first time.
            addToCart({ ...product, quantity: product.minWholesaleOrderQuantity });
            toast.success(`${product.name} (x${product.minWholesaleOrderQuantity}) added to cart!`);
        } else {
            // If it's already in the cart, just add one more.
            addToCart(product);
            toast.success(`+1 ${product.name} added to cart!`);
        }
    };

    return (
        <Button onClick={handleAddToCart} size="sm" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Add to Cart</span>
        </Button>
    );
}