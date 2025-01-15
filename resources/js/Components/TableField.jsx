import React, { useEffect, useState } from "react";
import Table from "@/Components/Charts/Table/Index.jsx";
import axios from "axios";

const TableField = ({ field, fieldInfo }) => {
    const [tableData, setTableData] = useState({
        data: [],
        structuredFormFields: {},
        buttons: null,
        popups: null,
    });

    useEffect(() => {
        const fetchTableData = async () => {
            try {
                // Extract settings from field options
                const settings = fieldInfo.options.reduce((acc, option) => {
                    acc[option.label] = option.value;
                    return acc;
                }, {});

                console.log("Settings prepared:", {
                    settings,
                    fieldInfo: fieldInfo,
                });

                const viewForm = settings.viewform;
                const buttons = settings.Buttons?.replace(/\^/g, ";") || "";
                const popups = settings.Popups?.replace(/\^/g, ";") || "";
                const returnList =
                    settings["return-list"]?.replace(/\^/g, ";") || "";

                console.log("Making request with params:", {
                    viewForm,
                    url: settings.url,
                    query: settings.query,
                    buttons,
                    popups,
                    returnList,
                });

                const response = await axios.get(
                    route("candidates.table-data"),
                    {
                        params: {
                            viewForm,
                            url: settings.url,
                            query: settings.query,
                            buttons,
                            popups,
                            returnList,
                        },
                    }
                );

                console.log("Response received:", {
                    data: response.data,
                    status: response.status,
                });
                setTableData(response.data);
            } catch (error) {
                console.error("Error fetching table data:", {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
            }
        };

        if (fieldInfo?.options) {
            fetchTableData();
        }
    }, [fieldInfo]);

    if (!fieldInfo?.options) return null;

    // Extract settings from options
    const settings = fieldInfo.options.reduce((acc, option) => {
        acc[option.label] = option.value;
        return acc;
    }, {});

    // Parse columns from return-list
    const columns = settings["labels"]?.split(/[;^]/).filter(Boolean) || [];

    // Create vsetts object
    const vsetts = {
        url: settings.url,
        labels: settings.labels?.replace(/\^/g, ";"),
        query: settings.query,
        "return-list": settings["return-list"]?.replace(/\^/g, ";"),
        pageactions: settings.pageactions,
        pagetitle: settings.pagetitle,
        pageicon: settings.pageicon,
        viewform: settings.viewform,
        tablefilters: settings.tablefilters?.replace(/\^/g, ";"),
    };

    // Create formSettings object
    const formSettings = {
        saveURL: settings.SaveUrl || "",
        saveData: settings.SaveData || "",
    };

    // Log processed settings and transformations
    console.log("Processed Settings:", {
        originalSettings: settings,
        processedColumns: columns,
        processedVsetts: vsetts,
        processedFormSettings: formSettings,
        tableDataState: tableData,
    });

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table
                columns={columns}
                data={tableData.data || []}
                viewForm={settings.viewform}
                buttons={tableData.buttons}
                popups={tableData.popups}
                structuredFormFields={tableData.structuredFormFields}
                formSettings={formSettings}
                disableRowClick={settings.disableRowClick}
                vsetts={vsetts}
                updateInterval={30000}
            />
        </div>
    );
};

export default TableField;
