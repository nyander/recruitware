import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CandidateFormModal = ({ isOpen, onClose, candidate }) => {
  if (!isOpen) return null; // Only render the modal if isOpen is true

  const tabs = [
    {
      id: 'candidates',
      name: 'Candidate Details',
      sections: [
        {
          id: 'candidateDetails',
          name: 'Candidate Details',
          fields: [
            { label: 'First Name', inputType: 'text', size: 'half', defaultValue: candidate?.['First Name'] },
            { label: 'Last Name', inputType: 'text', size: 'half', defaultValue: candidate?.['Last Name'] },
            { label: 'Candidate Reference', inputType: 'text', size: 'half', defaultValue: candidate?.['Candidate Reference'] },
            { label: 'Last Audit Date', inputType: 'text', size: 'half', defaultValue: candidate?.['Last Audit Date'] },
            { label: 'Preferred Client', inputType: 'text', size: 'half', defaultValue: candidate?.['Preferred Client'] },
            { label: 'Preferred Job Type', inputType: 'text', size: 'half', defaultValue: candidate?.['Preferred Job Type'] },
            { label: 'Other Clients', inputType: 'text', size: 'half', defaultValue: candidate?.['Other Clients'] },
            { label: 'Client Assessments', inputType: 'text', size: 'half', defaultValue: candidate?.['Client Assessments'] },
            { label: 'Import References', inputType: 'text', size: 'half', defaultValue: candidate?.['Import References'] },
            { label: 'Days Available', inputType: 'text', size: 'half', defaultValue: candidate?.['Days Available'] },
            { label: 'Earliest Start Time', inputType: 'text', size: 'half', defaultValue: candidate?.['Earliest Start Time'] },
            { label: 'Latest Start', inputType: 'text', size: 'half', defaultValue: candidate?.['Latest Start'] },
            { label: 'AWR', inputType: 'text', size: 'half', defaultValue: candidate?.['AWR'] },
            { label: 'Average WTD', inputType: 'text', size: 'half', defaultValue: candidate?.['Average WTD'] },
            { label: 'Availability Areas', inputType: 'text', size: 'half', defaultValue: candidate?.['Availability Areas'] },
            { label: 'Available to start', inputType: 'text', size: 'half', defaultValue: candidate?.['Available to start'] },
            { label: 'JoinedUp Ref', inputType: 'text', size: 'half', defaultValue: candidate?.['JoinedUp Ref'] },
            { label: 'Profile Picture', inputType: 'file', size: 'half', defaultValue: '' },
            { label: 'Title', inputType: 'text', size: 'half', defaultValue: candidate?.['Title'] },
            { label: 'Address', inputType: 'text', size: 'half', defaultValue: candidate?.['Address'] },
            { label: 'Date Of Birth', inputType: 'date', size: 'half', defaultValue: candidate?.['Date Of Birth'] },
            { label: 'Line 2', inputType: 'text', size: 'half', defaultValue: candidate?.['Line 2'] },
            { label: 'Mobile', inputType: 'tel', size: 'half', defaultValue: candidate?.['Mobile'] },
            { label: 'Town', inputType: 'text', size: 'half', defaultValue: candidate?.['Town'] },
            { label: 'Email', inputType: 'email', size: 'half', defaultValue: candidate?.['Email'] },
            { label: 'County', inputType: 'text', size: 'half', defaultValue: candidate?.['County'] },
            { label: 'Home Phone', inputType: 'tel', size: 'half', defaultValue: candidate?.['Home Phone'] },
            { label: 'Post Code', inputType: 'text', size: 'half', defaultValue: candidate?.['Post Code'] },
          ],
        },
        {
          id: 'nextOfKin',
          name: 'Next Of Kin',
          fields: [
            { label: 'Name', inputType: 'text', size: 'half', defaultValue: candidate?.['Next Of Kin']?.['Name'] },
            { label: 'Relationship', inputType: 'text', size: 'half', defaultValue: candidate?.['Next Of Kin']?.['Relationship'] },
            { label: 'Mobile', inputType: 'tel', size: 'half', defaultValue: candidate?.['Next Of Kin']?.['Mobile'] },
            { label: 'Address', inputType: 'text', size: 'half', defaultValue: candidate?.['Next Of Kin']?.['Address'] },
          ],
        },
      ],
    },
    {
      id: 'professional',
      name: 'Professional Details',
      sections: [
        {
          id: 'candidateEntitlement',
          name: 'Candidate Entitlement',
          fields: [
            {
              label: 'How are you legally entitled to work in this country?',
              inputType: 'select',
              size: 'half',
              defaultValue: candidate?.legalEntitlement,
              options: ['British National', 'UK Work Visa', 'EU National'],
            },
            { label: 'Nationality', inputType: 'text', size: 'half', defaultValue: candidate?.nationality },
            { label: 'Passport No.', inputType: 'text', size: 'half', defaultValue: candidate?.passportNo },
            { label: 'Passport Expiry', inputType: 'date', size: 'half', defaultValue: candidate?.passportExpiry },
            { label: 'National I.D No', inputType: 'text', size: 'half', defaultValue: candidate?.nationalIDNo },
            { label: 'NI Number', inputType: 'text', size: 'half', defaultValue: candidate?.niNumber },
            { label: 'Visa Expiry Date', inputType: 'date', size: 'half', defaultValue: candidate?.visaExpiryDate },
            { label: 'Sharecode', inputType: 'text', size: 'half', defaultValue: candidate?.sharecode },
            { label: 'Passport', inputType: 'file', size: 'half', defaultValue: '' },
            { label: 'Visa', inputType: 'file', size: 'half', defaultValue: '' },
            { label: 'National I.D', inputType: 'file', size: 'half', defaultValue: '' },
            { label: 'Sharecode Doc', inputType: 'file', size: 'half', defaultValue: '' },
            { label: 'Bank Statement', inputType: 'file', size: 'half', defaultValue: '' },
            { label: 'Birth Certificate', inputType: 'file', size: 'half', defaultValue: '' },
            { label: 'Utility Bill', inputType: 'file', size: 'half', defaultValue: '' },
            { label: 'Proof of NI', inputType: 'file', size: 'half', defaultValue: '' },
          ],
        },
        {
          id: 'drivingLicence',
          name: 'Driving Licence',
          fields: [
            { label: 'Name On Licence', inputType: 'text', size: 'half', defaultValue: candidate?.licenceName },
            { label: 'Licence No.', inputType: 'text', size: 'half', defaultValue: candidate?.licenceNo },
            { label: 'Licence Expiry', inputType: 'date', size: 'half', defaultValue: candidate?.licenceExpiry },
            { label: 'Address on Licence', inputType: 'text', size: 'half', defaultValue: candidate?.licenceAddress },
            { label: 'Points On Licence', inputType: 'number', size: 'half', defaultValue: candidate?.licencePoints },
            { label: 'License Check Date', inputType: 'date', size: 'half', defaultValue: candidate?.licenseCheckDate },
            { label: 'License Check', inputType: 'file', size: 'half', defaultValue: '' },
            { label: 'Driving Licence Front', inputType: 'file', size: 'half', defaultValue: '' },
            { label: 'Driving Licence Back', inputType: 'file', size: 'half', defaultValue: '' },
          ],
        },
        {
          id: 'otherDrivingQualifications',
          name: 'Other Driving Qualifications',
          fields: [
            {
              label: 'Valid Digital Tacho',
              inputType: 'select',
              size: 'half',
              defaultValue: candidate?.validDigitalTacho,
              options: ['Yes', 'No'],
            },
            { label: 'Digi Tacho No.', inputType: 'text', size: 'half', defaultValue: candidate?.digiTachoNo },
            { label: 'Tacho Valid From', inputType: 'date', size: 'half', defaultValue: candidate?.tachoValidFrom },
            { label: 'Tacho Expiry Date', inputType: 'date', size: 'half', defaultValue: candidate?.tachoExpiryDate },
            { label: 'Tacho Card Front', inputType: 'file', size: 'half', defaultValue: '' },
            { label: 'Tacho Card Back', inputType: 'file', size: 'half', defaultValue: '' },
            { label: 'CPC Valid From', inputType: 'date', size: 'half', defaultValue: candidate?.cpcValidFrom },
            { label: 'CPC Expiry Date', inputType: 'date', size: 'half', defaultValue: candidate?.cpcExpiryDate },
            { label: 'CPC Card Front', inputType: 'file', size: 'half', defaultValue: '' },
            { label: 'CPC Card Back', inputType: 'file', size: 'half', defaultValue: '' },
          ],
        },
      ],
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const renderTabContent = () => {
    const currentTab = tabs.find((tab) => tab.id === activeTab);

    return (
      <div className="space-y-8">
        {currentTab.sections.map((section) => (
          <div key={section.id} className="section">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{section.name}</h3>
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {section.fields.map((field, index) => (
                <div key={index}>
                  <label htmlFor={field.label} className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <div className="mt-1">
                    {field.inputType === 'select' ? (
                      <select
                        id={field.label}
                        defaultValue={field.defaultValue}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        {field.options.map((option, idx) => (
                          <option key={idx} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.inputType}
                        defaultValue={field.defaultValue}
                        id={field.label}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 overflow-y-auto z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-[60%] sm:max-w-[1000px]">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start pb-3 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-title">
                Candidate Form
              </h3>
              <button
                type="button"
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-5 sm:mt-6 flex h-[60vh]">
              <div className="w-1/4 pr-4 overflow-y-auto border-r border-gray-200">
                <nav className="space-y-1" aria-label="Sidebar">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`${
                        activeTab === tab.id
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group w-full flex items-center px-3 py-2 text-sm font-medium rounded-md`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="w-3/4 pl-4 overflow-y-auto">{renderTabContent()}</div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Save
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateFormModal;
