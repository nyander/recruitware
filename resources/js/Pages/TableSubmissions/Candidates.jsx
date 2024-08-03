import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CandidateTable from './CandidateTable';


const Candidates = ({  auth , candidates, branches, jobTypes, shiftPatterns, classifications }) => {
  console.log('Received props:', { candidates, branches, jobTypes, shiftPatterns, classifications });

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Candidates</h1>
        <CandidateTable candidates={candidates} />
      </div>
    </AuthenticatedLayout>
    
  );
};

export default Candidates;