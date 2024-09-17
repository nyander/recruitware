import React from 'react';

const PersonalDetailsFields = ({ candidate }) => {
  return (
    <div className="space-y-8">
      {/* Candidate Entitlement Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Candidate Entitlement</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">How are you legally entitled to work in this country?</label>
            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.legalEntitlement} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nationality</label>
            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.nationality} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Passport No.</label>
            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.passportNo} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Passport Expiry</label>
            <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.passportExpiry} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">National I.D No</label>
            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.nationalIDNo} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">NI Number</label>
            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.niNumber} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Visa Expiry Date</label>
            <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.visaExpiryDate} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sharecode</label>
            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.sharecode} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Passport</label>
            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Visa</label>
            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">National I.D</label>
            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sharecode Doc</label>
            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bank Statement</label>
            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Birth Certificate</label>
            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Utility Bill</label>
            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Proof of NI</label>
            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>
      </div>

      {/* Driving Licence Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Driving Licence</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name On Licence</label>
            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.licenceName} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Licence No.</label>
            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.licenceNo} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Licence Expiry</label>
            <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.licenceExpiry} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address on Licence</label>
            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.licenceAddress} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Points On Licence</label>
            <input type="number" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.licencePoints} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">License Check Date</label>
            <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.licenseCheckDate} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">License Check</label>
            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Driving Licence Front</label>
            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Driving Licence Back</label>
            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>
      </div>

      {/* Other Driving Qualifications Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Other Driving Qualifications</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Valid Digital Tacho</label>
            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.validDigitalTacho} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Digi Tacho No.</label>
            <input type="text" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.digiTachoNo} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tacho Valid From</label>
            <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.tachoValidFrom} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tacho Expiry Date</label>
            <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.tachoExpiryDate} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CPC Valid From</label>
            <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.cpcValidFrom} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CPC Expiry Date</label>
            <input type="date" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" defaultValue={candidate?.cpcExpiryDate} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tacho Card Front</label>
            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tacho Card Back</label>
            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CPC Card Front</label>
            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CPC Card Back</label>
            <input type="file" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsFields;