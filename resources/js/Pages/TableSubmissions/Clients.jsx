import React from 'react';
import ClientsTable from './ClientsTable';

const Clients = ({ clients }) => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Clients</h1>
      <ClientsTable clients={clients} />
    </div>
  );
};

export default Clients;