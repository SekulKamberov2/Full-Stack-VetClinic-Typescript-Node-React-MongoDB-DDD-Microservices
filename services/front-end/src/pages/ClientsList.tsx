import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchClients, setSearchTerm } from '../store/clientsSlice';
import styled, { keyframes } from 'styled-components'; 

interface Client {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  pets?: Pet[];
  isActive: boolean;
}

interface Pet {
  _id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  dateOfBirth: string;
  weight: number;
  color: string;
  gender: string;
  profileImage?: string;
  microchipNumber?: string;
  insuranceNumber?: string;
  medicalHistory?: any[];
  dietaryRestrictions?: string[];
  vaccinationRecords?: any[];
  awards?: any[];
  isActive: boolean;
  clientId: string;
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
`;

const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1a2027;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 24px;
  margin-top: 24px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  }

  &::placeholder {
    color: #9e9e9e;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9e9e9e;
  
  &::before {
    content: '';
    font-size: 1.2rem;
  }
`;

const ClientsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const ClientCard = styled.div<{ $isActive: boolean }>`
  box-sizing: border-box;
  background: white;
  border-radius: 9px;
  padding: 20px;
 
  border: 2px solid ${({ $isActive }) => $isActive ? '#1976d2' : 'transparent'};
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  opacity: ${({ $isActive }) => $isActive ? 1 : 0.7};
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    border-color: black; 
  }
`;


const ClientHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const ClientInfo = styled.div`
  flex: 1;
`;

const ClientName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1a2027;
`;

const ClientDetail = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin: 2px 0;
`;

const StatusChip = styled.span<{ $isActive: boolean }>`
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.$isActive ? '#4caf50' : '#9e9e9e'};
  color: white;
`;

const PetsIndicator = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  border: 1px dashed #e0e0e0;
`;

const PetsIndicatorText = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const PopupContent = styled.div`
  background: #DCE3EE;
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.3s ease-out;
`;

const PopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
`;

const PopupTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a2027;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 6px;
  
  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const ClientHeaderPopup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const ClientAvatar = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #1976d2;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin-right: 16px;
`;

const ClientInfoPopup = styled.div`
  flex: 1;
`;

const ClientNamePopup = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1a2027;
`;

const ClientContact = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin: 0;
`;

const PetsSectionPopup = styled.div`
  margin-top: 20px;
`;

const PetsTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #1a2027;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PetsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const PetItem = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 9px;
  padding: 16px;
  background: white;
  transition: all 0.2s ease;

  &:hover {
    border-color: #1976d2;
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1);
  }
`;

const PetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const PetInfo = styled.div`
  flex: 1;
`;

const PetName = styled.h5`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1a2027;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PetDetails = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin: 0;
`;

const PetChip = styled.span<{ $isActive: boolean }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  background: ${props => props.$isActive ? '#1976d2' : '#9e9e9e'};
  color: white;
`;

const AddButton = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid #1976d2;
  border-radius: 9px;
  background: ${props => props.disabled ? '#f5f5f5' : 'transparent'};
  color: ${props => props.disabled ? '#9e9e9e' : '#1976d2'};
  font-size: 0.75rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #1976d2;
    color: white;
  }

  &::before {
    content: '+';
    font-weight: bold;
  }
`;

const PetDetailsExpanded = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`;

const PetInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-size: 0.75rem;
  color: #666;
  margin-bottom: 2px;
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 0.875rem;
  color: #1a2027;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  margin-top: 48px;
  color: #666;
`;

const EmptyText = styled.p`
  font-size: 1.125rem;
  margin: 0;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1976d2;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto;
`;

const ErrorAlert = styled.div`
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 9px;
  padding: 16px;
  margin-bottom: 24px;
  color: #c62828;
`;

const ClientsList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { clients, filteredClients, loading, error, searchTerm } = useSelector(
    (state: RootState) => state.clients
  );

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showPopup, setShowPopup] = useState(false);
 
  useEffect(() => { 
    dispatch(fetchClients());
  }, [dispatch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleClientClick = (client: Client) => {
    setSelectedClient(client);
    setShowPopup(true);
  };

  const handleAddPet = (client: Client, pet: Pet) => {
    const plainClient = {
      _id: client.id || client._id || '',
      firstName: client.firstName || '',
      lastName: client.lastName || '',
      email: client.email || '',
      phone: client.phone || '',
      pets: client.pets || [],
      isActive: client.isActive || false
    };

    navigate('/create-patient', {
      state: {
        client: plainClient,
        pet: {
          id: pet._id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          dateOfBirth: pet.dateOfBirth,
          color: pet.color,
          gender: pet.gender,
          microchipNumber: pet.microchipNumber,
          ownerId: client.id || client._id || ''
        }
      }
    });
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedClient(null);
  };

  const getPetEmoji = (species: string) => {
    switch (species.toLowerCase()) {
      case 'dog': return 'Dog';
      case 'cat': return 'Cat';
      case 'bird': return 'Bird';
      case 'rabbit': return 'Rabbit';
      case 'fish': return 'Fish';
      default: return '';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <LoadingSpinner />
          <p style={{ marginTop: '16px', color: '#666' }}>Loading clients...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorAlert>
          Error loading clients: {error}
        </ErrorAlert>
        <Button 
          onClick={() => dispatch(fetchClients())}
          style={{ marginTop: '16px' }}
        >
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Clients & Pets</Title> 

      <Button    
        onClick={() => navigate('/profile')}
      >Profile
      </Button>

      <SearchContainer>
        <SearchIcon />
        <SearchInput
          type="text"
          placeholder="Search clients by name or email..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </SearchContainer>

      <ClientsGrid>
        {filteredClients.map((client) => (
          <ClientCard 
            key={client.id} 
            $isActive={client.isActive || false}
            onClick={() => handleClientClick(client)}
          >
            <ClientHeader>
              <ClientInfo>
                <ClientName>{client.firstName} {client.lastName}</ClientName>
                <ClientDetail>{client.email}</ClientDetail>
                <ClientDetail>{client.phone}</ClientDetail>
              </ClientInfo>
              <StatusChip $isActive={client.isActive || false}>
                {client.isActive ? 'Active' : 'Inactive'}
              </StatusChip>
            </ClientHeader>

            <PetsIndicator>
              <PetsIndicatorText> 
                Click to view {client.pets?.length || 0} pets
              </PetsIndicatorText>
            </PetsIndicator>
          </ClientCard>
        ))}
      </ClientsGrid>

      {showPopup && selectedClient && (
        <PopupOverlay onClick={handleClosePopup}>
          <PopupContent onClick={(e) => e.stopPropagation()}>
            <PopupHeader>
              <PopupTitle> 
                Client Details
              </PopupTitle>
              <CloseButton onClick={handleClosePopup}>×</CloseButton>
            </PopupHeader>

            <ClientHeaderPopup>
              <ClientAvatar>
                {getInitials(selectedClient.firstName, selectedClient.lastName)}
              </ClientAvatar>
              <ClientInfoPopup>
                <ClientNamePopup>
                  {selectedClient.firstName} {selectedClient.lastName}
                </ClientNamePopup>
                <ClientContact>{selectedClient.email}</ClientContact>
                <ClientContact>{selectedClient.phone}</ClientContact> 
              </ClientInfoPopup>                
              <StatusChip $isActive={selectedClient.isActive || false}>
                {selectedClient.isActive ? 'Active' : 'Inactive'}
              </StatusChip>
            </ClientHeaderPopup>

            <PetsSectionPopup>
              <PetsTitle>
                Pets ({selectedClient.pets?.length || 0})
              </PetsTitle>

              {(selectedClient.pets?.length || 0) === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  No pets registered for this client
                </div>
              ) : (
                <PetsList>
                  {selectedClient.pets?.map((pet) => (
                    <PetItem key={pet._id}>
                      <PetHeader>
                        <PetInfo>
                          <PetName>
                            {pet.name}
                          </PetName>
                          <PetDetails>
                            <b>{pet.species} </b>| {pet.breed} | {pet.age} years | {pet.color}
                          </PetDetails>
                        </PetInfo>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <PetChip $isActive={pet.isActive}>
                            {pet.isActive ? 'Active' : 'Inactive'}
                          </PetChip>
                          <AddButton
                            onClick={() => handleAddPet(selectedClient, pet)}
                            disabled={!pet.isActive}
                          >
                            Add
                          </AddButton>
                        </div>
                      </PetHeader>
                      
                      <PetDetailsExpanded>
                        <PetInfoGrid>
                          <InfoItem>
                            <InfoLabel>Date of Birth</InfoLabel>
                            <InfoValue>{formatDate(pet.dateOfBirth)}</InfoValue>
                          </InfoItem>
                          <InfoItem>
                            <InfoLabel>Weight</InfoLabel>
                            <InfoValue>{pet.weight} kg</InfoValue>
                          </InfoItem>
                          <InfoItem>
                            <InfoLabel>Gender</InfoLabel>
                            <InfoValue>{pet.gender}</InfoValue>
                          </InfoItem>
                          {pet.microchipNumber && (
                            <InfoItem>
                              <InfoLabel>Microchip</InfoLabel>
                              <InfoValue>{pet.microchipNumber}</InfoValue>
                            </InfoItem>
                          )}
                        </PetInfoGrid>
                        
                        {pet.dietaryRestrictions && pet.dietaryRestrictions.length > 0 && (
                          <InfoItem style={{ marginBottom: '8px' }}>
                            <InfoLabel>Dietary Restrictions</InfoLabel>
                            <InfoValue>{pet.dietaryRestrictions.join(', ')}</InfoValue>
                          </InfoItem>
                        )}

                        {pet.medicalHistory && pet.medicalHistory.length > 0 && (
                          <InfoItem>
                            <InfoLabel>Medical Records</InfoLabel>
                            <InfoValue>{pet.medicalHistory.length} records</InfoValue>
                          </InfoItem>
                        )}

                        {pet.vaccinationRecords && pet.vaccinationRecords.length > 0 && (
                          <InfoItem>
                            <InfoLabel>Vaccinations</InfoLabel>
                            <InfoValue>{pet.vaccinationRecords.length} records</InfoValue>
                          </InfoItem>
                        )}

                        {pet.awards && pet.awards.length > 0 && (
                          <InfoItem>
                            <InfoLabel>Awards</InfoLabel>
                            <InfoValue>{pet.awards.length} awards</InfoValue>
                          </InfoItem>
                        )}
                      </PetDetailsExpanded>
                    </PetItem>
                  ))}
                </PetsList>
              )}
            </PetsSectionPopup>
          </PopupContent>
        </PopupOverlay>
      )}

      {filteredClients.length === 0 && searchTerm && (
        <EmptyState>
          <EmptyText>No clients found matching "{searchTerm}"</EmptyText>
        </EmptyState>
      )}

      {filteredClients.length === 0 && !searchTerm && !loading && (
        <EmptyState>
          <EmptyText>No clients found</EmptyText>
        </EmptyState>
      )}
    </Container>
  );
};

const Button = styled.button`
  padding: 12px 24px;
  border: 1px solid #1976d2;
  border-radius: 9px;
  background: #1976d2;
  color: white; 
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #1565c0;
    border-color: #1565c0;
  }
`;

export default ClientsList;
