import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Chart, registerables } from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import axios from "axios";

// Register Chart.js components
Chart.register(...registerables);

// Dashboard layout components
const DashboardSection = ({ title, description, children }) => {
    return (
        <div className="mb-8">
            {title && (
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {title}
                    </h2>
                    {description && (
                        <p className="mt-1 text-gray-500">{description}</p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
};

const DashboardGrid = ({ children, columns = 3 }) => {
    const gridClass =
        {
            1: "grid-cols-1",
            2: "grid-cols-1 md:grid-cols-2",
            3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
            4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        }[columns] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

    return (
        <div className="p-4">
            <div className={`grid ${gridClass} gap-4`}>{children}</div>
        </div>
    );
};

const ChartCard = ({ title, children, isLoading = false }) => {
    return (
        <div
            className="bg-white rounded-lg shadow-sm p-4 h-full"
            style={{ borderLeft: "4px solid #213341" }}
        >
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            {isLoading ? (
                <div className="flex items-center justify-center h-60">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            ) : (
                <div className="h-60">{children}</div>
            )}
        </div>
    );
};

const StatsCard = ({ title, value, icon, color = "blue" }) => {
    const colorClasses = {
        blue: "text-blue-600",
        green: "text-green-600",
        red: "text-red-600",
        purple: "text-purple-600",
        amber: "text-amber-600",
    };

    return (
        <div
            className="border-[3px] border-solid rounded-lg shadow-sm p-4 bg-white flex items-center relative"
            style={{ borderColor: "#213341" }}
        >
            <div className="absolute top-4 left-4 text-gray-400">{icon}</div>
            <div className="ml-10">
                <h3 className="text-sm font-semibold text-gray-600 uppercase">
                    {title}
                </h3>
                <p className={`text-3xl font-bold ${colorClasses[color]}`}>
                    {value}
                </p>
            </div>
        </div>
    );
};

// Sort icon component
const SortIcon = ({ direction }) => {
    if (!direction) {
        return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
        );
    }
    
    return direction === 'asc' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );
};

// Table component for displaying data in a table format with sorting
const DataTable = ({ title, columns, data }) => {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [sortedData, setSortedData] = useState([]);
    
    // Update sorted data when data or sort config changes
    useEffect(() => {
        if (!columns || !data || data.length === 0) {
            setSortedData([]);
            return;
        }
        
        let sortableData = [...data];
        
        if (sortConfig.key !== null) {
            const columnIndex = columns.findIndex(col => col === sortConfig.key);
            if (columnIndex !== -1) {
                sortableData.sort((a, b) => {
                    // Get the values to compare
                    const valueA = a[columnIndex] || "";
                    const valueB = b[columnIndex] || "";
                    
                    // Try to sort as numbers if possible
                    const numA = Number(valueA);
                    const numB = Number(valueB);
                    
                    if (!isNaN(numA) && !isNaN(numB)) {
                        return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
                    }
                    
                    // Otherwise sort as strings
                    return sortConfig.direction === 'asc' 
                        ? String(valueA).localeCompare(String(valueB))
                        : String(valueB).localeCompare(String(valueA));
                });
            }
        }
        
        setSortedData(sortableData);
    }, [data, sortConfig, columns]);
    
    // Request a sort
    const requestSort = (key) => {
        let direction = 'asc';
        
        if (sortConfig.key === key) {
            direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
        }
        
        setSortConfig({ key, direction });
    };
    
    if (!columns || !data) return null;
    
    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg h-full">
            <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        scope="col"
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => requestSort(column)}
                                    >
                                        <div className="flex items-center space-x-1">
                                            <span>{column}</span>
                                            <SortIcon 
                                                direction={sortConfig.key === column ? sortConfig.direction : null} 
                                            />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedData.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className={
                                        rowIndex % 2 === 0
                                            ? "bg-white hover:bg-gray-50"
                                            : "bg-gray-50 hover:bg-gray-100"
                                    }
                                >
                                    {row.map((cell, cellIndex) => (
                                        <td
                                            key={cellIndex}
                                            className="px-4 py-3 whitespace-nowrap text-sm text-gray-500"
                                        >
                                            {cell || "—"}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Chart components for different chart types
const BarChartComponent = ({ title, labels, datasets }) => {
    const data = {
        labels,
        datasets: datasets.map((dataset, index) => ({
            label: dataset.label,
            data: dataset.data,
            backgroundColor: `hsla(${index * 30}, 70%, 60%, 0.6)`,
            borderColor: `hsla(${index * 30}, 70%, 50%, 1)`,
            borderWidth: 1,
        })),
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <ChartCard title={title}>
            <Bar data={data} options={options} />
        </ChartCard>
    );
};

const LineChartComponent = ({ title, labels, datasets }) => {
    const data = {
        labels,
        datasets: datasets.map((dataset, index) => ({
            label: dataset.label,
            data: dataset.data,
            fill: false,
            borderColor: `hsla(${index * 45}, 70%, 50%, 1)`,
            tension: 0.4,
        })),
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <ChartCard title={title}>
            <Line data={data} options={options} />
        </ChartCard>
    );
};

const PieChartComponent = ({ title, labels, datasets }) => {
    const data = {
        labels,
        datasets: [
            {
                data: datasets[0].data,
                backgroundColor: labels.map((_, index) => {
                    const hue = (index * 137) % 360; // Use golden ratio to spread colors
                    return `hsla(${hue}, 70%, 60%, 0.8)`;
                }),
                borderColor: "#fff",
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
    };

    return (
        <ChartCard title={title}>
            <Pie data={data} options={options} />
        </ChartCard>
    );
};

// Helper function to parse chart configuration from structured form fields
const parseChartConfig = (chartType, chartLabel) => {
    const parts = chartLabel.split("^");
    if (parts.length < 3) return null;

    const type = parts[0];
    const title = parts[1];
    const columns = parts[2].split("|");
    const dataUrl = parts[3] || "";

    return {
        type,
        title,
        columns,
        dataUrl,
        chartType,
    };
};

// Helper function to parse chart data
const parseChartData = (chartData, columns) => {
    if (!chartData) return { labels: [], datasets: [] };

    // If data comes in format "Client A~10~12~2;Client B~12~9~-3;..."
    const rows = chartData.split(";").filter(Boolean);
    const columnCount = columns.length;
    
    // For table data, return processed rows and columns
    if (rows.length === 0) return { labels: [], datasets: [] };

    // Extract labels (first column from each row)
    const labels = rows.map(row => {
        const cells = row.split("~");
        return cells[0] || "";
    });

    // Create datasets for each column except the first (labels)
    const datasets = [];
    for (let i = 1; i < columnCount; i++) {
        const dataset = {
            label: columns[i],
            data: rows.map(row => {
                const cells = row.split("~");
                return parseFloat(cells[i]) || 0;
            }),
        };
        datasets.push(dataset);
    }

    return { labels, datasets };
};

// Helper function to convert chart data to table format
const convertToTableData = (chartData) => {
    if (!chartData) return [];
    
    const rows = chartData.split(";").filter(Boolean);
    return rows.map(row => row.split("~"));
};

export default function CandidateChart({
    auth,
    title,
    menu = [],
    candidateData = { data: [] },
    structuredFormFields = {},
    status,
    viewForm,
    columns = [],
    vsetts = {}
}) {
    const [isClient, setIsClient] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [chartData, setChartData] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Make sure the component is running in the browser
        setIsClient(true);

        try {
            // Log what we received to help debugging
            console.log("CandidateChart received props:", {
                auth: !!auth,
                title,
                viewForm,
                structuredFormFields,
                vsetts
            });

            // Check if we have valid data
            if (!candidateData || !candidateData.data) {
                console.error("Missing candidateData or data property", {
                    candidateData,
                });
                setHasError(true);
                setErrorMessage("No data available. Please try again later.");
                return;
            }

            // Validate auth user exists
            if (!auth || !auth.user) {
                console.error("Missing auth.user", { auth });
                setHasError(true);
                setErrorMessage(
                    "Authentication error. Please try logging in again."
                );
                return;
            }

            // Check if we have chart settings
            if (viewForm === "Dashboard" && vsetts && vsetts.charts) {
                loadChartData();
            } else {
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error in CandidateChart component", error);
            setHasError(true);
            setErrorMessage(
                "An unexpected error occurred. Please try again later."
            );
        }
    }, [candidateData, auth, viewForm]);

    // Function to load chart data from URLs in structuredFormFields
    const loadChartData = async () => {
        try {
            if (!vsetts || !vsetts.charts || !structuredFormFields) {
                setIsLoading(false);
                return;
            }

            // Log available chart types in vsetts and available fields
            console.log("Charts from vsetts:", vsetts.charts);
            console.log("Available structuredFormFields:", Object.keys(structuredFormFields));

            const chartTypes = vsetts.charts.split(';').filter(Boolean).map(type => type.trim());
            const chartDataObj = {};
            
            // For demo purposes, we're mocking the API calls
            // In a real implementation, you would make actual API calls to the URLs
            // specified in the structuredFormFields
            
            for (const chartType of chartTypes) {
                // Fix case sensitivity issue for day_bookings_by_Client_pie
                const normalizedChartType = chartType.toLowerCase() === 'day_bookings_by_client_pie' 
                    ? 'day_bookings_by_client_pie' 
                    : chartType;
                
                // Get chart configuration from structuredFormFields
                let chartConfig = structuredFormFields[normalizedChartType];
                
                if (!chartConfig || !chartConfig.label) {
                    console.log(`Missing config for chart type: ${chartType}, normalized to: ${normalizedChartType}`);
                    // Try alternate casing if original not found
                    const alternateKeys = Object.keys(structuredFormFields).filter(
                        key => key.toLowerCase() === normalizedChartType.toLowerCase()
                    );
                    
                    if (alternateKeys.length > 0) {
                        const alternateKey = alternateKeys[0];
                        console.log(`Found alternate key: ${alternateKey}`);
                        chartConfig = structuredFormFields[alternateKey];
                    } else {
                        console.log(`No alternate key found for: ${normalizedChartType}`);
                        continue;
                    }
                }

                // Parse chart configuration
                const config = parseChartConfig(normalizedChartType, chartConfig.label);
                if (!config) {
                    console.log(`Failed to parse config for: ${normalizedChartType}`);
                    continue;
                }

                // In a real implementation, this is where you would make the API call
                // For now, we'll use mock data
                const mockData = generateMockChartData(config.type, config.columns.length);
                
                chartDataObj[normalizedChartType] = {
                    config,
                    data: mockData
                };
            }

            console.log("Processed chart data:", Object.keys(chartDataObj));
            setChartData(chartDataObj);
            setIsLoading(false);
        } catch (error) {
            console.error("Error loading chart data:", error);
            setIsLoading(false);
        }
    };

    // Helper function to generate mock chart data for testing
    const generateMockChartData = (type, columnCount) => {
        // For a table with structure "Client|Last Week|This Week|Difference"
        if (columnCount === 4) {
            return "Client A~10~12~2;Client B~12~9~-3;Client C~19~12~-7;Client D~12~12~0;Client E~4~3~1;Client F~2~4~2;Total~24~30~6";
        }
        
        // For a table with structure "Client|Total"
        if (columnCount === 2) {
            return "Client A~24;Client B~18;Client C~15;Client D~12;Client E~8;Client F~3;Total~80";
        }
        
        // Default
        return "Item 1~10;Item 2~20;Item 3~15;Item 4~25;Item 5~18";
    };

    if (!isClient) {
        return null; // Prevent chart rendering on server
    }

    // Handle error state
    if (hasError) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                menu={menu}
                header={
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {title || "Dashboard"}
                        </h2>
                        <div className="h-[3px] w-10 bg-orange-500 mt-2"></div>
                    </div>
                }
            >
                <Head title={title || "Dashboard"} />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900">
                                <div className="flex flex-col items-center justify-center py-12">
                                    <svg
                                        className="w-16 h-16 text-red-500 mb-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        ></path>
                                    </svg>
                                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                                        Error Loading Dashboard
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        {errorMessage}
                                    </p>
                                    <a
                                        href="/dashboard"
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Go to Main Dashboard
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Handle loading state
    if (isLoading) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                menu={menu}
                header={
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {title || "Dashboard"}
                        </h2>
                        <div className="h-[3px] w-10 bg-orange-500 mt-2"></div>
                    </div>
                }
            >
                <Head title={title || "Dashboard"} />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Build charts based on structured form fields and vsetts
    const renderCharts = () => {
        if (!vsetts || !vsetts.charts) return null;
        
        const chartTypes = vsetts.charts.split(';').filter(Boolean);
        const allElements = [];
        
        for (const chartType of chartTypes) {
            const chartInfo = chartData[chartType];
            if (!chartInfo) continue;
            
            const { config, data } = chartInfo;
            const { title, columns, type } = config;
            
            if (type === 'table') {
                // Add tables to the same grid as charts
                const tableData = convertToTableData(data);
                allElements.push(
                    <DataTable 
                        key={chartType} 
                        title={title} 
                        columns={columns} 
                        data={tableData} 
                    />
                );
            } else {
                // Parse data for charts
                const parsedData = parseChartData(data, columns);
                
                // Render appropriate chart based on type
                if (type === 'bar' || type === 'column') {
                    allElements.push(
                        <BarChartComponent 
                            key={chartType} 
                            title={title} 
                            labels={parsedData.labels} 
                            datasets={parsedData.datasets} 
                        />
                    );
                } else if (type === 'line') {
                    allElements.push(
                        <LineChartComponent 
                            key={chartType} 
                            title={title} 
                            labels={parsedData.labels} 
                            datasets={parsedData.datasets} 
                        />
                    );
                } else if (type === 'pie') {
                    allElements.push(
                        <PieChartComponent 
                            key={chartType} 
                            title={title} 
                            labels={parsedData.labels} 
                            datasets={parsedData.datasets} 
                        />
                    );
                }
            }
        }
        
        // Return all visualizations in a single grid
        return (
            <DashboardGrid columns={3}>
                {allElements}
            </DashboardGrid>
        );
    };

    // Render dashboard with charts and tables
    return (
        <AuthenticatedLayout
            user={auth.user}
            menu={menu}
            header={
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {structuredFormFields?.pagetitle?.label || "Dashboard"}
                    </h2>
                    <div className="h-[3px] w-10 bg-orange-500 mt-2"></div>
                </div>
            }
        >
            <Head title={title || "Dashboard"} />

            <div className="py-4">
                <div className="mx-auto sm:px-6 lg:px-8">
                    {renderCharts()}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}