'use client';

import React from 'react';
import {Loader2} from 'lucide-react';

interface LoadingOverlayProps {
    isLoading?: boolean
}

const LoadingOverlay = ({isLoading}: LoadingOverlayProps) => {
    return (
        <div className="loading-wrapper">
            <div className="loading-shadow-wrapper bg-white shadow-soft-lg">
                <div className="loading-shadow">
                    <Loader2 className="loading-animation w-12 h-12 text-[#663820]"/>
                    <h2 className="loading-title">Synthesizing Your Book</h2>
                    <p className="text-[#777] text-center max-w-xs">
                        Please wait while we process your PDF and prepare your interactive literary experience.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoadingOverlay;