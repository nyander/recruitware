import React, { useMemo } from 'react';
import Table from '../Components/Table';

const ClientTable = ({ clients }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Contact Person',
        accessor: 'contact_person',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Phone',
        accessor: 'phone',
      },
      // Add any additional columns you need for clients
    ],
    []
  );

  return <Table columns={columns} data={clients} />;
};

export default ClientTable;