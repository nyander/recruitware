import React, { useState, useEffect } from "react";
import { useRef } from "react";

const AttachmentField = ({
    field,
    value,
    isEditMode,
    isSubmitting,
    handleInputChange,
}) => {
    const [filename, setFilename] = useState("");
    const [fileId, setFileId] = useState("");
    const [fileLocation, setFileLocation] = useState("");
    const [uploadStatus, setUploadStatus] = useState("");
    const [iframeKey, setIframeKey] = useState(`iframe_${field}_${Date.now()}`);
    const iframeRef = useRef(null);

    useEffect(() => {
        const handleFileUploaded = (event) => {
            if (event.data?.type === "fileUploaded") {
                if (event.data.field === field) {
                    const rawFileLocation = event.data.fileLocation;
                    if (rawFileLocation) {
                        // Encode spaces in the file location
                        const encodedFileLocation = rawFileLocation.replace(
                            /\s+/g,
                            "%20"
                        );

                        setFilename(rawFileLocation); // Keep original filename for display
                        handleInputChange(field, encodedFileLocation); // Use encoded version for storage/transmission
                        setUploadStatus("File uploaded successfully");

                        // Extract file ID if present in the path
                        const matches = rawFileLocation.match(/\/([^\/]+)_/);
                        if (matches && matches[1]) {
                            setFileId(matches[1]);
                            setFileLocation(encodedFileLocation); // Store encoded version
                            console.log("Original location:", rawFileLocation);
                            console.log(
                                "Encoded location:",
                                encodedFileLocation
                            );
                        }
                    }
                }
            }
        };

        window.addEventListener("message", handleFileUploaded);

        // Initialize with existing value if present
        if (value) {
            const encodedValue = value.replace(/\s+/g, "%20");
            setFilename(value); // Keep original for display
            setFileLocation(encodedValue); // Store encoded version
        }

        return () => {
            window.removeEventListener("message", handleFileUploaded);
        };
    }, [field, handleInputChange, value]);

    const handleClear = () => {
        setFilename("");
        setFileId("");
        handleInputChange(field, "");
        setUploadStatus("");

        // Generate a new key to force iframe reload
        setIframeKey(`iframe_${field}_${Date.now()}`);

        // If you have a form reference, reset it
        if (formRef.current) {
            formRef.current.reset();
        }

        // Alternative approach: reload iframe directly
        if (iframeRef.current) {
            const currentSrc = iframeRef.current.src;
            iframeRef.current.src = "about:blank";
            setTimeout(() => {
                iframeRef.current.src = currentSrc;
            }, 100);
        }
    };

    return (
        <div className="space-y-4">
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

                {filename && (
                    <>
                        <button
                            type="button"
                            onClick={() =>
                                window.open(
                                    `https://www.recruitware.uk${fileLocation}`,
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

            {isEditMode && !isSubmitting && (
                <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="mb-4">
                        <form
                            target="uploadFrame"
                            action="https://www.recruitware.uk/Apex/webstore.nsf/fresource!OpenForm&Seq=1"
                            method="post"
                            encType="multipart/form-data"
                        >
                            <input type="hidden" name="field" value={field} />
                            <iframe
                                ref={iframeRef}
                                key={iframeKey}
                                name="uploadFrame"
                                src={`https://www.recruitware.uk/Apex/webstore.nsf/fresource!OpenForm&Seq=1&fieldn=${encodeURIComponent(
                                    field
                                )}`}
                                className="w-full h-24 border-0"
                                style={{
                                    display: "block",
                                    overflow: "hidden",
                                }}
                                onLoad={() =>
                                    console.log(
                                        "iframe loaded with field:",
                                        field
                                    )
                                }
                            />
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttachmentField;
