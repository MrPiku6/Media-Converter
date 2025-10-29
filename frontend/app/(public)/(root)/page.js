'use client';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    if(loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

    if(isAuthenticated) {
        router.push('/tool');
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-2xl">
                <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    Video Conversion Powerhouse
                </h1>
                <p className="mt-4 text-lg text-gray-300">
                    The ultimate full-stack web application for all your video and audio conversion and editing needs. Built with Next.js, Node.js, and the powerful FFmpeg engine.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Link href="/login" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition duration-300">
                        Login
                    </Link>
                    <Link href="/signup" className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition duration-300">
                        Sign Up
                    </Link>
                </div>
            </div>
            <div className="mt-16 text-left w-full max-w-3xl">
                <h2 className="text-3xl font-bold mb-6 text-center">Features</h2>
                <ul className="space-y-4 text-gray-400">
                    <li className="p-4 bg-gray-800 rounded-lg">✅ <span className="font-semibold text-gray-200">Secure User Authentication:</span> JWT-based sessions and protected routes.</li>
                    <li className="p-4 bg-gray-800 rounded-lg">✅ <span className="font-semibold text-gray-200">Daily Usage Quota:</span> Fair-use policy with a daily limit of 10 conversions per user.</li>
                    <li className="p-4 bg-gray-800 rounded-lg">✅ <span className="font-semibold text-gray-200">Extensive Editing Tools:</span> Trim, resize, rotate, change codecs, control bitrate, and more.</li>
                    <li className="p-4 bg-gray-800 rounded-lg">✅ <span className="font-semibold text-gray-200">Asynchronous Processing:</span> Convert videos without freezing the UI, with real-time progress updates.</li>
                    <li className="p-4 bg-gray-800 rounded-lg">✅ <span className="font-semibold text-gray-200">Secure File Handling:</span> Strict file size limits and automatic deletion of temporary files after one hour.</li>
                </ul>
            </div>
        </div>
    );
}
