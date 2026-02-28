/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
    turbopack: {
        // Empty config to silence webpack/turbopack conflict error in Next.js 16
    },
};

module.exports = withPWA(nextConfig);
