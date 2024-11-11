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
    const iframeId = "attachfloat";

    const addDebugLog = (message) => {
        console.log(message);
        // setDebugLog((prev) => [
        //     ...prev,
        //     `${new Date().toISOString()}: ${message}`,
        // ]);
    };

    useEffect(() => {
        if (!document.getElementById(iframeId)) {
            addDebugLog("Creating iframe and form...");

            const form = document.createElement("form");
            form.id = "uploadForm";
            form.method = "post";
            form.enctype = "multipart/form-data";
            form.action =
                "http://31.193.136.171/freshlabs/webstore.nsf/fresource?openform";
            form.style.display = "none";
            form.target = iframeId;

            const hiddenFields = {
                cmd: { value: "fileUpload" },
                returnFormat: { value: "script" },
                redirectUrl: { value: "javascript:void(0)" },
                returnScript: {
                    value: `parent.postMessage({action: 'uploadComplete', filename: '[FILENAME]', fileId: '[FILEID]'}, '*');`,
                },
                field: { value: "" },
                Subject: { value: "" },
                Name: { value: "" },
                Type: { value: "Field Attachment" },
                Title: { value: "Field Attachment" },
            };

            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.name = "freshupload";
            fileInput.id = "freshupload";
            fileInput.style.display = "none";
            form.appendChild(fileInput);

            Object.entries(hiddenFields).forEach(([name, config]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = name;
                input.id = name;
                input.value = config.value;
                form.appendChild(input);
            });

            document.body.appendChild(form);

            const iframe = document.createElement("iframe");
            iframe.id = iframeId;
            iframe.name = iframeId;
            iframe.width = "1%";
            iframe.height = "6px";
            iframe.frameBorder = "0";
            iframe.src =
                "http://31.193.136.171/freshlabs/webstore.nsf/fresource?openform";
            iframe.style.display = "none";

            iframe.onload = () => {
                addDebugLog("Iframe loaded");
                setUploadStatus("Ready");
            };

            document.body.appendChild(iframe);

            // Event listener for postMessage from the iframe
            window.addEventListener("message", (event) => {
                const { action, filename, fileId } = event.data;
                if (action === "uploadComplete") {
                    addDebugLog(
                        `Upload completed with filename: ${filename}, fileId: ${fileId}`
                    );
                    setFilename(
                        `/freshfiles/library/apex.admin/${fileId}_${filename}`
                    );
                    setFileId(fileId);
                    handleInputChange(
                        field,
                        `/freshfiles/library/apex.admin/${fileId}_${filename}`
                    );
                }
            });

            form.target = iframeId;

            fileInput.addEventListener("change", (e) => {
                if (e.target.files?.length) {
                    const file = e.target.files[0];
                    addDebugLog(`File selected: ${file.name}`);
                    setUploadStatus("Uploading...");

                    const timestamp = Date.now().toString();
                    form.querySelector("#field").value =
                        window.fresh_attachField || "";
                    form.querySelector("#Subject").value = timestamp;
                    form.querySelector("#Name").value = file.name;

                    try {
                        form.submit();
                        addDebugLog("Form submitted successfully");
                    } catch (error) {
                        addDebugLog(`Form submission error: ${error.message}`);
                        setUploadStatus("Upload failed");
                    }
                }
            });
        }

        return () => {
            addDebugLog("Cleaning up attachment field");
            delete window.fresh_setAttach;
            delete window.fresh_attachField;

            document.getElementById("uploadForm")?.remove();
            document.getElementById(iframeId)?.remove();
            window.removeEventListener("message", () => {});
        };
    }, [field, handleInputChange]);

    const handleAttach = () => {
        addDebugLog(`Attach button clicked for field: ${field}`);
        setUploadStatus("Selecting file...");
        window.fresh_attachField = field;

        const iframeWindow = window.frames[iframeId];
        if (iframeWindow) {
            const fileInput = document.getElementById("freshupload");
            if (fileInput) {
                fileInput.click();
            } else {
                addDebugLog("File input not found in iframe");
                setUploadStatus("Error: File input not found in iframe");
            }
        } else {
            addDebugLog("Iframe not found or not accessible");
            setUploadStatus("Error: Iframe not found or not accessible");
        }
    };

    const handleView = () => {
        if (fileId) {
            addDebugLog(`Opening file view: ${fileId}`);
            window.open(`http://31.193.136.171/view?id=${fileId}`, "_blank");
        }
    };

    const handleClear = () => {
        addDebugLog("Clearing attachment");
        setFilename("");
        setFileId("");
        handleInputChange(field, "");
        setUploadStatus("");
        setDebugLog([]);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        id={`${field}_disp`}
                        value={filename}
                        disabled
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                    />
                    {uploadStatus && (
                        <div className="absolute -bottom-5 left-0 text-xs text-gray-500">
                            {uploadStatus}
                        </div>
                    )}
                </div>
                <input type="hidden" id={`${field}_id`} value={fileId} />

                <button
                    type="button"
                    onClick={handleAttach}
                    disabled={!isEditMode || isSubmitting}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        !isEditMode || isSubmitting
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                    }`}
                >
                    Attach
                </button>
                <button
                    type="button"
                    onClick={handleView}
                    disabled={!fileId || isSubmitting}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                        !fileId || isSubmitting
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                    }`}
                >
                    View
                </button>
                <button
                    type="button"
                    onClick={handleClear}
                    disabled={!fileId || !isEditMode || isSubmitting}
                    className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                        !fileId || !isEditMode || isSubmitting
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                    }`}
                >
                    Clear
                </button>
            </div>

            {debugLog.length > 0 && (
                <div className="mt-4 p-2 bg-gray-100 rounded-md text-xs font-mono overflow-auto max-h-40">
                    {debugLog.map((log, index) => (
                        <div key={index} className="whitespace-pre-wrap">
                            {log}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AttachmentField;
