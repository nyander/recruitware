import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BookingsTable from './BookingsTable';

const Bookings = ({ auth, bookings }) => {
  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Bookings</h1>
        <BookingsTable bookings={bookings} />
      </div>
    </AuthenticatedLayout>
  );
};

export default Bookings;