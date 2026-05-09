/** @type {import('next').NextConfig} */
const nextConfig = {
    env:{
        // NEXT_PUBLIC_API_URL:"https://facechatappbackend.onrender.com/api"
        NEXT_PUBLIC_API_URL:"http://localhost:8000/api"
    }
};
module.exports = nextConfig;
