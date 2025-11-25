/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // transpile the shared workspace packages so Next can compile code from workspace packages
    experimental: {},
    // Next 13+ supports `transpilePackages` to transpile sibling packages
    transpilePackages: ['@area/src', '@area/ui']
}

module.exports = nextConfig
