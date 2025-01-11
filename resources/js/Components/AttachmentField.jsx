import { usePage } from "@inertiajs/react";
import React, { useState, useEffect, useRef, useCallback } from "react";

const AttachmentField = ({
    field = "",
    value = "",
    isEditMode = false,
    isSubmitting = false,
    handleInputChange = () => {},
}) => {
    const [filename, setFilename] = useState("");
    const [fileId, setFileId] = useState("");
    const [fileLocation, setFileLocation] = useState("");
    const [uploadStatus, setUploadStatus] = useState("");
    const [iframeKey, setIframeKey] = useState(`iframe_${field}_${Date.now()}`);
    const iframeRef = useRef(null);
    const { fldr } = usePage().props;
    const [isIframeLoading, setIsIframeLoading] = useState(true);

    // Handle file upload message event
    const handleFileUploaded = useCallback(
        (event) => {
            if (
                event.data?.type === "fileUploaded" &&
                event.data.field === field
            ) {
                const rawFileLocation = event.data.fileLocation;
                if (rawFileLocation) {
                    const encodedFileLocation = rawFileLocation.replace(
                        /\s+/g,
                        "%20"
                    );
                    setFilename(rawFileLocation);
                    setFileLocation(encodedFileLocation);
                    handleInputChange(field, encodedFileLocation);
                    setUploadStatus("File uploaded successfully");

                    const matches = rawFileLocation.match(/\/([^\/]+)_/);
                    if (matches && matches[1]) {
                        setFileId(matches[1]);
                    }
                }
            }
        },
        [field, handleInputChange]
    );

    // Set up event listener for file upload messages
    useEffect(() => {
        window.addEventListener("message", handleFileUploaded);

        return () => {
            window.removeEventListener("message", handleFileUploaded);
        };
    }, [handleFileUploaded]);

    // Initialize with existing value
    useEffect(() => {
        if (value) {
            const encodedValue = value.replace(/\s+/g, "%20");
            setFilename(value);
            setFileLocation(encodedValue);
        }
    }, [value]);

    const handleClear = () => {
        setFilename("");
        setFileId("");
        setFileLocation("");
        handleInputChange(field, "");
        setUploadStatus("");
        setIframeKey(`iframe_${field}_${Date.now()}`);

        if (iframeRef.current) {
            const currentSrc = iframeRef.current.src;
            iframeRef.current.src = "about:blank";
            setTimeout(() => {
                iframeRef.current.src = currentSrc;
            }, 100);
        }
    };

    const handleIframeLoad = () => {
        setIsIframeLoading(false);
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
                    <input
                        type="hidden"
                        id={field}
                        name={field}
                        value={fileLocation}
                        onChange={(e) =>
                            handleInputChange(field, e.target.value)
                        }
                    />
                    <input type="hidden" id={`${field}_id`} value={fileId} />
                    {uploadStatus && (
                        <div className="absolute -bottom-5 left-0 text-xs text-gray-500">
                            {uploadStatus}
                        </div>
                    )}
                </div>

                {isEditMode && !isSubmitting && (
                    <div className="relative h-[38px] w-[76px] overflow-hidden">
                        {isIframeLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white">
                                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                        <iframe
                            ref={iframeRef}
                            key={iframeKey}
                            name="uploadFrame"
                            src={`https://www.recruitware.uk/${fldr}/webstore.nsf/fresource!OpenForm&Seq=1&fieldn=${encodeURIComponent(
                                field
                            )}`}
                            className="absolute top-0 left-0"
                            style={{
                                width: "76px",
                                height: "38px",
                                border: "none",
                                transform: "scale(1)",
                                transformOrigin: "top left",
                                opacity: isIframeLoading ? "0" : "1",
                            }}
                            onLoad={handleIframeLoad}
                        />
                    </div>
                )}

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
        </div>
    );
};

export default AttachmentField;
