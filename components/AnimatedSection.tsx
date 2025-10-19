'use client';

import { motion } from 'framer-motion';
import React from 'react';

// This is a reusable client component for scroll animations
export default function AnimatedSection({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <motion.section
            className={className}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            {children}
        </motion.section>
    );
}