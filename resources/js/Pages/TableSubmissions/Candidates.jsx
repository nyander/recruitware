import React, { useState, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Table from '@/Components/Table';
import CandidateFormModal from './CandidateFormModal.jsx';

const Candidates = ({ auth, candidates, status, columns }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    
    console.log("Rendering Candidates component with modal open:", isModalOpen);

    const handleRowClick = useCallback((candidate) => {
      console.log("Row clicked, opening modal with candidate:", candidate);
      setSelectedCandidate(candidate);
      setIsModalOpen(true);
    }, []);
    

    return (
        <AuthenticatedLayout
            user={auth.user}
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{status} Candidates</h2>}
        >
            <Head title={`${status} Candidates`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto lg:px-2">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="h-[calc(100vh-300px)]">
                                <Table 
                                    columns={columns} 
                                    data={candidates}
                                    onRowClick={handleRowClick}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Use only this modal */}
            <CandidateFormModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              candidate={selectedCandidate}
            />

        </AuthenticatedLayout>
    );
};

export default Candidates;
