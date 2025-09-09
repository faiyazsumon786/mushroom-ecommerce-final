// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth'; // নতুন ফাইল থেকে ইম্পোর্ট করা হচ্ছে

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };