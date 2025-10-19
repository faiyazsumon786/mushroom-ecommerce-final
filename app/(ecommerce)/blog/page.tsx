import prisma from '@/lib/prisma';
import PostCard from '@/components/PostCard';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

async function getPublishedPosts() {
    return prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
    });
}

export default async function BlogListPage() {
    const posts = await getPublishedPosts();
    const featuredPost = posts[0];
    const otherPosts = posts.slice(1);

    return (
        <div className="bg-gray-50 py-16">
            <div className="container mx-auto px-6">
                {/* Featured Post Banner */}
                {featuredPost && (
                    <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <Link href={`/blog/${featuredPost.slug}`} className="block relative w-full h-96 rounded-xl overflow-hidden shadow-lg">
                            <Image src={featuredPost.featuredImageUrl} alt={featuredPost.title} fill className="object-cover" />
                        </Link>
                        <div>
                            <p className="text-sm text-brand-green font-semibold">Latest Post</p>
                            <h1 className="font-serif text-4xl font-bold text-brand-dark mt-2 leading-tight">
                                <Link href={`/blog/${featuredPost.slug}`} className="hover:text-brand-green transition-colors">{featuredPost.title}</Link>
                            </h1>
                            <p className="mt-4 text-gray-600">{featuredPost.excerpt}</p>
                        </div>
                    </div>
                )}
                
                {/* Other Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {otherPosts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            </div>
        </div>
    );
}