import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/hooks';
import { RootState } from '@/store';
import { fetchClients } from '../store/clientsSlice';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  min-height: calc(100vh - 64px); 
  box-sizing: border-box;
  background: #f5f6fa;
`;

const Title = styled.h2`
  color: #333;
  text-align: center; 
  padding-right: 0.9rem;
`;

const TableWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  overflow-x: auto; 
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

interface ExpandedInfoProps {
  hasDetails: boolean;
}

const ExpandedInfo = styled.div<ExpandedInfoProps>`
  width: 100%;
  color: ${({ hasDetails }) => (hasDetails ? '#1E1E2F' : 'orange')};
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  background: #f4f6f8;
  border-bottom: 1px solid #ddd;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #eee;
  font-size: 12px;
`;

const ExpandedTd = styled.td`
  padding: 12px;
  background: #f9f9f9;
  border-bottom: 1px solid #ddd;
  font-size: 12px;
`;

const ButtonWrapper = styled.div`
  display: flex; 
  align-items: center;
  justify-content: flex-start; 
`; 

const Button = styled.button`
  padding: 8px 20px;
  background: #1E1E2F;
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 16px;
  cursor: pointer;
  margin-right: 0.5rem;

  &:hover {
    background: #434367ff;
  }
`; 

const Clients: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clients, loading, error } = useSelector((state: RootState) => state.clients);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleRow = (index: number) => {
    setExpandedRow(prev => (prev === index ? null : index));
  };

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  if (loading) return <Container><p>Loading clients...</p></Container>;
  if (error) return <Container><p style={{ color: 'red' }}>{error}</p></Container>;

  return (
    <Container> 
      <ButtonWrapper>
        <Title>Clients</Title>
        <Button onClick={() => console.log('soon')}>New</Button>
        <Button onClick={() => console.log('soon')}>Edit</Button>
        <Button onClick={() => console.log('soon')}>Delete</Button>
      </ButtonWrapper> 
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Sirname</Th>
              <Th>Mail</Th>
              <Th>Phone</Th>
              <Th>Active</Th>
              <Th>Created</Th>
              <Th>Update</Th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => (
              <React.Fragment key={index}>
                <tr onClick={() => toggleRow(index)} style={{ cursor: 'pointer' }}>
                  <Td>{client._id}</Td>
                  <Td>{client.firstName}</Td>
                  <Td>{client.lastName}</Td>
                  <Td>{client.email}</Td>
                  <Td>{client.phone || '-'}</Td>
                  <Td>{client.isActive ? 'Yes' : 'No'}</Td>
                  <Td>{new Date(client.createdAt).toLocaleString()}</Td>
                  <Td>{new Date(client.updatedAt).toLocaleDateString()}</Td>
                </tr>

                {expandedRow === index && (
                  <tr>
                    <ExpandedTd colSpan={7}>
                      <ExpandedInfo hasDetails={!!client.address && Object.keys(client.address).length > 0}>
                        <strong>Address: </strong>
                        {client.address
                          ? `${client.address.street || '-'}, ${client.address.city || '-'}, ${client.address.state || '-'}, ${client.address.country || '-'}, ${client.address.zipCode || '-'}`
                          : 'No address'}
                      </ExpandedInfo>
                    </ExpandedTd>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </TableWrapper>
    </Container>
  );
};

export default Clients;
