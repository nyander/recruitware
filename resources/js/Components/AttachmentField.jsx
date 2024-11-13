import React, { useState, useEffect } from "react";

const AttachmentField = ({
    field,
    value,
    isEditMode,
    isSubmitting,
    handleInputChange,
}) => {
    const [filename, setFilename] = useState("");
    const [fileId, setFileId] = useState("");
    const [uploadStatus, setUploadStatus] = useState("");
    const [debugLog, setDebugLog] = useState([]);

    const addDebugLog = (message) => {
        console.log(`[AttachmentField] ${message}`);
        setDebugLog((prev) => [
            ...prev,
            `${new Date().toISOString()}: ${message}`,
        ]);
    };

    const handleIframeLoad = () => {
        try {
            // Access the content of the iframe
            const iframe = document.querySelector("iframe");
            const iframeContent =
                iframe.contentDocument || iframe.contentWindow.document;

            // Extract the file path from the iframe's body text
            const filePath = iframeContent.body.textContent.trim();
            if (filePath) {
                addDebugLog(`File path found: ${filePath}`);
                setFilename(filePath);
                handleInputChange(field, filePath);
                setUploadStatus("File uploaded successfully");
            } else {
                addDebugLog("No file path found in iframe content.");
            }
        } catch (error) {
            addDebugLog(`Error accessing iframe content: ${error.message}`);
        }
    };

    const handleClear = () => {
        setFilename("");
        setFileId("");
        handleInputChange(field, "");
        setUploadStatus("");
        addDebugLog("Attachment cleared");
    };

    return (
        <div className="space-y-4">
            {/* Main Input */}
            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        id={`${field}_disp`}
                        value={filename}
                        disabled
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                    />
                    <input type="hidden" id={`${field}_id`} value={fileId} />
                    {uploadStatus && (
                        <div className="absolute -bottom-5 left-0 text-xs text-gray-500">
                            {uploadStatus}
                        </div>
                    )}
                </div>

                {/* View and Clear buttons */}
                {filename && (
                    <>
                        <button
                            type="button"
                            onClick={() =>
                                window.open(
                                    `http://31.193.136.171/view?id=${fileId}`,
                                    "_blank"
                                )
                            }
                            disabled={isSubmitting}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                                isSubmitting
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                        >
                            View
                        </button>

                        <button
                            type="button"
                            onClick={handleClear}
                            disabled={!isEditMode || isSubmitting}
                            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                                !isEditMode || isSubmitting
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                            }`}
                        >
                            Clear
                        </button>
                    </>
                )}
            </div>

            {/* Upload Frame */}
            <div className="border rounded-lg p-4 bg-gray-50">
                {/* Only show iframe when in edit mode */}
                {isEditMode && !isSubmitting && (
                    <div className="mb-4">
                        <iframe
                            src="http://31.193.136.171/Apex/webstore.nsf/fresource!OpenForm&Seq=1"
                            className="w-full h-24 border-0"
                            style={{
                                display: "block",
                                overflow: "hidden",
                            }}
                            onLoad={handleIframeLoad}
                        />
                    </div>
                )}

                {/* Debug Log */}
                <div className="text-xs font-mono">
                    <div>Status: {uploadStatus || "Ready"}</div>
                    <div>Field: {field}</div>
                    <div>Current file: {filename || "None"}</div>
                    {debugLog.map((log, index) => (
                        <div
                            key={index}
                            className="whitespace-pre-wrap text-gray-500"
                        >
                            {log}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AttachmentField;
