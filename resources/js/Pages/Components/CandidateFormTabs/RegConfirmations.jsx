import React from 'react';

const RegConfirmations = ({ candidate }) => {
  return (
    <div className="mt-6">
      <h4 className="text-lg font-medium mb-4">Reg Confirmations</h4>
      <div className="space-y-2">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            className="form-checkbox h-5 w-5 text-indigo-600"
            defaultChecked={candidate?.["Drugs and Alcohol testing arrangements"]}
          />
          <label className="ml-2 text-sm text-gray-700">
            I have read and agree to the <a href="#" className="text-indigo-600 hover:text-indigo-800">Drugs and Alcohol testing arrangements</a>.
          </label>
        </div>
        {/* Add other checkbox items here */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Agreement Date</label>
            <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["Agreement Date"]} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">IP</label>
            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.["IP"]} />
          </div>
        </div>
        <div className="flex items-center mt-2">
          <input 
            type="checkbox" 
            className="form-checkbox h-5 w-5 text-indigo-600"
            defaultChecked={candidate?.["Recitals 1 and 2"]}
          />
          <label className="ml-2 text-sm text-gray-700">
            I have read and agree to the <a href="#" className="text-indigo-600 hover:text-indigo-800">Recitals 1 and 2</a>.
          </label>
        </div>
      </div>
    </div>
  );
};

export default RegConfirmations;