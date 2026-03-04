'use client'

import React, { useEffect, useRef } from 'react'
import { Mic } from 'lucide-react'
import { Messages } from '@/type'

interface TranscriptProps {
    messages: Messages[]
    currentMessage: string
    currentUserMessage: string
    currentMessages?: Messages[]
}

const Transcript = ({ messages, currentMessage, currentUserMessage, currentMessages = [] }: TranscriptProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, currentMessage, currentUserMessage, currentMessages])

    const isEmpty = messages.length === 0 && !currentMessage && !currentUserMessage && currentMessages.length === 0

    return (
        <div className="vapi-transcript-wrapper">
            <div className="transcript-container">
                {isEmpty ? (
                    // Empty state
                    <div className="transcript-empty">
                        <Mic size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <p className="transcript-empty-text">No conversation yet</p>
                        <p className="transcript-empty-hint">
                            Click the mic button above to start talking
                        </p>
                    </div>
                ) : (
                    // Messages list
                    <div className="transcript-messages w-full max-h-[600px] overflow-y-auto flex flex-col gap-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`transcript-message ${
                                    msg.role === 'user'
                                        ? 'transcript-message-user'
                                        : 'transcript-message-assistant'
                                }`}
                            >
                                <div
                                    className={`transcript-bubble ${
                                        msg.role === 'user'
                                            ? 'transcript-bubble-user'
                                            : 'transcript-bubble-assistant'
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Streaming assistant segments (multiple partials can come in) */}
                        {currentMessages.length > 0 && currentMessages.map((seg, i) => (
                            <div key={`stream-${i}`} className="transcript-message transcript-message-assistant">
                                <div className="transcript-bubble transcript-bubble-assistant">
                                    {seg.content}
                                    {i === currentMessages.length - 1 && <span className="transcript-cursor">|</span>}
                                </div>
                            </div>
                        ))}

                        {/* Currently streaming assistant message (legacy single-message support) */}
                        {currentMessage && (
                            <div className="transcript-message transcript-message-assistant">
                                <div className="transcript-bubble transcript-bubble-assistant">
                                    {currentMessage}
                                    <span className="transcript-cursor">|</span>
                                </div>
                            </div>
                        )}

                        {/* Currently streaming user message */}
                        {currentUserMessage && (
                            <div className="transcript-message transcript-message-user">
                                <div className="transcript-bubble transcript-bubble-user">
                                    {currentUserMessage}
                                    <span className="transcript-cursor">|</span>
                                </div>
                            </div>
                        )}

                        {/* Auto-scroll anchor */}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Transcript
