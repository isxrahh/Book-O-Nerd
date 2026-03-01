import type {Metadata} from "next";
import {Geist, Geist_Mono, IBM_Plex_Serif, Mona_Sans} from "next/font/google";

import "./globals.css";
import React from "react";

import Navbar from "@/components/Navbar";
import {ClerkProvider} from "@clerk/nextjs";


const ibmPlexSerif = IBM_Plex_Serif({
    variable: "--font-ibm-plex-serif",
    subsets: ["latin"],
    weight: ['400', '500', '600', '700'],
    display: 'swap'
})

const monaSans = Mona_Sans({
    variable: "--font-mona-sans",
    subsets: ["latin"],
    display: 'swap'
})

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Book O Nerd",
    description: "Transform your reading experience with Book O Nerd - the ultimate book recommendation app. Discover personalized book suggestions, track your reading progress, and connect with fellow book lovers. Dive into a world of literary adventures and find your next great read today! Upload PDFs, and chat with your books using VOICE.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
            <body
                className={`${ibmPlexSerif.variable} ${monaSans.variable} relative font-sans antialiased`}
            >
            <Navbar/>
            {children}
            </body>
            </html>
        </ClerkProvider>
    );
}
