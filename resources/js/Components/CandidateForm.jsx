import React, { useState, useEffect } from 'react';

const CandidateForm = ({ candidate, formSettings, onBack, onSave }) => {
    const [tabs, setTabs] = useState([]);
    const [activeTab, setActiveTab] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState(candidate);

    useEffect(() => {
        if (formSettings) {
            const newTabs = formSettings.map((tabSetting) => ({
                id: tabSetting.label.toLowerCase().replace(/\s+/g, '-'),
                name: tabSetting.label,
                sections: tabSetting.sections || []
            }));
            setTabs(newTabs);
            setActiveTab(newTabs[0]?.id || '');
        }
    }, [formSettings]);

    const getInputType = (fieldName) => {
        if (['Date Of Birth', 'LicenceExpiry', 'TachoValidFrom', 'TachoExpiry', 'CPCValidFrom', 'CPCExpiry'].includes(fieldName)) return 'date';
        if (['Mobile', 'KinMobile', 'HomePhone'].includes(fieldName)) return 'tel';
        if (fieldName === 'Email') return 'email';
        if (['ProfilePicture', 'LicenceFront', 'LicenceBack', 'TachoFront', 'TachoBack', 'CPCFront', 'CPCBack'].includes(fieldName)) return 'file';
        if (fieldName.startsWith('Skills') || fieldName.startsWith('Medic') || ['ValidBritishPassport', 'EUCitizen', 'isStudent'].includes(fieldName)) return 'checkbox';
        return 'text';
    };

    const handleInputChange = (field, value) => {
        setFormData(prevData => ({
            ...prevData,
            [field]: value
        }));
    };

    const renderField = (field) => {
        const inputType = getInputType(field);
        return (
            <div key={field} className="mb-4">
                <label htmlFor={field} className="block text-sm font-medium text-gray-700">
                    {field}
                </label>
                <div className="mt-1">
                    {inputType === 'checkbox' ? (
                        <input
                            type="checkbox"
                            id={field}
                            checked={formData[field]}
                            onChange={(e) => handleInputChange(field, e.target.checked)}
                            disabled={!isEditMode}
                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                    ) : (
                        <input
                            type={inputType}
                            id={field}
                            value={formData[field] || ''}
                            onChange={(e) => handleInputChange(field, e.target.value)}
                            disabled={!isEditMode}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                    )}
                </div>
            </div>
        );
    };

    const renderTabContent = () => {
        const currentTab = tabs.find((tab) => tab.id === activeTab);
        if (!currentTab) return <div>No tab selected</div>;

        return (
            <div className="space-y-8">
                {Object.entries(currentTab.sections).map(([sectionKey, section]) => (
                    <div key={sectionKey} className="section">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{section.label}</h3>
                        <div className={`grid grid-cols-${section.columns || 1} gap-4`}>
                            {Array.isArray(section.fields) ? section.fields.map((field) => renderField(field)) : <div>No fields in this section</div>}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const handleEdit = () => {
        setIsEditMode(true);
    };

    const handleCancel = () => {
        setIsEditMode(false);
        setFormData(candidate);
    };

    const handleSave = () => {
        onSave(formData);
        setIsEditMode(false);
    };
    const handleBackClick = (e) => {
        e.preventDefault();
        onBack();
    };

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50">
                <button
                    onClick={handleBackClick}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    ← Back
                </button>
                {!isEditMode ? (
                    <button
                        onClick={handleEdit}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Edit
                    </button>
                ) : (
                    <div>
                        <button
                            onClick={handleCancel}
                            className="mr-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>
            <div className="px-4 py-5 sm:p-6">
                <div className="flex h-full">
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
                    <div className="w-3/4 pl-4 overflow-y-auto">
                        {tabs.length > 0 ? renderTabContent() : <div>No tabs available</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateForm;