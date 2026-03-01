'use client'
import React from 'react'

import Link from "next/link";
import Image from "next/image";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";

import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignUpButton,
    UserButton,
    useUser
} from "@clerk/nextjs";


const navItems = [
    {
        label: 'Library',
        href: '/'
    },
    {
        label: 'Add New',
        href: '/books/new'
    }
]

const Navbar = () => {
    const pathName = usePathname();
    const {user}=useUser()
    return (
        <header className="w-full fixed z-50 bg-(--bg-primary)">
            <div className="wrapper navbar-height py-4 flex justify-between items-center">
                <Link href="/" className="flex gap-0.5 items-center">
                    <Image src="/assets/logo.png" alt="Book_o_nerd" width={42} height={26}/>
                    <span className="logo-text">Book O Nerd</span>
                </Link>
                <nav className="w-fit flex gap-7.5 items-center">
                    {navItems.map(({label, href}) => {
                        const isActive = pathName === href || (href !== '/' && pathName.startsWith(href));
                        return (
                            <Link href={href} key={label}
                                  className={cn('nav-link-base', isActive ? 'nav-link-active' : 'text-black hover:text-opacity-70')}>{label}</Link>
                        )
                    })}

                    <div className="gap-7.5">
                        <SignedOut>
                            <div className="flex gap-2">
                                <SignInButton/>
                                <SignUpButton/>
                            </div>
                        </SignedOut>
                        <SignedIn>
                            <div className="nav-user-link">
                                <UserButton/>
                                {user?.firstName&&(
                                    <Link href="/subscriptions" className="nav-user-name">{user.firstName}</Link>
                                )}
                            </div>
                        </SignedIn>
                    </div>
                </nav>
            </div>
        </header>
    )
}
export default Navbar
