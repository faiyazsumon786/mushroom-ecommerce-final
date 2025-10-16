// src/components/FlyingCartAnimation.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface FlyingItem {
  id: string;
  src: string;
  startX: number;
  startY: number;
}

export default function FlyingCartAnimation() {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [cartPosition, setCartPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // কার্ট আইকনের অবস্থান খুঁজে বের করা হচ্ছে
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
      const rect = cartIcon.getBoundingClientRect();
      setCartPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }

    // "addToCartAnimation" নামে একটি কাস্টম ইভেন্ট শোনার জন্য
    const handleAddToCart = (event: CustomEvent) => {
      const { src, startX, startY } = event.detail;
      const newItem: FlyingItem = {
        id: `item-${Date.now()}`,
        src,
        startX,
        startY,
      };
      setFlyingItems((prev) => [...prev, newItem]);

      // কিছুক্ষণ পর অ্যানিমেটেড আইটেমটি সরিয়ে ফেলা হচ্ছে
      setTimeout(() => {
        setFlyingItems((prev) => prev.filter((item) => item.id !== newItem.id));
      }, 1000); // অ্যানিমেশনটি ১ সেকেন্ড স্থায়ী হবে
    };

    window.addEventListener('addToCartAnimation', handleAddToCart as EventListener);

    return () => {
      window.removeEventListener('addToCartAnimation', handleAddToCart as EventListener);
    };
  }, []);

  return (
    <AnimatePresence>
      {flyingItems.map((item) => (
        <motion.div
          key={item.id}
          initial={{
            opacity: 1,
            x: item.startX,
            y: item.startY,
            scale: 1,
          }}
          animate={{
            opacity: 0,
            x: cartPosition.x,
            y: cartPosition.y,
            scale: 0.1,
            rotate: 180,
          }}
          transition={{
            duration: 1,
            ease: [0.2, 0.8, 0.4, 1], // একটি সুন্দর easing effect
          }}
          className="fixed top-0 left-0 z-[100] pointer-events-none"
        >
          <div className="relative w-20 h-20">
            <Image
              src={item.src}
              alt="Flying product"
              fill
              className="object-contain rounded-md"
            />
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}