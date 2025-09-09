// src/app/(dashboard)/supplier/shipments/create/page.tsx
'use client';

import { SupplierProduct } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ShipmentItem {
  supplierProductId: string;
  productName: string;
  quantity: number;
  unit: string;
  wholesalePrice: number;
}

export default function CreateShipmentPage() {
  const [myProducts, setMyProducts] = useState<SupplierProduct[]>([]);
  const [shipmentItems, setShipmentItems] = useState<ShipmentItem[]>([]);
  
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchMyProducts = async () => {
      const res = await fetch('/api/supplier-products'); 
      if (res.ok) {
        const data = await res.json();
        setMyProducts(data);
      }
    };
    fetchMyProducts();
  }, []);

  const handleAddItem = () => {
    const selectedProduct = myProducts.find(p => p.id === selectedProductId);
    if (selectedProduct && quantity > 0 && unit) {
      if (shipmentItems.some(item => item.supplierProductId === selectedProduct.id)) {
        alert(`${selectedProduct.name} is already in the shipment list.`);
        return;
      }
      const newItem: ShipmentItem = {
        supplierProductId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        unit,
        wholesalePrice: selectedProduct.wholesalePrice,
      };
      setShipmentItems([...shipmentItems, newItem]);
      setSelectedProductId('');
      setQuantity(1);
      setUnit('');
    }
  };

  const handleSubmitShipment = async () => {
    if (shipmentItems.length === 0) {
      alert('Please add at least one item.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: shipmentItems }),
      });
      if (response.ok) {
        alert('Shipment created successfully!');
        router.push('/supplier/shipments');
      } else {
        alert('Failed to create shipment.');
      }
    } catch (error) {
      alert('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    const product = myProducts.find(p => p.id === selectedProductId);
    if (product) {
      setUnit(product.unit);
    }
  }, [selectedProductId, myProducts]);

  return (
    <div className="space-y-8 bg-gray-900 min-h-screen p-6 text-gray-200">
      <h1 className="text-4xl font-extrabold text-center mb-8">Create New Shipment</h1>
      
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Add Product to Shipment</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Product</label>
            <select 
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full p-2.5 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a product from your catalog</option>
              {myProducts.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full p-2.5 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <input 
              type="text" 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)}
              className="w-full p-2.5 border border-gray-600 rounded-lg bg-gray-700 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
        </div>
        <button 
          onClick={handleAddItem} 
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition"
        >
          Add Item
        </button>
      </div>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-white">Shipment Items</h2>
        <ul className="divide-y divide-gray-700">
          {shipmentItems.map((item, index) => (
            <li key={index} className="py-2 flex justify-between">
              <span>{item.productName} - <strong>{item.quantity} {item.unit}</strong></span>
              <span>${(item.wholesalePrice * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        {shipmentItems.length > 0 && (
          <div className="mt-6 border-t border-gray-700 pt-4">
            <button 
              onClick={handleSubmitShipment} 
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold disabled:opacity-50 transition"
            >
              {isLoading ? 'Submitting...' : 'Submit Final Shipment'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}