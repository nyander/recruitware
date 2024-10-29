import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import GaugeChart from '@/Components/Charts/GaugeChart';
import BarChart from '@/Components/Charts/BarChart';
import LineChart from '@/Components/Charts/LineChart';
import axios from 'axios';

export default function Dashboard({ auth, menu }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPopupVisible, setIsPopupVisible] = useState(true); // State for popup visibility

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/dashboard-data');
                setDashboardData(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const renderCharts = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-red-50 p-4 rounded-md">
                    <p className="text-red-800">{error}</p>
                </div>
            );
        }

        if (!dashboardData) return null;

        const barChartData = {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            datasets: [
                {
                    label: 'Bookings per Day',
                    data: dashboardData.bookingsPerDay,
                    backgroundColor: 'rgba(79, 70, 229, 0.6)',
                    borderColor: 'rgb(79, 70, 229)',
                    borderWidth: 1,
                },
            ],
        };

        const barChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Bookings per Day',
                    font: {
                        size: 16,
                        weight: 'bold',
                    },
                },
            },
        };

        const lineChartData = {
            labels: dashboardData.lastMonthDates,
            datasets: [
                {
                    label: 'Bookings',
                    data: dashboardData.lastMonthBookings,
                    borderColor: 'rgb(79, 70, 229)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.4,
                },
            ],
        };

        const lineChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Bookings Trend (Last 30 Days)',
                    font: {
                        size: 16,
                        weight: 'bold',
                    },
                },
            },
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Weekly Progress</h2>
                    <div className="h-64 flex items-center justify-center">
                        <GaugeChart
                            value={dashboardData.weeklyBookings}
                            max={dashboardData.weeklyBookingsTarget}
                            label="Bookings"
                        />
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Daily Distribution</h2>
                    <div className="h-64">
                        <BarChart data={barChartData} options={barChartOptions} />
                    </div>
                </div>
                <div className="bg-white overflow-hidden shadow-sm rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900">Monthly Trend</h2>
                    <div className="h-64">
                        <LineChart data={lineChartData} options={lineChartOptions} />
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
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Dashboard Overview
                    </h2>
                    <div className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleString()}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            {/* Popup Overlay */}
            {isPopupVisible && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
                        <h2 className="text-lg font-semibold mb-4">Notice</h2>
                        <p className="mb-6">
                            The Dashboard is currently under development, and the content here is static information.
                        </p>
                        <button
                            onClick={() => setIsPopupVisible(false)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-indigo-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-indigo-700 mb-2">
                                        Total Bookings
                                    </h3>
                                    <p className="text-3xl font-bold text-indigo-900">
                                        {dashboardData?.weeklyBookings || 0}
                                    </p>
                                    <p className="text-sm text-indigo-600 mt-1">This week</p>
                                </div>
                                <div className="bg-green-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-green-700 mb-2">
                                        Target
                                    </h3>
                                    <p className="text-3xl font-bold text-green-900">
                                        {dashboardData?.weeklyBookingsTarget || 0}
                                    </p>
                                    <p className="text-sm text-green-600 mt-1">Weekly goal</p>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-purple-700 mb-2">
                                        Progress
                                    </h3>
                                    <p className="text-3xl font-bold text-purple-900">
                                        {dashboardData
                                            ? Math.round((dashboardData.weeklyBookings / dashboardData.weeklyBookingsTarget) * 100)
                                            : 0}%
                                    </p>
                                    <p className="text-sm text-purple-600 mt-1">Of weekly target</p>
                                </div>
                            </div>
                            {renderCharts()}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
