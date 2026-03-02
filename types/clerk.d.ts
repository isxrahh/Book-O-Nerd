// Ambient declaration to help TypeScript resolve @clerk/nextjs imports in this workspace
declare module "@clerk/nextjs" {
    // Minimal, permissive types for the runtime-provided components
    export const ClerkProvider: any;
    export const SignedIn: any;
    export const SignedOut: any;
    export const SignInButton: any;
    export const SignUpButton: any;
    export const UserButton: any;
    export const Protect: any;
    export const useUser: any;
    export const useAuth: any;
    const _default: any;
    export default _default;
}

declare module "@clerk/nextjs/server" {
    export function clerkMiddleware(...args: any[]): any;

    export function getAuth(...args: any[]): any;

    export function auth(...args: any[]): any;

    const _default: any;
    export default _default;
}

