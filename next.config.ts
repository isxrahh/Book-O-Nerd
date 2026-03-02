import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images:{ remotePatterns: [
    {
        protocol:'https',
        hostname:'covers.openlibrary.org'},
    {
        protocol:'https',
        hostname: "bgyrwhepnrz7ogoa.public.blob.vercel-storage.com"
    },
    ]},
   allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
};

export default nextConfig;
