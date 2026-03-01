'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingOverlayProps {
    isLoading: boolean
    message?: string
}

const LoadingOverlay = ({ isLoading, message = 'Processing your book...' }: LoadingOverlayProps) => {
    if (!isLoading) return null

    return (
        <div className="loading-wrapper">
            <div className="loading-shadow-wrapper bg-white">
                <div className="loading-shadow">
                    <Loader2 className="loading-animation w-12 h-12 text-[#663820]" />
                    <h2 className="loading-title">{message}</h2>
                    <div className="loading-progress">
                        <div className="loading-progress-item">
                            <div className="loading-progress-status"></div>
                            <span className="text-[var(--text-secondary)]">Uploading files...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoadingOverlay

