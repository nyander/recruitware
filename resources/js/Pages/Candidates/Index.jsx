import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Charts/Table';
import { Head } from '@inertiajs/react';
import { useCallback } from 'react';
import CandidateFormModal from '../Components/CandidateFormModal';

const Index = ({ auth, candidates, status, columns, menu }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const handleRowClick = useCallback((candidate) => {
        console.log("Row clicked, opening modal with candidate:", candidate);
        setSelectedCandidate(candidate);
        setIsModalOpen(true);
      }, []);
      


    return (
        <AuthenticatedLayout
            user={auth.user}
            auth={auth}
            menu={menu}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{status} Candidates</h2>}
        >
            <Head title={`${status} Candidates`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto lg:px-2">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="h-[calc(100vh-300px)]"> {/* Adjust the height as needed */}
                            <Table 
                                columns={columns} 
                                data={Object.values(candidates)}
                                onRowClick={handleRowClick}
                            />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default Index;