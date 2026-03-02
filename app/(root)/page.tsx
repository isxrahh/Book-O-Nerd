import React from 'react'
import {Button} from "@/components/ui/button";
import HeroSection from "@/components/HeroSection";
import {sampleBooks} from "@/lib/constants";
import BookCard from "@/components/BookCard";
import {getAllBooks} from "@/lib/actions/book.action";

const Page = async () => {
    const bookResults = await getAllBooks()
    const books = bookResults.success ? bookResults.data ?? [] : []

    return (
        <main className="wrapper container">
            <HeroSection/>
            <div className="library-books-grid">
                {books.map((book) => (
                    <BookCard key={book._id} title={book.title} author={book.author} coverURL={book.coverURL}
                              slug={book.slug}/>
                ))}
            </div>
        </main>
    )
}
export default Page
