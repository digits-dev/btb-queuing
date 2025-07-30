import { useState, useEffect, useRef } from 'react';
import NavLink from '@/Components/NavLink';
import { usePage } from '@inertiajs/react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const currentRoute = route().current();
    const isDisplayRoute = currentRoute === 'display';

    const [navVisible, setNavVisible] = useState(false);
    const touchStartY = useRef(0);
    const touchEndY = useRef(0);

    // Detect swipe down to show nav
    useEffect(() => {
        const handleTouchStart = (e) => {
            touchStartY.current = e.touches[0].clientY;
        };

        const handleTouchMove = (e) => {
            touchEndY.current = e.touches[0].clientY;
        };

        const handleTouchEnd = () => {
            const distance = touchEndY.current - touchStartY.current;
            if (distance > 50) {
                setNavVisible(true);
                setTimeout(() => setNavVisible(false), 4000); // auto-hide after 4s
            }
        };

        document.addEventListener('touchstart', handleTouchStart);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, []);

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Sticky Navbar */}
            <nav
                className={`fixed left-0 right-0 z-10 bg-white border-b border-gray-200 transition-all duration-300 ${
                    navVisible ? 'top-0' : 'top-[-70px]'
                } hover:top-0`}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-1">
                    <div className="flex h-16 items-center justify-center w-full">
                        <div className="flex space-x-2 bg-gray-100 border border-gray-200 rounded-lg px-4 py-2">
                            {currentRoute === "display" && (
                                <NavLink href={route("display")} active className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-white">
                                    <i className="fa-solid fa-tv"></i>
                                    <span>Display</span>
                                </NavLink>
                            )}
                            {currentRoute === "counters" && (
                                <NavLink href={route("counters")} active className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-white">
                                    <i className="fa-solid fa-tv"></i>
                                    <span>Counters</span>
                                </NavLink>
                            )}
                            {currentRoute === "dashboard" && (
                                <NavLink href={route("dashboard")} active className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-white">
                                    <img src="https://cdn-icons-png.flaticon.com/128/5199/5199949.png" className="w-[18px]" alt="" />
                                    <span>Queue Registration</span>
                                </NavLink>
                            )}
                            {!["display", "counters", "dashboard"].includes(currentRoute) && (
                                <NavLink href={route("service-counter")} active={currentRoute === "service-counter"} className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-white">
                                    <img src="https://cdn-icons-png.flaticon.com/128/2916/2916179.png" className="w-5" alt="" />
                                    <span>Service Counter</span>
                                </NavLink>
                            )}
                            <NavLink href={route("logout")} method="post" as="button" className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-white">
                                <i className="fa-solid fa-right-from-bracket"></i>
                                <span>Logout</span>
                            </NavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-4 bg-gray-100">
                {children}
            </main>
        </div>
    );
}
