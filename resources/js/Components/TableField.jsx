import React, { useEffect, useState } from "react";
import Table from "./Charts/Table";
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

                const viewForm = settings.viewform;

                // Make request to your Laravel backend
                const response = await axios.get(
                    route("candidates.table-data"),
                    {
                        params: {
                            viewForm,
                            url: settings.url,
                            query: settings.query,
                        },
                    }
                );

                setTableData(response.data);
                console.log("data passed in successfully");
            } catch (error) {
                console.error("Error fetching table data:", error);
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
    const columns =
        settings["return-list"]?.split(/[;^]/).filter(Boolean) || [];

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
                disableRowClick={true}
                vsetts={vsetts}
                updateInterval={30000}
            />
        </div>
    );
};

export default TableField;
