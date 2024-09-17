import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import GaugeChart from '@/Components/Charts/GaugeChart';
import BarChart from '@/Components/Charts/BarChart';
import LineChart from '@/Components/Charts/LineChart';
import axios from 'axios';

export default function Dashboard({ auth, menu }) {
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('/api/dashboard-data');
                setDashboardData(response.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchDashboardData();
    }, []);

    const renderCharts = () => {
        if (!dashboardData) return <div>Loading charts...</div>;

        const barChartData = {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            datasets: [
                {
                    label: 'Bookings per Day',
                    data: dashboardData.bookingsPerDay,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
            ],
        };

        const barChartOptions = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Bookings per Day',
                },
            },
        };

        const lineChartData = {
            labels: dashboardData.lastMonthDates,
            datasets: [
                {
                    label: 'Bookings',
                    data: dashboardData.lastMonthBookings,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                },
            ],
        };

        const lineChartOptions = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Bookings Trend (Last 30 Days)',
                },
            },
        };

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-2">Weekly Bookings</h2>
                    <GaugeChart
                        value={dashboardData.weeklyBookings}
                        max={dashboardData.weeklyBookingsTarget}
                        label="Bookings"
                    />
                </div>
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-2">Bookings per Day</h2>
                    <BarChart data={barChartData} options={barChartOptions} />
                </div>
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-2">Bookings Trend</h2>
                    <LineChart data={lineChartData} options={lineChartOptions} />
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
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-semibold mb-4">Welcome to your Dashboard</h3>
                            <p className="mb-4">Here's an overview of your bookings and trends:</p>
                            {renderCharts()}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}