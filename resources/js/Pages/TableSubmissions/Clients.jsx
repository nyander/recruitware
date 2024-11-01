import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ClientsTable from './ClientsTable';

const Clients = ({ auth, clients }) => {
  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Clients</h1>
        <ClientsTable clients={clients} />
      </div>
    </AuthenticatedLayout>
  );
};

export default Clients;