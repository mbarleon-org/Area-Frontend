declare module 'next/link' {
    import * as React from 'react'
    const Link: React.ComponentType<{
        href: any
        children?: React.ReactNode
        [key: string]: any
    }>;
    export default Link;
}
