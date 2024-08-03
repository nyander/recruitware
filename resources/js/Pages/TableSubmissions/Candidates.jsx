import React from 'react';
import CandidateTable from './CandidateTable';


const Index = ({ candidates, branches, jobTypes, shiftPatterns, classifications }) => {
  console.log('Received props:', { candidates, branches, jobTypes, shiftPatterns, classifications });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Candidates</h1>
      <CandidateTable candidates={candidates} />
    </div>
  );
};

export default Index;