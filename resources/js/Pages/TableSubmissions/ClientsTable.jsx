import React, { useMemo } from 'react';
import Table from '../../Components/Charts/Table';

const ClientTable = ({ clients }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleRowClick = useCallback((candidate) => {
    console.log("Row clicked in Candidates component:", candidate);
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
}, []);

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

  return <Table 
  columns={columns} 
  data={candidates}
  onRowClick={handleRowClick}
/>;
};

export default ClientTable;