'use server'

import React from 'react'
import {redirect} from 'next/navigation'
import {auth} from '@clerk/nextjs/server'
import Image from 'next/image'
import {ArrowLeft, Mic} from 'lucide-react'
import {getBookBySlug} from '@/lib/actions/book.action'
import BookDetailsClient from '@/components/BookDetailsClient'

const BookDetailsPage = async ({params}: { params: Promise<{ slug: string }> }) => {
    // Require authentication
    const {userId} = await auth()
    if (!userId) {
        redirect('/sign-in')
    }

    const {slug} = await params

    // Fetch book from database
    const result = await getBookBySlug({slug, clerkId: userId})

    // Redirect to home if book not found
    if (!result.success || !result.data) {
        redirect('/')
    }

    const book = result.data

    return (
        <BookDetailsClient book={book}/>
    )
}

export default BookDetailsPage


