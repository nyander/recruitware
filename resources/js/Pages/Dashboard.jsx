// resources/js/Pages/Dashboard.jsx

import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Users, CalendarPlus, CheckCircle } from "lucide-react";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard({ auth, menu }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get("/api/dashboard-data");
                setDashboardData(response.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setError(
                    error.response?.data?.message ||
                        "Failed to load dashboard data"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const renderCharts = () => {
        if (!dashboardData) return null;

        const barData = {
            labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            datasets: [
                {
                    label: "Bookings per Day",
                    data: dashboardData.bookingsPerDay,
                    backgroundColor: "rgba(59, 130, 246, 0.5)",
                    borderColor: "rgb(59, 130, 246)",
                    borderWidth: 1,
                },
            ],
        };

        const lineData = {
            labels: dashboardData.lastMonthDates,
            datasets: [
                {
                    label: "Monthly Trend",
                    data: dashboardData.lastMonthBookings,
                    borderColor: "rgb(59, 130, 246)",
                    tension: 0.4,
                },
            ],
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div
                    className="bg-white border-[3px] border-solid rounded-lg shadow-sm p-4"
                    style={{ borderColor: "#213341" }}
                >
                    <h3 className="text-lg font-semibold mb-4">
                        Daily Bookings
                    </h3>
                    <Bar data={barData} />
                </div>
                <div
                    className="bg-white border-[3px] border-solid rounded-lg shadow-sm p-4"
                    style={{ borderColor: "#213341" }}
                >
                    <h3 className="text-lg font-semibold mb-4">
                        Monthly Trend
                    </h3>
                    <Line data={lineData} />
                </div>
            </div>
        );
    };

    const renderKPIs = () => {
        if (!dashboardData?.kpis) return null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 px-2">
                {/* Active Candidates */}
                <div
                    className="border-[3px] border-solid rounded-lg shadow-sm p-4 bg-white flex items-center relative"
                    style={{ borderColor: "#213341" }}
                >
                    <div className="absolute top-4 left-4 text-gray-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M17 20h5v-2a7 7 0 00-7-7H9a7 7 0 00-7 7v2h5m3-8a4 4 0 110-8 4 4 0 010 8z"
                            />
                        </svg>
                    </div>
                    <div className="ml-10">
                        <h3 className="text-sm font-semibold text-gray-600 uppercase">
                            Active Candidates
                        </h3>
                        <p className="text-3xl font-bold text-blue-600">
                            {dashboardData.kpis.totalActive}
                        </p>
                    </div>
                </div>

                {/* New This Week */}
                <div
                    className="border-[3px] border-solid rounded-lg shadow-sm p-4 bg-white flex items-center relative"
                    style={{ borderColor: "#213341" }}
                >
                    {" "}
                    <div className="absolute top-4 left-4 text-gray-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 4h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <div className="ml-10">
                        <h3 className="text-sm font-semibold text-gray-600 uppercase">
                            New This Week
                        </h3>
                        <p className="text-3xl font-bold text-green-600">
                            {dashboardData.kpis.newThisWeek}
                        </p>
                    </div>
                </div>

                {/* Completion Rate */}
                <div
                    className="border-[3px] border-solid rounded-lg shadow-sm p-4 bg-white flex items-center relative"
                    style={{ borderColor: "#213341" }}
                >
                    {" "}
                    <div className="absolute top-4 left-4 text-gray-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m7 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <div className="ml-10">
                        <h3 className="text-sm font-semibold text-gray-600 uppercase">
                            Completion Rate
                        </h3>
                        <p className="text-3xl font-bold text-purple-600">
                            {dashboardData.kpis.completionRate}
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            menu={menu}
            header={
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Dashboard
                    </h2>
                    <div className="h-[3px] w-10 bg-orange-500 mt-2"></div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-4">
                <div className="mx-auto sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-red-600">{error}</p>
                        </div>
                    ) : (
                        <>
                            {dashboardData?.isDemo && (
                                <div className="mb-4 bg-yellow-50 p-4 rounded-lg">
                                    <p className="text-yellow-600">
                                        Showing demo data. External service data
                                        not available.
                                    </p>
                                </div>
                            )}
                            {renderKPIs()}
                            {renderCharts()}
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
