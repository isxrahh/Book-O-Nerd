'use client'

import React from 'react'
import Image from 'next/image'           // ← added
import {Mic, MicOff} from "lucide-react"   // ← fixed: added MicOff
import {useVapi} from "@/hooks/useVapi"
import {IBook} from "@/type"
import Transcript from "@/components/Transcript"

const VapiControls = ({book}: { book: IBook }) => {
    const {
        status,
        messages,
        currentMessage,
        currentUserMessage,
        start,
        stop
    } = useVapi(book)

    const isActive = status === 'listening' || status === 'thinking' || status === 'speaking' || status === 'connecting'

    return (
        <>
            <div className="vapi-header-card">
                {/* Left: Book Cover with Mic Button */}
                <div className="relative">
                    <div className="relative w-[120px] h-[180px] flex-shrink-0">
                        {book.coverURL && (
                            <Image
                                src={book.coverURL}
                                alt={book.title}
                                fill
                                className="object-cover rounded-lg shadow-lg"
                            />
                        )}
                    </div>

                    {/* Mic Button - Overlapping bottom-right corner */}
                    <button
                        onClick={isActive ? stop : start}
                        disabled={status === 'connecting'}
                        className={`vapi-mic-btn shadow-md !w-[60px] !h-[60px] z-10 ${isActive ? 'vapi-mic-btn-active' : 'vapi-mic-btn-inactive'}`}
                    >
                        {isActive ? (
                            <Mic className="size-7 text-white"/>
                        ) : (
                            <MicOff className="size-7 text-[#212a3b]"/>
                        )}
                    </button>
                </div>

                {/* Right: Book Info */}
                <div className="flex-1">
                    <h1 className="book-title">{book.title}</h1>
                    <p className="book-subtitle">by {book.author}</p>

                    {/* Status Badges Row */}
                    <div className="vapi-status-indicator">
                        {/* Ready Badge */}
                        <div className="vapi-status-badge">
                            <span className="vapi-status-dot"></span>
                            <span className="vapi-status-text">Ready</span>
                        </div>

                        {/* Voice Badge */}
                        <div className="vapi-status-badge">
                            <span className="vapi-status-text">
                                Voice: {book.persona || 'Default'}
                            </span>
                        </div>

                        {/* Timer Badge */}
                        <div className="vapi-status-badge">
                            <span className="vapi-status-text">0:00/15:00</span>
                        </div>
                    </div>
                </div>
            </div>

            <Transcript
                messages={messages}
                currentMessage={currentMessage}
                currentUserMessage={currentUserMessage}
            />
        </>
    )
}

export default VapiControls