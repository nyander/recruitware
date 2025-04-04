import React from "react";
import { Link, Head } from "@inertiajs/react";

export default function Error({ status, message, exception }) {
    const title =
        {
            503: "Service Unavailable",
            500: "Server Error",
            404: "Page Not Found",
            403: "Forbidden",
        }[status] || "Error";

    const description = message || "Sorry, something went wrong on our server.";

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <Head title={title} />
            <div className="max-w-md mx-auto p-8 bg-white shadow-lg rounded-lg">
                <h1 className="text-3xl font-bold text-red-600 mb-4">
                    {title}
                </h1>
                <div className="text-gray-600 mb-8">{description}</div>

                {exception && process.env.NODE_ENV === "development" && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 text-sm text-gray-700 overflow-auto max-h-40">
                        <h3 className="font-semibold mb-2">
                            Exception Details:
                        </h3>
                        <p>{exception}</p>
                    </div>
                )}

                <Link
                    href="/dashboard"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
}
