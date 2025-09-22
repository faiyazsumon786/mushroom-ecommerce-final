'use client';
import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const promise = fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        toast.promise(promise, {
            loading: 'Sending message...',
            success: (res) => {
                if (!res.ok) throw new Error('Message failed to send.');
                (e.target as HTMLFormElement).reset();
                return 'Message sent successfully! We will get back to you soon.';
            },
            error: 'Could not send message.'
        });
        promise.finally(() => setIsLoading(false));
    };

    return (
        <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 min-h-screen py-16">
            <div className="container mx-auto px-6">
                <motion.div 
                    className="text-center"
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-5xl font-extrabold text-emerald-700 drop-shadow-lg">Get In Touch</h1>
                    <p className="mt-4 text-lg text-gray-600">Have questions? We love to hear from you.</p>
                </motion.div>
                
                <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    
                    {/* Left Side */}
                    <motion.div 
                        className="space-y-8"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Card className="shadow-xl rounded-2xl border-0 bg-white/80 backdrop-blur-md">
                            <CardHeader>
                                <CardTitle className="text-emerald-700">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 text-gray-700">
                                <div className="flex items-start gap-4">
                                    <MapPin className="h-6 w-6 text-emerald-500 mt-1" />
                                    <div>
                                        <h3 className="font-semibold">Our Address</h3>
                                        <p>Uttara : Sector-10,Road-13,House-29,Flat-B3 Zamzam Mushroom Food, Dhaka, Bangladesh</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Mail className="h-6 w-6 text-emerald-500 mt-1" />
                                    <div>
                                        <h3 className="font-semibold">Email Us</h3>
                                        <p>zamzammushroom893@gmail.com</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Phone className="h-6 w-6 text-emerald-500 mt-1" />
                                    <div>
                                        <h3 className="font-semibold">Call Us</h3>
                                        <p>+880 1642-619491</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Map */}
                        <motion.div 
                            className="rounded-2xl overflow-hidden shadow-2xl border border-emerald-100"
                            whileHover={{ scale: 1.02 }}
                        >
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.1918603902764!2d90.388303774796!3d23.882814383680994!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c50074f72dbf%3A0x7921163cd4b090b9!2sZamzam%20mushroom%20food!5e0!3m2!1sen!2sbd!4v1758102648340!5m2!1sen!2sbd" 
                                width="100%" 
                                height="350" 
                                style={{ border: 0 }} 
                                allowFullScreen={false} 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade">
                            </iframe>
                            
                        </motion.div>
                    </motion.div>

                    {/* Right Side */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <Card className="shadow-2xl rounded-2xl border-0 bg-white/90 backdrop-blur-md hover:shadow-emerald-200 transition">
                            <CardHeader>
                                <CardTitle className="text-emerald-700">Send Us a Message</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" name="name" type="text" placeholder="Your Name" required className="focus:ring-emerald-400" />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" name="email" type="email" placeholder="you@example.com" required className="focus:ring-emerald-400" />
                                    </div>
                                    <div>
                                        <Label htmlFor="subject">Subject (Optional)</Label>
                                        <Input id="subject" name="subject" type="text" placeholder="Question about a product" className="focus:ring-emerald-400" />
                                    </div>
                                    <div>
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea id="message" name="message" required rows={5} placeholder="Your message here..." className="focus:ring-emerald-400" />
                                    </div>
                                    <Button 
                                        type="submit" 
                                        disabled={isLoading} 
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 transition rounded-xl shadow-md hover:shadow-lg"
                                    >
                                        {isLoading ? 'Sending...' : 'Send Message'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
