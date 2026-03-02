import React from 'react'
import Link from "next/link";
import Image from "next/image";

const hero_items = [
    {
        id: 1,
        feature: 'Upload Your Book',
        description: 'Easily upload your book & let the AI do the rest.'
    },
    {
        id: 2,
        feature: 'AI Processing',
        description: 'Our AI analyzes your book to create an interactive experience.'
    },
    {
        id: 3,
        feature: 'Start Chatting',
        description: 'Engage in dynamic conversations with AI about your book’s content.'
    }
]

const HeroSection = () => {
    return (
        <section>
            <div className="wrapper md:mb-16 mb-10">
                <div className="library-hero-card">
                    <div className="library-hero-content">
                        <div className="library-hero-text">
                            <h1 className="library-hero-title">Your library</h1>
                            <p className="library-hero-description">
                                Convert your books into interactive AI conversations.
                                <br className="hidden md:block"/> Upload your book, and let the AI be your guide to
                                explore its content in a whole new way.
                            </p>
                            <Link href="/books/new" className="library-cta-primary mt-4">
                                <span className="text-2xl mr-2">+</span>
                                Add Your Book
                            </Link>
                        </div>
                        <div className="library-hero-illustration-desktop">
                            <Image src="/assets/hero-illustration.png" alt="Vintage books and a globe" width={400}
                                   height={400} className="object-contain"/>

                        </div>
                        <div className="library-hero-illustration">
                            <Image src="/assets/hero-illustration.png" alt="Vintage books and a globe" width={300}
                                   height={300} className="object-contain"/>

                        </div>
                        <div className="library-steps-card min-w-[260px] max-w-[280px] z-10 shadow-soft">
                            <ul className="space-y-6">
                                {hero_items.map((item, index) => (
                                    <li key={index} className="library-step-item">
                                        <div
                                            className="w-10 h-10 min-w-10 min-h-10 rounded-full border border-gray-300 flex items-center justify-center font-medium text-lg">
                                            {index + 1}
                                        </div>
                                        <div className="flex flex-col justify-between">
                                            <h3 className="library-step-title text-lg font-bold">{item.feature}</h3>
                                            <p className="library-step-description pt-2 text-gray-500">{item.description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
export default HeroSection
