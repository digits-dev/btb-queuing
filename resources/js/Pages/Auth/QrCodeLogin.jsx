import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function QrCodeLogin({ auth, qr, url }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="QR Code Login" />

            <div className="max-w-2xl mx-auto mt-10 text-center">
                <h1 className="text-2xl font-bold mb-4">Scan this QR to Log In</h1>

                {/* ✅ Render SVG QR code properly */}
                <div
    className="inline-block"
    dangerouslySetInnerHTML={{ __html: qr }}
/>


                <p className="mt-4 text-sm text-gray-500 break-all">
                    Or open this link: <br />
                    <a href={url} className="text-blue-600 underline">{url}</a>
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
