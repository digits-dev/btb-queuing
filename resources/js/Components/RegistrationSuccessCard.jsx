import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

export default function RegistrationSuccessCard({ number, name, service, className="" }) {
    const [redirectCountdown, setRedirectCountdown] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setRedirectCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.visit(route("dashboard"));
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className={`max-w-lg mx-auto mt-10 bg-white rounded-lg shadow-md overflow-hidden border-[1px] border-gray-200 ${className}`}>
            <div className="text-center py-8 px-8">
                <i className="bi bi-check2-circle mt-2 text-green-600 text-7xl"></i>
                <h2 className="text-green-600 text-3xl font-bold mb-6">
                    Registration Successful!
                </h2>
                <div className="bg-green-50 rounded-md py-4 mb-4">
                    <p className="text-6xl font-black text-green-600">
                        {number}
                    </p>
                    <p className="text-xl text-gray-500 font-semibold mt-2 mb-1 capitalize">{name} lane</p>
                    <p className="text-md text-gray-500">{service}</p>
                </div>
                <p className="text-md text-gray-600 mb-4">
                    Please keep this number safe. <br />
                    Watch the display screen for your number to be called.
                </p>
                <div className="text-center text-sm text-gray-400 mt-2 font-medium">
                    <div className="flex items-center justify-center">
                        <img src="https://cdn-icons-gif.flaticon.com/6172/6172550.gif" className="w-10" alt="" />
                    </div>
                    Printing, please wait {redirectCountdown}...
                    <div className="mt-2">
                        <span className="inline-block w-3 h-3 mr-1 rounded-full bg-gray-400 animate-bounce"></span>
                        <span className="inline-block w-3 h-3 mr-1 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="inline-block w-3 h-3 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
