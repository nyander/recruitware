import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { PlusCircle, Trash2, Save } from "lucide-react";

const CandidateForm = () => {
    const [candidates, setCandidates] = useState([
        {
            candidateRef: "",
            fullName: "",
            email: "",
            shiftPattern: "",
            location: "",
            firstName: "",
            lastName: "",
            jobType: "",
            phone: "",
            assessed: false,
            dateOfBirth: "",
            branch: "",
            availWindow: "",
            classification: "",
            county: "",
        },
    ]);

    const { data, setData, post, processing, errors } = useForm({
        candidates: candidates,
    });

    const handleInputChange = (index, event) => {
        const { name, value } = event.target;
        const updatedCandidates = [...candidates];
        updatedCandidates[index] = {
            ...updatedCandidates[index],
            [name]: value,
        };
        setCandidates(updatedCandidates);
        setData("candidates", updatedCandidates);
    };

    const addCandidate = () => {
        const newCandidates = [
            ...candidates,
            {
                candidateRef: "",
                fullName: "",
                email: "",
                shiftPattern: "",
                location: "",
                firstName: "",
                lastName: "",
                jobType: "",
                phone: "",
                assessed: false,
                dateOfBirth: "",
                branch: "",
                availWindow: "",
                classification: "",
                county: "",
            },
        ];
        setCandidates(newCandidates);
        setData("candidates", newCandidates);
    };

    const removeCandidate = (index) => {
        const updatedCandidates = candidates.filter((_, i) => i !== index);
        setCandidates(updatedCandidates);
        setData("candidates", updatedCandidates);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("tablesubmissions.store"), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">
                Candidate Submission Form
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {candidates.map((candidate, index) => (
                    <div
                        key={index}
                        className="border p-4 rounded-lg shadow-sm"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.keys(candidate).map((field) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700">
                                        {field.charAt(0).toUpperCase() +
                                            field
                                                .slice(1)
                                                .replace(/([A-Z])/g, " $1")
                                                .trim()}
                                    </label>
                                    {field === "assessed" ? (
                                        <input
                                            type="checkbox"
                                            name={field}
                                            checked={candidate[field]}
                                            onChange={(e) =>
                                                handleInputChange(index, {
                                                    target: {
                                                        name: field,
                                                        value: e.target.checked,
                                                    },
                                                })
                                            }
                                            className="mt-1 focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                        />
                                    ) : (
                                        <input
                                            type={
                                                field === "dateOfBirth"
                                                    ? "date"
                                                    : "text"
                                            }
                                            name={field}
                                            value={candidate[field]}
                                            onChange={(e) =>
                                                handleInputChange(index, e)
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        />
                                    )}
                                    {errors[`candidates.${index}.${field}`] && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {
                                                errors[
                                                    `candidates.${index}.${field}`
                                                ]
                                            }
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                        {candidates.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeCandidate(index)}
                                className="mt-2 flex items-center text-red-600 hover:text-red-800"
                            >
                                <Trash2 className="mr-1" size={16} />
                                Remove Candidate
                            </button>
                        )}
                    </div>
                ))}
                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={addCandidate}
                        className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <PlusCircle className="mr-2" size={16} />
                        Add Another Candidate
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <Save className="mr-2" size={16} />
                        Submit All Candidates
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CandidateForm;
