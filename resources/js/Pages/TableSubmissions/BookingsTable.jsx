import React, { useMemo } from 'react';
import Table from '../Components/Table';

const BookingTable = ({ bookings }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Client',
        accessor: 'client.name',
      },
      {
        Header: 'Candidate',
        accessor: 'candidate.full_name',
      },
      {
        Header: 'Start Date',
        accessor: 'start_date',
      },
      {
        Header: 'End Date',
        accessor: 'end_date',
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
      // Add any additional columns you need for bookings
      {
        Header: 'Job Type',
        accessor: 'candidate.job_type',
      },
      {
        Header: 'Branch',
        accessor: 'candidate.branch',
      },
      {
        Header: 'Shift Pattern',
        accessor: 'candidate.shift_pattern',
      },
    ],
    []
  );

  return <Table columns={columns} data={bookings} />;
};

export default BookingTable;