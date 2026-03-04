'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Mic, MicOff } from 'lucide-react'
import { IBook } from '@/type'
import VapiControls from "@/components/VapiControls";

interface BookDetailsClientProps {
    book: IBook
}

const BookDetailsClient = ({ book }: BookDetailsClientProps) => {
    const router = useRouter()

    return (
        <main className="book-page-container">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="back-btn-floating"
                aria-label="Go back"
            >
                <ArrowLeft size={24} />
            </button>

            {/* Header Card Section */}
            <div className="space-y-6">

                {/* Transcript Area Section */}
               <VapiControls book={book}/>
            </div>
        </main>
    )
}

export default BookDetailsClient

