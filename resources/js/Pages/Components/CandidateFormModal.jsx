import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const CandidateFormModal = ({ isOpen, onClose, candidate, formSettings }) => {

    useEffect(() => {
        console.log('Form Settings received:', formSettings);
    }, [formSettings]);

    if (!isOpen) return null;

    if (!formSettings) {
        return (
            <div className="fixed inset-0 overflow-y-auto z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <p>Loading form settings...</p>
                    </div>
                </div>
            </div>
        );
    }
  // if (!isOpen) return null;

  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    console.log('Form Settings received:', formSettings);
    if (formSettings && isOpen) {
      // Transform formSettings into the tabs structure
      const newTabs = Object.entries(formSettings.data).map(([key, value]) => ({
        id: key,
        name: key,
        sections: [{
          id: key,
          name: key,
          fields: Object.entries(value).map(([fieldKey, fieldValue]) => ({
            label: fieldKey,
            inputType: getInputType(fieldValue),
            size: 'half',
            defaultValue: candidate?.[fieldKey] || fieldValue,
          }))
        }]
      }));
      setTabs(newTabs);
      setActiveTab(newTabs[0]?.id || '');
    }
  }, [formSettings, candidate, isOpen]);

  if (!isOpen) return null;

  // Helper function to determine input type
  const getInputType = (value) => {
    if (typeof value === 'boolean') return 'checkbox';
    if (typeof value === 'number') return 'number';
    if (value instanceof Date) return 'date';
    return 'text';
  };

  const renderTabContent = () => {
    const currentTab = tabs.find((tab) => tab.id === activeTab);

    if (!currentTab) return null;

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
                    {field.inputType === 'checkbox' ? (
                      <input
                        type="checkbox"
                        defaultChecked={field.defaultValue}
                        id={field.label}
                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
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

  if (!formSettings) {
    return (
      <div className="fixed inset-0 overflow-y-auto z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <p>Loading form settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-y-auto z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-[60%] sm:max-w-[1000px] w-[80%]">
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
                      className={`
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