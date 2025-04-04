import React from 'react';

const CandidateDetailsFields = ({ candidate }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Candidate Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["First Name"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Last Name"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Candidate Reference</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Candidate Reference"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Audit Date</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Last Audit Date"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Client</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Preferred Client"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Preferred Job Type</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Preferred Job Type"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Other Clients</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Other Clients"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Client Assessments</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Client Assessments"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Import References</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Import References"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Days Available</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Days Available"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Earliest Start Time</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Earliest Start Time"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Latest Start</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Latest Start"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">AWR</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["AWR"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Average WTD</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Average WTD"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Availability Areas</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Availability Areas"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Available to start</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Available to start"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">JoinedUp Ref</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["JoinedUp Ref"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
          <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Title"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Address"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date Of Birth</label>
          <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Date Of Birth"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Line 2</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Line 2"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile</label>
          <input type="tel" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Mobile"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Town</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Town"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Email"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">County</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["County"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Home Phone</label>
          <input type="tel" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Home Phone"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Post Code</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Post Code"]} />
        </div>
      </div>

      <h4 className="text-lg font-medium mt-6 mb-4">Next Of Kin</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Next Of Kin"]?.["Name"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Relationship</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Next Of Kin"]?.["Relationship"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile</label>
          <input type="tel" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Next Of Kin"]?.["Mobile"]} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Next Of Kin"]?.["Address"]} />
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsFields;