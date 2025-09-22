import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PlusCircle, Edit } from 'lucide-react';
import { format } from 'date-fns';

async function getPosts() {
    return prisma.post.findMany({
        include: { author: true },
        orderBy: { createdAt: 'desc' }
    });
}

export default async function BlogManagementPage() {
    const posts = await getPosts();

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-bold">Blog Management</h1>
                <Link href="/admin/blog/new">
                    <Button className="flex items-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        Create New Post
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader><CardTitle>All Blog Posts</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map(post => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-semibold">{post.title}</TableCell>
                                    <TableCell>{post.author.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                                            {post.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{format(new Date(post.createdAt), 'dd MMM, yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/admin/blog/${post.id}`}>
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}