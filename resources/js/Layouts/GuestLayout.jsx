import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center py-8 px-4">
            {/* Allow full-width card */}
            <div className="w-full max-w-6xl">{children}</div>
        </div>
    );
}
