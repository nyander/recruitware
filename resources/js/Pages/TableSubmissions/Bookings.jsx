import React from 'react';
import BookingsTable from './BookingsTable';

const Bookings = ({ bookings }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Bookings</h1>
      <BookingsTable bookings={bookings} />
    </div>
  );
};

export default Bookings;