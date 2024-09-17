import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function UnderDevelopment({ auth, sectionName, menu }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            menu = {menu}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{sectionName}</h2>}
        >
            <Head title={`${sectionName} - Under Development`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-medium text-gray-900">Under Development</h3>
                            <p className="mt-1 text-sm text-gray-600">
                                The {sectionName} section is currently under development. Please check back later.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}