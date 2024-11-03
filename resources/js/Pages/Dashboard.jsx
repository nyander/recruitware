// resources/js/Pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

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
                const response = await axios.get('/api/dashboard-data');
                setDashboardData(response.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError(error.response?.data?.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const renderCharts = () => {
        if (!dashboardData) return null;

        const barData = {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            datasets: [{
                label: 'Bookings per Day',
                data: dashboardData.bookingsPerDay,
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            }]
        };

        const lineData = {
            labels: dashboardData.lastMonthDates,
            datasets: [{
                label: 'Monthly Trend',
                data: dashboardData.lastMonthBookings,
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.4
            }]
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Daily Bookings</h3>
                    <Bar data={barData} />
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Monthly Trend</h3>
                    <Line data={lineData} />
                </div>
            </div>
        );
    };

    const renderKPIs = () => {
        if (!dashboardData?.kpis) return null;

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Active Candidates</h3>
                    <p className="text-2xl font-bold text-blue-600">{dashboardData.kpis.totalActive}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">New This Week</h3>
                    <p className="text-2xl font-bold text-green-600">{dashboardData.kpis.newThisWeek}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">Completion Rate</h3>
                    <p className="text-2xl font-bold text-purple-600">{dashboardData.kpis.completionRate}</p>
                </div>
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            menu={menu}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
                                        Showing demo data. External service data not available.
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