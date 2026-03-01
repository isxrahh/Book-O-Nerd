import React from 'react'
import {Button} from "@/components/ui/button";
import HeroSection from "@/components/HeroSection";
import {sampleBooks} from "@/lib/constants";
import BookCard from "@/components/BookCard";

const Page = () => {
    return (
        <main className="wrapper container">
            <HeroSection/>
            <div className="library-books-grid">
                {sampleBooks.map((book) => (
                    <BookCard key={book._id} title={book.title} coverURL={book.coverURL} author={book.author} slug={book.slug}/>
                ))}
            </div>
        </main>
    )
}
export default Page
