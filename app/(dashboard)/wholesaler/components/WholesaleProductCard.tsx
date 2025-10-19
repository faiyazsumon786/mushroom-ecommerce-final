import { Product } from "@prisma/client";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatCurrency";
import Image from "next/image";
import AddToWholesaleCartButton from "./AddToWholesaleCartButton";

export default function WholesaleProductCard({ product }: { product: Product }) {
    return (
        <Card className="overflow-hidden h-full flex flex-col">
            <div className="relative w-full h-56 bg-gray-100">
                <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    className="object-contain p-4"
                />
            </div>
            <CardContent className="p-4 flex flex-col flex-grow">
                <CardTitle className="text-lg h-12">{product.name}</CardTitle>
                <p className="text-sm text-gray-500 flex-grow mt-1">{product.shortDescription}</p>
                <div className="mt-4 flex justify-between items-center">
                    <div>
                        <p className="text-xl font-bold text-primary">{formatCurrency(product.wholesalePrice)}</p>
                        <p className="text-xs text-gray-500 font-semibold">Min. Order: {product.minWholesaleOrderQuantity} units</p>
                    </div>
                    <AddToWholesaleCartButton product={product} />
                </div>
            </CardContent>
        </Card>
    );
}