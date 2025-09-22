import prisma from '@/lib/prisma';
import Image from 'next/image';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { formatCurrency } from '@/lib/formatCurrency'; // Assuming you might use it in the future

async function getPostBySlug(slug: string) {
    return prisma.post.findUnique({
        where: { slug, status: 'PUBLISHED' },
        include: { author: true }
    });
}

async function getRelatedPosts(currentPostId: string) {
    return prisma.post.findMany({
        where: { status: 'PUBLISHED', id: { not: currentPostId } },
        take: 3,
        orderBy: { createdAt: 'desc' }
    });
}

// FIX: Using 'any' to solve the params warning
export default async function SinglePostPage({ params }: any) {
    const post = await getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = await getRelatedPosts(post.id);

    return (
        <div className="bg-white py-12">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Blog Content */}
                    <article className="lg:col-span-2">
                        <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-dark leading-tight">
                            {post.title}
                        </h1>
                        <div className="text-gray-500 mt-4 flex items-center space-x-4">
                            <span>By {post.author.name}</span>
                            <span className="text-gray-300">&bull;</span>
                            <span>{format(new Date(post.createdAt), 'dd MMMM, yyyy')}</span>
                        </div>
                        
                        <div className="relative w-full h-96 my-8 rounded-xl overflow-hidden shadow-lg">
                            <Image 
                                src={post.featuredImageUrl} 
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        <div 
                            className="prose lg:prose-xl max-w-none text-gray-800"
                            dangerouslySetInnerHTML={{ __html: post.content }} 
                        />
                    </article>

                    {/* Sidebar with Related Posts */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24">
                            <h3 className="font-serif text-2xl font-bold mb-6 text-brand-dark">Related Posts</h3>
                            <div className="space-y-8">
                                {relatedPosts.map(relatedPost => (
                                    <PostCard key={relatedPost.id} post={relatedPost} />
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}