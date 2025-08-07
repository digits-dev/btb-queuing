import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function QrCodeLogin({ auth, qr, url }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="QR Code Login" />{" "}
            <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
                {" "}
                <div className="bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 max-w-md w-full text-center transition-all duration-300">
                    {" "}
                    <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-6">
                        Scan QR Code{" "}
                    </h1>{" "}
                    <div
                        className="inline-block border-4 border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-md mb-6 bg-white dark:bg-gray-800"
                        dangerouslySetInnerHTML={{ __html: qr }}
                    />{" "}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Click the link below
                    </p>{" "}
                    <a
                        href={url}
                        target="_blank"
                        className="text-blue-600 dark:text-blue-400 underline break-words text-sm hover:text-blue-800"
                    >
                        Go to Queue
                    </a>{" "}
                </div>{" "}
            </div>{" "}
        </AuthenticatedLayout>
    );
}
