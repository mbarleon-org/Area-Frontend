import React from 'react'

declare const require: any

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
    children?: React.ReactNode
}

let NextLink: any = null
let RouterNavLink: any = null
try {
    const nextMod = require('next/link')
    NextLink = nextMod && (nextMod.default || nextMod)
} catch {
    NextLink = null
}

try {
    const rr = require('react-router-dom')
    RouterNavLink = rr && (rr.NavLink || rr.default?.NavLink)
} catch {
    RouterNavLink = null
}

export default function AppLink({ href, children, ...rest }: LinkProps): JSX.Element {
    const { className, style, ...anchorRest } = rest as any

    if (typeof window === 'undefined') {
        return (
            <a href={href} className={className} style={style} {...anchorRest}>
                {children}
            </a>
        )
    }

    if (NextLink) {
        const Next = NextLink
        // @ts-ignore
        return (
            // @ts-ignore
            <Next href={href} className={className} style={style} {...(anchorRest as any)}>
                {children}
            </Next>
        )
    }

    if (RouterNavLink) {
        const Nav = RouterNavLink
        // @ts-ignore
        return (
            // @ts-ignore
            <Nav to={href} className={className} style={style} {...(anchorRest as any)}>
                {children}
            </Nav>
        )
    }

    return (
        <a href={href} className={className} style={style} {...anchorRest}>
            {children}
        </a>
    )
}
