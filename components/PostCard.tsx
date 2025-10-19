'use client';
import { Post } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

export default function PostCard({ post }: { post: Post }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      {/* FIX: The link now uses post.slug */}
      <Link href={`/blog/${post.slug}`} className="block group h-full">
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
          <div className="relative w-full h-56">
            <Image
              src={post.featuredImageUrl}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-bold font-serif text-brand-dark group-hover:text-brand-green transition-colors">{post.title}</h3>
            <p className="text-sm text-gray-500 mt-2">
              {format(new Date(post.createdAt), 'dd MMMM, yyyy')}
            </p>
            <p className="mt-4 text-gray-600 flex-grow">{post.excerpt}</p>
            <div className="mt-4">
                <Button variant="link" className="p-0 h-auto text-brand-green font-semibold">Read More &rarr;</Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}