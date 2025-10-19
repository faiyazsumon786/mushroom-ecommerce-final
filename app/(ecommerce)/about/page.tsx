import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="container mx-auto px-6 py-16">
            <div className="text-center">
                <h1 className="font-serif text-5xl font-bold text-brand-dark">About Zamzam Mushroom</h1>
                <p className="mt-4 text-lg text-gray-600">Freshness & Quality You Can Trust</p>
            </div>
            <div className="mt-12 grid md:grid-cols-2 gap-12 items-center">
                <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-lg">
                    <Image src="/path/to/your/about-image.jpg" alt="Our Mushroom Farm" fill className="object-cover" />
                </div>
                <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
                    <p>
                        Welcome to Zamzam Mushroom, your number one source for all things mushrooms. We are dedicated to giving you the very best of organic, fresh, and high-quality mushrooms, with a focus on dependability, customer service and uniqueness.
                    </p>
                    <p>
                        Founded in 2024, Zamzam Mushroom has come a long way from its beginnings. We now serve customers all over the country and are thrilled to be a part of the eco-friendly wing of the food industry.
                    </p>
                    <p>
                        We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please dont hesitate to contact us.
                    </p>
                </div>
            </div>
        </div>
    );
}