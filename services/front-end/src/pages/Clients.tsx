// @ts-nocheck
/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/hooks';
import { RootState } from '../store';
import { fetchClients, updateClient, deleteClient, addClient } from '../store/clientsSlice';
import { Client } from '../models/Client';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  min-height: calc(100vh - 64px);
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

const Th = styled.th`
  text-align: left;
  padding: 14px;
  background: #f4f6f8;
  border-bottom: 1px solid #ddd;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 14px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  position: relative;
`;

const ExpandedTd = styled.td`
  padding: 14px;
  background: #f9f9f9;
  border-bottom: 1px solid #ddd;
  font-size: 14px;
`;

interface ExpandedInfoProps {
  hasDetails: boolean;
}

const ExpandedInfo = styled.div<ExpandedInfoProps>`
  width: 100%;
  color: ${(props: ExpandedInfoProps) => (props.hasDetails ? '#1E1E2F' : 'orange')};
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-bottom: 1rem;
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

const DotsButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 0;
  margin-left: 8px;
`;

const TooltipMenu = styled.div`
  position: absolute;
  right: 50px;
  top: calc(100% - 90px);
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 9px;
  box-shadow: 0px 4px 8px rgba(0,0,0,0.1);
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  min-width: 120px;
  z-index: 10000;
`;

const TooltipButton = styled.button`
  padding: 8px 12px;
  text-align: left;
  background: transparent;
  border: none;
  width: 100%;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #f4f6f8;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20000;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 9px;
  padding: 20px;
  width: 500px;
  max-width: 95%;
`;

const ModalTitle = styled.h3`
  margin-top: 0;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 6px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const getEmptyClient = (): Partial<Client> => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  isActive: true,
  address: { 
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  },
});

const Clients: React.FC = () => {
  const dispatch = useAppDispatch();
  const { clients, loading, error } = useSelector((state: RootState) => state.clients);

  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [menuRow, setMenuRow] = useState<number | null>(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newModalOpen, setNewModalOpen] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [form, setForm] = useState<Partial<Client>>(getEmptyClient());

  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleRow = (index: number) => setExpandedRow(prev => (prev === index ? null : index));
  const toggleMenu = (e: React.MouseEvent, index: number, client: Client) => {
    e.stopPropagation();
    setSelectedClient(client);
    setMenuRow(prev => (prev === index ? null : index));
  };

  const openEditModal = () => {
    if (!selectedClient) return;
    setForm(selectedClient);
    setEditModalOpen(true);
    setMenuRow(null);
  };

  const openDeleteModal = () => setDeleteModalOpen(true);
  const openNewModal = () => {
    setForm(getEmptyClient());
    setNewModalOpen(true);
  };

  const handleFormChange = (field: keyof Client, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleAddressChange = (field: keyof Client['address'], value: string) =>
    setForm(prev => ({
      ...prev,
      address: {
        street: prev?.address?.street || '',
        city: prev?.address?.city || '',
        state: prev?.address?.state || '',
        country: prev?.address?.country || '',
        zipCode: prev?.address?.zipCode || '',
        [field]: value,
      },
    }));

  const handleEditSubmit = () => {
    if (form && selectedClient) {
      dispatch(updateClient({ ...selectedClient, ...form } as Client));
      setEditModalOpen(false);
    }
  };

  const handleNewSubmit = async () => {
    if (!form) return; 
    const { id, ...clientData } = form;
    await dispatch(addClient(clientData as any));
    setNewModalOpen(false);
    dispatch(fetchClients());
  };

  const handleDeleteConfirm = () => {
    if (selectedClient) {
      dispatch(deleteClient(selectedClient.id));
      setDeleteModalOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuRow(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  if (loading) return <Container><p>Loading clients...</p></Container>;
  if (error) return <Container><p style={{ color: 'red' }}>{error}</p></Container>;

  return (
    <Container>
      <ButtonWrapper>
        <Title>Clients</Title>
        <Button onClick={openNewModal}>New</Button>
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
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client: Client, index: number) => (
              <React.Fragment key={client.id}>
                <tr onClick={() => toggleRow(index)} style={{ cursor: 'pointer' }}>
                  <Td>{client.id}</Td>
                  <Td>{client.firstName}</Td>
                  <Td>{client.lastName}</Td>
                  <Td>{client.email}</Td>
                  <Td>{client.phone || '-'}</Td>
                  <Td>{client.isActive ? 'Yes' : 'No'}</Td>
                  <Td>{new Date(client.createdAt).toLocaleString()}</Td>
                  <Td>{new Date(client.updatedAt).toLocaleDateString()}</Td>
                  <Td onClick={e => e.stopPropagation()}>
                    <DotsButton onClick={e => toggleMenu(e, index, client)}>⋮</DotsButton>
                    {menuRow === index && (
                      <TooltipMenu ref={menuRef}>
                        <TooltipButton onClick={openEditModal}>Edit</TooltipButton>
                        <TooltipButton onClick={openDeleteModal}>Delete</TooltipButton>
                      </TooltipMenu>
                    )}
                  </Td>
                </tr>
                {expandedRow === index && (
                  <tr>
                    <ExpandedTd colSpan={9}>
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
 
      {(newModalOpen || editModalOpen) && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>{newModalOpen ? 'New Client' : 'Edit Client'}</ModalTitle>

            <Input
              value={form.firstName || ''}
              onChange={e => handleFormChange('firstName', e.target.value)}
              placeholder="First Name"
            />
            <Input
              value={form.lastName || ''}
              onChange={e => handleFormChange('lastName', e.target.value)}
              placeholder="Last Name"
            />
            <Input
              value={form.email || ''}
              onChange={e => handleFormChange('email', e.target.value)}
              placeholder="Email"
            />
            <Input
              value={form.phone || ''}
              onChange={e => handleFormChange('phone', e.target.value)}
              placeholder="Phone"
            />

            <h4>Address</h4>
            <Input
              value={form.address?.street || ''}
              onChange={e => handleAddressChange('street', e.target.value)}
              placeholder="Street"
            />
            <Input
              value={form.address?.city || ''}
              onChange={e => handleAddressChange('city', e.target.value)}
              placeholder="City"
            />
            <Input
              value={form.address?.state || ''}
              onChange={e => handleAddressChange('state', e.target.value)}
              placeholder="State"
            />
            <Input
              value={form.address?.country || ''}
              onChange={e => handleAddressChange('country', e.target.value)}
              placeholder="Country"
            />
            <Input
              value={form.address?.zipCode || ''}
              onChange={e => handleAddressChange('zipCode', e.target.value)}
              placeholder="Zip Code"
            />

            <ModalActions>
              <Button onClick={() => { setNewModalOpen(false); setEditModalOpen(false); }}>Cancel</Button>
              <Button onClick={newModalOpen ? handleNewSubmit : handleEditSubmit}>
                {newModalOpen ? 'Create' : 'Save'}
              </Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {deleteModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Confirm Delete</ModalTitle>
            <p>Are you sure you want to delete this client?</p>
            <ModalActions>
              <Button onClick={() => setDeleteModalOpen(false)}>No</Button>
              <Button onClick={handleDeleteConfirm}>Yes</Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Clients;
