import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { fetchProfile, selectProfile, selectProfileLoading, selectProfileError, 
  updateProfile, deleteProfile, fetchPetHealthDetails, selectPetHealthDetails,
  selectPetHealthLoading, selectPetHealthError, clearPetHealthDetails
} from '../store/profileSlice';
import { RootState } from '../store';
import { useAppDispatch } from '../store/hooks';
import styled from 'styled-components'; 
import { petService } from '../services/petService'; 
import Button from '../components/Button';  
import { ButtonContainer } from '../components/ButtonContainer';
 
import { resetAllSlices } from '../store/rootActions';
import { authService } from '../services/authService';

const ProfileContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: #d5e1edff;
  border-radius: 30px;
  box-shadow: 0 14px 56px rgba(38, 34, 171, 0.1); 
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  gap: 2rem;
  margin-top: 3rem;
  margin-bottom: 1rem;
  padding-bottom: 2rem; 
  
  @media (min-width: 768px) {
    flex-direction: row;
    text-align: left;
    justify-content: center;
    align-items: center;
  }
`;

const ProfileImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const ProfileImage = styled.div<{ imageUrl?: string }>`
  width: 230px;
  height: 230px;
  border-radius: 50%;
  background: ${(props: { imageUrl?: string }) => props.imageUrl ? `url(${props.imageUrl})` : '#1E1E2F'};
  background-size: cover;
  background-position: center;
  border: 4px solid #1E1E2F;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  flex-shrink: 0;
`;

const ProfileButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  width: 100%;
`;

const ProfileButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 9px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.edit {
    border-radius: 9px;
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
  
  &.delete {
    border-radius: 9px;
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
`;

const DeleteMessage = styled.div`
  color: #dc3545;
  background: #f8d7da;
  padding: 0.5rem 1rem;
  border-radius: 9px;
  border: 1px solid #f5c6cb;
  font-size: 14px;
  text-align: center;
  margin-top: 0.5rem;
`;

const ProfileContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  
  @media (min-width: 768px) {
    justify-content: flex-start;
  }
`;

const ProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  @media (min-width: 768px) {
    align-items: flex-start;
    text-align: left;
  }
  
  h1 {
    margin: 0 0 0.5rem 0;
    color: #1E1E2F;
    font-size: 2.5rem;
  }
  
  .email {
    color: #6c757d;
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
`;
 
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 7rem; 
  font-size: 1.3rem;
`;

const PetCardContent = styled.div`
  position: relative;
  z-index: 5;
`;

const InfoCard = styled.div` 
  padding: 1.5rem; 
  
  h1 {
    margin: 0 0 1rem 0;
    color: #1E1E2F; 
    padding-bottom: 0.5rem;
  }
`;

const InfoItem = styled.div`  
  strong {
    color: #495057;
    display: inline-block;
    min-width: 80px;
  }
  
  span {
    color: #6c757d;
  }
`; 

const InlineWrapper = styled.div`
  display: flex; 
  width: 100%;
  margin-bottom: 0.65rem;
  font-size: 1.3rem;
  
  strong {
    color: #495057;
    display: inline-block;
    min-width: 160px;
  }
  
  span { 
    color: #6c757d;
  }
`; 

const PetsSection = styled.div`  
`;

const PetGridHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

    h1 {
    font-size: 2.5rem;
    margin: 0 0 1rem 0;
    color: #1E1E2F; 
    padding-bottom: 0.5rem;
  }
`; 

const PetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(410px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
  overflow: visible;   
`;

const PetCard = styled.div`
  background: #ecf2f7ff;
  padding: 0.5rem 1rem;
  font-size: 1.3rem;
  border-radius: 21px; 
  cursor: pointer;
  position: relative;
  overflow: visible;
  min-height: 120px;
  transition: all 0.3s ease;
  
  &:hover { 
    box-shadow: 0 14px 62px rgba(74, 96, 168, 0.1);
  }
`; 
  
const PetActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1.3rem;
  justify-content: flex-end;
  position: relative;
  z-index: 20;
`;

const PetActionButton = styled.button`
  padding: 6px 11px;
  border: none;
  border-radius: 9px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.Health {
    border-radius: 9px;
    border: 2px solid #C82333;
    background: #ffffffff; 
    color: red;
    
    &:hover {
      background: #dc3545; 
      color: white;
    }
  } 

  &.edit {
    border-radius: 9px;
    background: #eac04cff;
    color: white; 
    &:hover {
      background: #dca50eff;
    }
  } 
  
  &.delete {
    border-radius: 9px;
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
`; 

const Loading = styled.div`
  text-align: center;
  padding: 4rem;
  font-size: 1.2rem;
  color: #6c757d;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background: #f8d7da;
  padding: 1rem;
  border-radius: 9px;
  margin-bottom: 2rem;
  border: 1px solid #f5c6cb;
`;

const StatusBadge = styled.span<{ isActive: boolean }>`
  display: inline-block;
  padding: 4px 11px;
  margin-top: 0.4rem;
  margin-bottom: 1rem;
  border-radius: 9px;
  font-size: 1.3rem;
  font-weight: bold;
  background: ${(props: { isActive: boolean }) => props.isActive ? '#d4edda' : '#f8d7da'};
  color: ${(props: { isActive: boolean }) => props.isActive ? '#155724' : '#721c24'};
  border: 1px solid ${(props: { isActive: boolean }) => props.isActive ? '#c3e6cb' : '#f5c6cb'};
`;

const ModalOverlay = styled.div`
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
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 21px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const HealthModalContent = styled(ModalContent)`
  max-width: 800px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  background: #f8f9fa;
`;

const PetDetailsModal = styled(ModalContent)`
  max-width: 410px;
  width: 410px;
  padding: 1.5rem;
  background: #ecf2f7ff;
  border-radius: 21px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center; 
  
  h2 {
    margin: 0;
    color: #1E1E2F;
    font-size: 1.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  border-radius: 9px;
  &:hover {
    color: #1E1E2F;
  }
`; 

const Close = styled.button` 
  border: none;
  outline: none;
  background: transparent;
  font-size: 2rem;
  cursor: pointer;
  color: #6c757d; 

  &:focus {
    outline: none;
    box-shadow: none;
  }
`;
 
const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;
 
const ConfirmButton = styled.button`
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  
  &:hover {
    background: #c82333;
  }
`;
 
const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #495057;
  font-weight: bold;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 9px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 9px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const PetHeader = styled.h4`
  margin: 0 0 0.3rem 0;
  color: #1E1E2F;
  font-size: 1.3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HealthSection = styled.div`
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 21px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); 
`;

const HealthSectionTitle = styled.h1`
  margin: 0 0 1rem 0;
  color: #1E1E2F;
  font-size: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HealthItem = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 9px;
  border: 1px solid #e9ecef;
`;

const HealthItemTitle = styled.div`
  margin: 0.5rem 0 0.5rem 0;
  color: red;
  font-weight: 600;
  font-size: 1.5rem; 
`; 

const StatusContainer = styled.div` 
  display: flex;
  flex-direction: row; 
  border: 1px solid black;
`; 

const Badge = styled.span<{ variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 9px;
  font-size: 1rem;
  font-weight: bold; 
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
      case 'warning':
        return 'background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;';
      case 'danger':
        return 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;';
      case 'info':
        return 'background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;';
      default:
        return 'background: #007bff; color: white; border: 1px solid #007bff;';
    }
  }}
`;

const StatusIndicator = styled.div<{ status: string }>`
  display: inline-flex; 
  align-items: center;
  padding: 4px 12px;
  border-radius: 9px;
  font-size: 1rem;
  font-weight: bold; 
  
  ${props => {
    switch (props.status) {
      case 'critical':
      case 'severe':
        return 'background: #dc3545; color: white;';
      case 'moderate':
        return 'background: #ffc107; color: #212529;';
      case 'scheduled':
        return 'background: #17a2b8; color: white;';
      case 'active':
        return 'background: #28a745; color: white;';
      case 'inactive':
        return 'background: #6c757d; color: white;';
      default:
        return 'background: #6c757d; color: white;';
    }
  }}
`;

const ContainerStatusIndicator = styled.div`
  display: flex; 
  justify-content: start;  
  align-items: center;  
  margin-top: 0.1rem; 
  margin-left: -3rem; 
`; 

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  font-style: italic;
`;   

const MedicalAlertItem = styled(HealthItem)` 
  border-radius: 21px;
  background: #f8d7da;
`;

const AllergyItem = styled(HealthItem)` 
  border-radius: 21px;
  background: #fff3cd;
`;

const VaccinationItem = styled(HealthItem)<{ isOverdue: boolean; isDue: boolean }>` 
  border-radius: 21px;
  background: ${props => props.isOverdue ? '#f8d7da' : props.isDue ? '#fff3cd' : '#d4edda'};
`;

const VisitItem = styled(HealthItem)` 
  border-radius: 21px;
  background: #d1ecf1;
`;

const NoteItem = styled(HealthItem)` 
  border-radius: 21px;
  background: #e2e3e5;
`;

const PetCardComponent = React.memo(({ 
  pet, 
  onViewDetails, 
  onEdit, 
  onDelete, 
  onHealth,
  formatDate 
}: { 
  pet: any;
  onViewDetails: (pet: any, e: React.MouseEvent) => void;
  onEdit: (pet: any, e: React.MouseEvent) => void;
  onDelete: (pet: any, e: React.MouseEvent) => void;
  onHealth: (pet: any, e: React.MouseEvent) => void;
  formatDate: (date: string) => string;
}) => (
  <PetCard 
    key={pet._id} 
    onClick={(e) => onViewDetails(pet, e)}
  >
    <PetCardContent>
      <InfoItem> 
        <StatusBadge isActive={pet.isActive}>
          {pet.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      </InfoItem>
      <PetHeader>
        {pet.name} <strong>{pet.species}</strong>
      </PetHeader>
      <PetHeader>
        {pet.breed} <strong>{pet.age} years</strong>
      </PetHeader> 
    </PetCardContent>
    
    <PetActions>
      <Button 
        height="35px" 
        size="small" 
        color="red" 
        backgroundColor="white" 
        hoverBackground="#f5f5f5ff"
        fontSize='1rem' 
        border="2px solid red"
        onClick={(e) => {
          e.stopPropagation();
          onHealth(pet, e);
        }}
      >
        Health
      </Button>
      <Button 
        height="35px" 
        size="small" 
        color="white" 
        backgroundColor="#FFA500" 
        hoverBackground="#de8510ff"
        fontSize='1rem'  
        onClick={(e) => {
          e.stopPropagation();
          onEdit(pet, e);
        }}
      >
        Edit
      </Button>
      <Button 
        height="35px" 
        size="small" 
        color="white" 
        backgroundColor="red" 
        hoverBackground="#b81323ff"
        fontSize='1rem' 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(pet, e);
        }}
      >
        Delete
      </Button>
    </PetActions>
  </PetCard>
));

PetCardComponent.displayName = 'PetCardComponent';

const Profile: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();  
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const profile = useSelector(selectProfile);
  const loading = useSelector(selectProfileLoading);
  const error = useSelector(selectProfileError); 
  const petHealthDetails = useSelector(selectPetHealthDetails);
  const petHealthLoading = useSelector(selectPetHealthLoading);
  const petHealthError = useSelector(selectPetHealthError);
  
  const [modalState, setModalState] = useState({
    showEditModal: false,
    showDeleteModal: false,
    showAddPetModal: false,
    showEditPetModal: false,
    showDeletePetModal: false,
    showPetDetailsModal: false,
    showPetHealthModal: false
  });
  const [deleteMessage, setDeleteMessage] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  
  const [petFormData, setPetFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    dateOfBirth: '',
    weight: '',
    color: '',
    gender: '',
    microchipNumber: '',
    insuranceNumber: ''
  });
 
  useEffect(() => { 
  }, [petHealthLoading, petHealthError, petHealthDetails, modalState, selectedPet]);
 

  const profileInitials = useMemo(() => {
    return profile ? `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`.toUpperCase() : '';
  }, [profile?.firstName, profile?.lastName]);

  const petsCount = useMemo(() => profile?.pets?.length || 0, [profile?.pets]);
 

const handleLogout = useCallback(async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    dispatch(resetAllSlices());
    navigate('/login');
  }
}, [dispatch, navigate]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const handleViewPetDetails = useCallback((pet: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPet(pet);
    setModalState(prev => ({ ...prev, showPetDetailsModal: true }));
  }, []);

  const handleCloseModals = useCallback(() => {
    setModalState({
      showEditModal: false,
      showDeleteModal: false,
      showAddPetModal: false,
      showEditPetModal: false,
      showDeletePetModal: false,
      showPetDetailsModal: false,
      showPetHealthModal: false
    });
    setSelectedPet(null);
    dispatch(clearPetHealthDetails());
  }, [dispatch]);

  const handleEditProfile = useCallback(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        address: {
          street: profile.address?.street || '',
          city: profile.address?.city || '',
          state: profile.address?.state || '',
          zipCode: profile.address?.zipCode || '',
          country: profile.address?.country || ''
        }
      });
    }
    setModalState(prev => ({ ...prev, showEditModal: true }));
  }, [profile]);

  const handleDeleteProfile = useCallback(() => {
    setModalState(prev => ({ ...prev, showDeleteModal: true }));
  }, []);

  const handleAddPet = useCallback(() => {
    setPetFormData({
      name: '',
      species: '',
      breed: '',
      age: '',
      dateOfBirth: '',
      weight: '',
      color: '',
      gender: '',
      microchipNumber: '',
      insuranceNumber: ''
    });
    setModalState(prev => ({ ...prev, showAddPetModal: true }));
  }, []);

  const handleEditPet = useCallback((pet: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPet(pet);
    setPetFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age.toString(),
      dateOfBirth: pet.dateOfBirth.split('T')[0],
      weight: pet.weight.toString(),
      color: pet.color,
      gender: pet.gender,
      microchipNumber: pet.microchipNumber || '',
      insuranceNumber: pet.insuranceNumber || ''
    });
    setModalState(prev => ({ ...prev, showEditPetModal: true }));
  }, []);

  const handleDeletePet = useCallback((pet: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPet(pet);
    setModalState(prev => ({ ...prev, showDeletePetModal: true }));
  }, []);

  const handleHealthClick = useCallback(async (pet: any, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Health button clicked for pet:', pet.name, 'Pet ID:', pet._id);
    
    setSelectedPet(pet);
    
    setModalState(prev => ({ ...prev, showPetHealthModal: true }));
    
    if (profile) {
      try {
        await dispatch(fetchPetHealthDetails({ 
          ownerId: profile.id, 
          patientId: pet._id 
        }));
        console.log('Health details fetch completed');
      } catch (error) {
        console.error('Failed to fetch health details:', error);
      }
    } else {
      console.error('No profile found when clicking health button');
    }
  }, [dispatch, profile]);

  const handleConfirmDelete = useCallback(async () => {
    try {
      await dispatch(deleteProfile()).unwrap();
      setModalState(prev => ({ ...prev, showDeleteModal: false }));
      setDeleteMessage(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  }, [dispatch, navigate]);

  const handleSaveEdit = useCallback(async () => {
    try {
      if (profile) {
        const updatedData = {
          id: profile.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          profileImage: profile.profileImage,
          address: formData.address
        };
        
        await dispatch(updateProfile(updatedData)).unwrap();
        setModalState(prev => ({ ...prev, showEditModal: false }));
        dispatch(fetchProfile());
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  }, [profile, formData, dispatch]);

  const handleSavePet = useCallback(async () => {
    try {
      if (modalState.showAddPetModal) {
        const petData = {
          name: petFormData.name,
          species: petFormData.species,
          breed: petFormData.breed,
          age: parseInt(petFormData.age),
          dateOfBirth: petFormData.dateOfBirth,
          weight: parseFloat(petFormData.weight),
          color: petFormData.color,
          gender: petFormData.gender as 'Male' | 'Female',
          microchipNumber: petFormData.microchipNumber || undefined,
          insuranceNumber: petFormData.insuranceNumber || undefined,
          dietaryRestrictions: [],
          vaccinationRecords: [],
          awards: [],
          isActive: true,
          clientId: profile?.id
        };
        
        const response = await petService.createPet(petData);
        
        if (response.success) {
          setModalState(prev => ({ ...prev, showAddPetModal: false }));
          dispatch(fetchProfile());
        }
      } else if (modalState.showEditPetModal && selectedPet) { 
        const petData = {
          name: petFormData.name,
          species: petFormData.species,
          breed: petFormData.breed,
          age: parseInt(petFormData.age),
          dateOfBirth: petFormData.dateOfBirth,
          weight: parseFloat(petFormData.weight),
          color: petFormData.color,
          gender: petFormData.gender as 'Male' | 'Female',
          microchipNumber: petFormData.microchipNumber || undefined,
          insuranceNumber: petFormData.insuranceNumber || undefined
        };
         
        const response = await petService.updatePet(selectedPet._id, petData);
        
        if (response.success) {
          setModalState(prev => ({ ...prev, showEditPetModal: false }));
          setSelectedPet(null); 
          dispatch(fetchProfile());
        }
      }
    } catch (error) {
      console.error('Failed to save pet:', error); 
    }
  }, [modalState.showAddPetModal, modalState.showEditPetModal, selectedPet, petFormData, profile?.id, dispatch]);

  const handleConfirmDeletePet = useCallback(async () => {
    try {
      if (selectedPet) {
        const response = await petService.deletePet(selectedPet._id);
        if (response.success) {
          setModalState(prev => ({ ...prev, showDeletePetModal: false }));
          setSelectedPet(null); 
          dispatch(fetchProfile());
        } else {
          console.error('Delete failed - response not successful:', response);
        }
      } else {
        console.error('No selected pet to delete');
      }
    } catch (error: any) {
      console.error('Failed to delete pet:', error);
      console.error('Error details:', error.response?.data || error.message); 
    }
  }, [selectedPet, dispatch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  const handlePetInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPetFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  useEffect(() => {
    if (isAuthenticated) { 
      if (!profile) {
        dispatch(fetchProfile());
      }
    }
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    navigate('/login');
    return <Loading>Redirecting to login...</Loading>;
  }

  if (loading && !profile) {
    return <Loading>Loading profile...</Loading>;
  }

  if (error && !profile) {
    return (
      <ProfileContainer>
        <ErrorMessage>Error: {error}</ErrorMessage>
        <Button onClick={() => dispatch(fetchProfile())}>Retry</Button>
        <Button borderRadius="12px" fontSize="18px" onClick={handleLogout}>Logout</Button>
      </ProfileContainer>
    );
  }

  if (!profile) {
    return (
      <ProfileContainer>
        <ProfileHeader>
          <ProfileImageContainer>
            <ProfileImage>
              Name
            </ProfileImage>
            <ProfileButtons>
              <ProfileButton className="edit" onClick={handleEditProfile}>
                Edit
              </ProfileButton>
              <ProfileButton className="delete" onClick={handleDeleteProfile}>
                Delete
              </ProfileButton>  
            </ProfileButtons>
          </ProfileImageContainer>
          <ProfileContent>
            <ProfileInfo>
              <h1>User Profile</h1>
              <div className="email">user@gmail.com</div> 
              <InfoItem>
                <strong>Member Since:</strong>
                <span>Loading...</span>
              </InfoItem>
              <InfoItem>
                <strong>Last Updated:</strong>
                <span>Loading...</span>
              </InfoItem>
              <StatusBadge isActive={true}>
                Active
              </StatusBadge>
            </ProfileInfo> 
          </ProfileContent>
        </ProfileHeader>

        <InfoGrid>
          <InfoCard>
            <h3>Authentication Status</h3>
            <InfoItem>
              <strong>Status:</strong>
              <span>Authenticated</span>
            </InfoItem>
            <InfoItem>
              <strong>Access:</strong>
              <span>Full access granted</span>
            </InfoItem>
          </InfoCard>

          <InfoCard>
            <h1>Profile Information</h1>
            <InfoItem>
              <strong>Note:</strong>
              <span>User data not loaded</span>
            </InfoItem>
            <InfoItem>
              <strong>Action:</strong>
              <span>User profile would be displayed here</span>
            </InfoItem>
          </InfoCard>
        </InfoGrid>

        <ButtonContainer> 
          <Button borderRadius="12px" fontSize="18px" onClick={handleLogout}>Logout</Button>
        </ButtonContainer>
        
      </ProfileContainer>
    );
  }

  const { 
    showEditModal, 
    showDeleteModal, 
    showAddPetModal, 
    showEditPetModal, 
    showDeletePetModal,
    showPetDetailsModal,
    showPetHealthModal 
  } = modalState;
console.log('profile profile profile', profile)
  return ( 
    <ProfileContainer>
      <ProfileHeader>
        <ProfileImageContainer>
          <ProfileImage imageUrl={profile.profileImage}>
            {!profile.profileImage && profileInitials}
          </ProfileImage>
          <ProfileButtons>
            <Button 
              fontSize="1rem"
              size="small" 
              backgroundColor="#f8b029ff"
              hoverBackground="#e7a223ff"
              onClick={handleEditProfile}
            >
              Edit
            </Button>
            <Button 
              fontSize="1rem" 
              size="small" 
              backgroundColor="red"
              hoverBackground="#B81323"
              onClick={handleDeleteProfile}
            >
              Delete
            </Button> 
            {profile.role === 'vet' &&
              <Button 
                fontSize="1rem" 
                size="small" 
                backgroundColor="#18c956ff"
                hoverBackground="#076911ff"
                onClick={() => navigate('/clients-list')}
              >
                Clients
              </Button> 
            }  
          </ProfileButtons>
          {deleteMessage && (
            <DeleteMessage>
              Your profile will be deleted soon
            </DeleteMessage>
          )}
        </ProfileImageContainer>
        <ProfileContent>
          <ProfileInfo>
            <h1>{profile.role == 'vet' ? "Dr." : ""} {profile.firstName} {profile.lastName}</h1>
            <div className="email">{profile.email}  <span>| Pets {petsCount}</span></div> 
            <InfoItem>
              <div> 
                <strong>Member:</strong>
                <span>{formatDate(profile.createdAt)}</span>
              </div>
              <strong>Updated:</strong>
              <span>{formatDate(profile.updatedAt)}</span>  
            </InfoItem>  
            <StatusBadge isActive={profile.isActive}>
              {profile.isActive ? 'Active' : 'Inactive'}
            </StatusBadge>
          </ProfileInfo> 
        </ProfileContent>
      </ProfileHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <InfoGrid>
        <InfoCard>
          <h1>Info</h1> 
          <InlineWrapper>
            <strong>First Name:</strong>
            <span>{profile.firstName}</span>
          </InlineWrapper>
          <InlineWrapper>
            <strong>Last Name:</strong>
            <span>{profile.lastName}</span>
          </InlineWrapper>
          <InlineWrapper>
            <strong>Email:</strong>
            <span>{profile.email}</span>
          </InlineWrapper>
          <InlineWrapper>
            <strong>Phone:</strong>
            <span>{profile.phone || 'Not provided'}</span>
          </InlineWrapper>
        </InfoCard>

        <InfoCard>
          <h1>Address</h1>
          <InlineWrapper>
            <strong>Street:</strong>
            <span>{profile.address?.street || 'Not provided'}</span>
          </InlineWrapper>
          <InlineWrapper>
            <strong>City:</strong>
            <span>{profile.address?.city || 'Not provided'}</span>
          </InlineWrapper>
          <InlineWrapper>
            <strong>State:</strong>
            <span>{profile.address?.state || 'Not provided'}</span>
          </InlineWrapper>
          <InlineWrapper>
            <strong>ZIP Code:</strong>
            <span>{profile.address?.zipCode || 'Not provided'}</span>
          </InlineWrapper>
          <InlineWrapper>
            <strong>Country:</strong>
            <span>{profile.address?.country || 'Not provided'}</span>
          </InlineWrapper>
        </InfoCard>
      </InfoGrid>

      <PetsSection> 
        <PetGridHeader>
          <h1>Pets</h1> 
          <Button borderRadius="12px" fontSize="18px" onClick={handleAddPet}> New Pet</Button>
        </PetGridHeader>
        
        {!profile.pets || profile.pets.length === 0 ? (
          <p>No pets registered.</p>
        ) : (
          <PetGrid>
            {profile.pets.map((pet) => (
              <PetCardComponent
                key={pet._id}
                pet={pet}
                onViewDetails={handleViewPetDetails}
                onEdit={handleEditPet}
                onDelete={handleDeletePet}
                onHealth={handleHealthClick}
                formatDate={formatDate}
              />
            ))}
          </PetGrid>
        )} 
      </PetsSection>
      <ButtonContainer alignItems="flex-start" margin="1rem 0 0 0"> 
        <Button borderRadius="12px" fontSize="18px" width="6rem" onClick={handleLogout}>Logout</Button>
      </ButtonContainer>
      {showPetDetailsModal && selectedPet && (
        <ModalOverlay onClick={handleCloseModals}>
          <PetDetailsModal onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2></h2>
              <Close onClick={handleCloseModals}>×</Close>
            </ModalHeader>
            <div>  
              <InlineWrapper><strong>Name:</strong><span>{selectedPet.name}</span></InlineWrapper>
              <InlineWrapper><strong>Species:</strong><span>{selectedPet.species}</span></InlineWrapper>
              <InlineWrapper><strong>Breed:</strong><span>{selectedPet.breed}</span></InlineWrapper>
              <InlineWrapper><strong>Age:</strong><span>{selectedPet.age} years</span></InlineWrapper>
              <InlineWrapper><strong>Weight:</strong><span>{selectedPet.weight} kg</span></InlineWrapper>
              <InlineWrapper><strong>Color:</strong><span>{selectedPet.color}</span></InlineWrapper>
              <InlineWrapper><strong>Gender:</strong><span>{selectedPet.gender}</span></InlineWrapper>
              <InlineWrapper><strong>Birth Date:</strong><span>{formatDate(selectedPet.dateOfBirth)}</span></InlineWrapper>
              <InlineWrapper><strong>Microchip:</strong><span>{selectedPet.microchipNumber || 'N/A'}</span></InlineWrapper>
              <InlineWrapper><strong>Insurance:</strong><span>{selectedPet.insuranceNumber || 'N/A'}</span></InlineWrapper>
            </div> 
          </PetDetailsModal>
        </ModalOverlay>
      )}

      {showPetHealthModal && (
        <ModalOverlay onClick={handleCloseModals}>
          <HealthModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h1>Health Records - {selectedPet?.name}</h1>
              <Close onClick={handleCloseModals}>×</Close>
            </ModalHeader>
            
            {petHealthLoading && <Loading>Loading health records...</Loading>}
            
            {petHealthError && (
              <ErrorMessage>
                Error loading health records: {petHealthError}
              </ErrorMessage>
            )}
            
            {petHealthDetails ? (
              <div>
                <HealthSection>
                  <HealthSectionTitle>
                    Patient Info
                  </HealthSectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <InlineWrapper>
                      <strong>Name:</strong>
                      <span>{petHealthDetails.patient.name}</span>
                    </InlineWrapper>
                    <InlineWrapper>
                      <strong>Species:</strong>
                      <span>{petHealthDetails.patient.species}</span>
                    </InlineWrapper>
                    <InlineWrapper>
                      <strong>Breed:</strong>
                      <span>{petHealthDetails.patient.breed}</span>
                    </InlineWrapper>
                    <InlineWrapper>
                      <strong>Date of Birth:</strong>
                      <span>{formatDate(petHealthDetails.patient.dateOfBirth)}</span>
                    </InlineWrapper>
                    <InlineWrapper>
                      <strong>Microchip:</strong>
                      <span>{petHealthDetails.patient.microchipNumber || 'Not provided'}</span>
                    </InlineWrapper>
                    <InlineWrapper>
                      <strong>Status:</strong>
                      <ContainerStatusIndicator> 
                        <StatusIndicator status={petHealthDetails.patient.isActive ? 'active' : 'inactive'}>
                          {petHealthDetails.patient.isActive ? 'Active' : 'Inactive'}
                        </StatusIndicator>
                      </ContainerStatusIndicator>
                    </InlineWrapper>
                  </div>
                </HealthSection>

                <HealthSection>
                  <HealthSectionTitle>
                    Medical Alerts - {petHealthDetails.medicalAlerts.length}
                  </HealthSectionTitle>
                  {petHealthDetails.medicalAlerts.length > 0 ? (
                    petHealthDetails.medicalAlerts.map((alert) => (
                      <MedicalAlertItem key={alert.id}>
                        <StatusIndicator status={alert.severity}>
                          {alert.severity.toUpperCase()}
                        </StatusIndicator>
                        <HealthItemTitle>
                          {alert.alertText}  
                        </HealthItemTitle>
                        <InlineWrapper>
                          <strong>Created:</strong>
                          <span>{formatDate(alert.dateCreated)} by {alert.createdBy}</span>
                        </InlineWrapper>
                        {alert.notes && (
                          <InlineWrapper>
                            <strong>Notes:</strong>
                            <span>{alert.notes}</span>
                          </InlineWrapper>
                        )}
                        <InlineWrapper>
                          <strong>Status:</strong>
                          <StatusIndicator status={alert.isActive ? 'active' : 'inactive'}>
                            {alert.isActive ? 'Active' : 'Inactive'}
                          </StatusIndicator>
                        </InlineWrapper>
                      </MedicalAlertItem>
                    ))
                  ) : (
                    <EmptyState>No medical alerts recorded</EmptyState>
                  )}
                </HealthSection>

                <HealthSection>
                  <HealthSectionTitle>
                    Allergies - {petHealthDetails.allergies.length}
                  </HealthSectionTitle>
                  {petHealthDetails.allergies.length > 0 ? (
                    petHealthDetails.allergies.map((allergy) => (
                      <AllergyItem key={allergy.id}>
                        <StatusIndicator status={allergy.severity}>
                          {allergy.severity.toUpperCase()}
                        </StatusIndicator>
                        <HealthItemTitle>
                          {allergy.allergen} 
                        </HealthItemTitle>
                        <InlineWrapper>
                          <strong>Reaction:</strong>
                          <span>{allergy.reaction}</span>
                        </InlineWrapper>
                        <InlineWrapper>
                          <strong>First Observed:</strong>
                          <span>{formatDate(allergy.firstObserved)}</span>
                        </InlineWrapper>
                        {allergy.notes && (
                          <InlineWrapper>
                            <strong>Notes:</strong>
                            <span>{allergy.notes}</span>
                          </InlineWrapper>
                        )}
                        <InlineWrapper>
                          <strong>Status:</strong>
                          <StatusIndicator status={allergy.isActive ? 'active' : 'inactive'}>
                            {allergy.isActive ? 'Active' : 'Inactive'}
                          </StatusIndicator>
                        </InlineWrapper>
                      </AllergyItem>
                    ))
                  ) : (
                    <EmptyState>No allergies recorded</EmptyState>
                  )}
                </HealthSection>

                <HealthSection>
                  <HealthSectionTitle>
                    Vaccinations - {petHealthDetails.vaccinationRecords.length}
                  </HealthSectionTitle>
                  {petHealthDetails.vaccinationRecords.length > 0 ? (
                    petHealthDetails.vaccinationRecords.map((vaccine) => (
                      <VaccinationItem 
                        key={vaccine.id} 
                        isOverdue={vaccine.isOverdue} 
                        isDue={vaccine.isDue}
                      >
                        {vaccine.isOverdue && (
                          <StatusIndicator status="critical">OVERDUE</StatusIndicator>
                        )}
                        {vaccine.isDue && !vaccine.isOverdue && (
                          <StatusIndicator status="moderate">DUE SOON</StatusIndicator>
                        )}
                        {!vaccine.isDue && !vaccine.isOverdue && (
                          <StatusIndicator status="success">CURRENT</StatusIndicator>
                        )}
                        <HealthItemTitle>
                          {vaccine.vaccineName} 
                        </HealthItemTitle>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <InlineWrapper>
                            <strong>Administered:</strong>
                            <span>{formatDate(vaccine.dateAdministered)}</span>
                          </InlineWrapper>
                          <InlineWrapper>
                            <strong>Next Due:</strong>
                            <span>{formatDate(vaccine.nextDueDate)}</span>
                          </InlineWrapper>
                          <InlineWrapper>
                            <strong>By:</strong>
                            <span>{vaccine.administeredBy}</span>
                          </InlineWrapper>
                          <InlineWrapper>
                            <strong>Manufacturer:</strong>
                            <span>{vaccine.manufacturer}</span>
                          </InlineWrapper>
                        </div>
                        {vaccine.lotNumber && (
                          <InlineWrapper>
                            <strong>Lot Number:</strong>
                            <span>{vaccine.lotNumber}</span>
                          </InlineWrapper>
                        )}
                        {vaccine.notes && (
                          <InlineWrapper>
                            <strong>Notes:</strong>
                            <span>{vaccine.notes}</span>
                          </InlineWrapper>
                        )}
                      </VaccinationItem>
                    ))
                  ) : (
                    <EmptyState>No vaccination records</EmptyState>
                  )}
                </HealthSection>

                <HealthSection>
                  <HealthSectionTitle>
                    Medical Notes - {petHealthDetails.patientNotes.length}
                  </HealthSectionTitle>
                  
                  {petHealthDetails.patientNotes.length > 0 ? (
                    petHealthDetails.patientNotes.map((note) => (
                      <NoteItem key={note.id}> 
                       <Badge variant="info">{note.weight} kg</Badge>
                        <HealthItemTitle>
                          {note.noteType.charAt(0).toUpperCase() + note.noteType.slice(1)} Note 
                        </HealthItemTitle>
                        <InlineWrapper>
                          <strong>Date:</strong>
                          <span>{formatDate(note.dateCreated)}</span>
                        </InlineWrapper>
                        <InlineWrapper style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                          <strong>Notes:</strong>
                          <span style={{ marginTop: '0.5rem', lineHeight: '1.5' }}>{note.noteText}</span>
                        </InlineWrapper>
                      </NoteItem>
                    ))
                  ) : (
                    <EmptyState>No medical notes recorded</EmptyState>
                  )}
                </HealthSection>

                <HealthSection>
                  <HealthSectionTitle>
                    Upcoming Visits - {petHealthDetails.visits.length}
                  </HealthSectionTitle>
                  {petHealthDetails.visits.length > 0 ? (
                    petHealthDetails.visits.map((visit) => (
                      <VisitItem key={visit.id}>
                        <StatusIndicator status={visit.status}>
                          {visit.status.toUpperCase()}
                        </StatusIndicator>
                        <HealthItemTitle>
                          {visit.type.charAt(0).toUpperCase() + visit.type.slice(1)} Visit 
                        </HealthItemTitle>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <InlineWrapper>
                            <strong>Scheduled:</strong>
                            <span>{formatDate(visit.scheduledDateTime)}</span>
                          </InlineWrapper>
                          <InlineWrapper>
                            <strong>Type:</strong>
                            <span>{visit.type}</span>
                          </InlineWrapper>
                          <InlineWrapper>
                            <strong>Reason:</strong>
                            <span>{visit.chiefComplaint}</span>
                          </InlineWrapper>
                          <InlineWrapper>
                            <strong>Status:</strong>
                            <span>{visit.status}</span>
                          </InlineWrapper>
                        </div>
                        {visit.notes && (
                          <InlineWrapper>
                            <strong>Notes:</strong>
                            <span>{visit.notes}</span>
                          </InlineWrapper>
                        )}
                      </VisitItem>
                    ))
                  ) : (
                    <EmptyState>No upcoming visits scheduled</EmptyState>
                  )}
                </HealthSection>
              </div>
            ) : (
              !petHealthLoading && !petHealthError && (
                <EmptyState>No health data available for this pet.</EmptyState>
              )
            )} 
            <Button fontSize="1rem" size="small" onClick={handleCloseModals}>Close</Button>
          </HealthModalContent>
        </ModalOverlay>
      )}
 
      {showEditModal && (
        <ModalOverlay onClick={handleCloseModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Edit Profile</h2>
              <Close onClick={handleCloseModals}>×</Close>
            </ModalHeader>
            <div>
              <FormGroup>
                <FormLabel>First Name</FormLabel>
                <FormInput
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Last Name</FormLabel>
                <FormInput
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Email</FormLabel>
                <FormInput
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Phone</FormLabel>
                <FormInput
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Street</FormLabel>
                <FormInput
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>City</FormLabel>
                <FormInput
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>State</FormLabel>
                <FormInput
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>ZIP Code</FormLabel>
                <FormInput
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Country</FormLabel>
                <FormInput
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </div>
            <ModalActions>
              <Button fontSize="1rem" size="small" onClick={handleCloseModals}>Cancel</Button>
              <Button 
                fontSize="1rem" 
                size="small" 
                backgroundColor="#28a745"
                hoverBackground="#218838"
                onClick={handleSaveEdit}>Save Changes</Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
 
      {showDeleteModal && (
        <ModalOverlay onClick={handleCloseModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Delete Profile</h2>
              <Close onClick={handleCloseModals}>×</Close>
            </ModalHeader>
            <div>
              <p>Are you sure you want to delete your profile? </p>
              <p>Pet information, will be permanently deleted.</p>
            </div>
            <ModalActions>
              <Button fontSize="1rem" size="small" onClick={handleCloseModals}>Cancel</Button>
              <Button 
                fontSize="1rem" 
                size="small" 
                backgroundColor="red"
                hoverBackground="#B81323"
                onClick={handleConfirmDelete}>Delete Profile</Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
 
      {showAddPetModal && (
        <ModalOverlay onClick={handleCloseModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Add New Pet</h2>
              <Close onClick={handleCloseModals}>×</Close>
            </ModalHeader>
            <div>
              <FormGroup>
                <FormLabel>Name</FormLabel>
                <FormInput
                  type="text"
                  name="name"
                  value={petFormData.name}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Species</FormLabel>
                <FormInput
                  type="text"
                  name="species"
                  value={petFormData.species}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Breed</FormLabel>
                <FormInput
                  type="text"
                  name="breed"
                  value={petFormData.breed}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Age</FormLabel>
                <FormInput
                  type="number"
                  name="age"
                  value={petFormData.age}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Birth Date</FormLabel>
                <FormInput
                  type="date"
                  name="dateOfBirth"
                  value={petFormData.dateOfBirth}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Weight (kg)</FormLabel>
                <FormInput
                  type="number"
                  name="weight"
                  value={petFormData.weight}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Color</FormLabel>
                <FormInput
                  type="text"
                  name="color"
                  value={petFormData.color}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Gender</FormLabel>
                <FormSelect
                  name="gender"
                  value={petFormData.gender}
                  onChange={handlePetInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </FormSelect>
              </FormGroup>
              <FormGroup>
                <FormLabel>Microchip Number</FormLabel>
                <FormInput
                  type="text"
                  name="microchipNumber"
                  value={petFormData.microchipNumber}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Insurance Number</FormLabel>
                <FormInput
                  type="text"
                  name="insuranceNumber"
                  value={petFormData.insuranceNumber}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
            </div>
            <ModalActions>
              <Button fontSize="1rem" size="small" onClick={handleCloseModals}>Cancel</Button>
              <Button 
                fontSize="1rem" 
                size="small" 
                backgroundColor="#28a745"
                hoverBackground="#218838" 
                onClick={handleSavePet}>Add Pet</Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
 
      {showEditPetModal && (
        <ModalOverlay onClick={handleCloseModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Edit Pet</h2>
              <Close onClick={handleCloseModals}>×</Close>
            </ModalHeader>
            <div>
              <FormGroup>
                <FormLabel>Name</FormLabel>
                <FormInput
                  type="text"
                  name="name"
                  value={petFormData.name}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Species</FormLabel>
                <FormInput
                  type="text"
                  name="species"
                  value={petFormData.species}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Breed</FormLabel>
                <FormInput
                  type="text"
                  name="breed"
                  value={petFormData.breed}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Age</FormLabel>
                <FormInput
                  type="number"
                  name="age"
                  value={petFormData.age}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Birth Date</FormLabel>
                <FormInput
                  type="date"
                  name="dateOfBirth"
                  value={petFormData.dateOfBirth}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Weight (kg)</FormLabel>
                <FormInput
                  type="number"
                  name="weight"
                  value={petFormData.weight}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Color</FormLabel>
                <FormInput
                  type="text"
                  name="color"
                  value={petFormData.color}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Gender</FormLabel>
                <FormSelect
                  name="gender"
                  value={petFormData.gender}
                  onChange={handlePetInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </FormSelect>
              </FormGroup>
              <FormGroup>
                <FormLabel>Microchip Number</FormLabel>
                <FormInput
                  type="text"
                  name="microchipNumber"
                  value={petFormData.microchipNumber}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
              <FormGroup>
                <FormLabel>Insurance Number</FormLabel>
                <FormInput
                  type="text"
                  name="insuranceNumber"
                  value={petFormData.insuranceNumber}
                  onChange={handlePetInputChange}
                />
              </FormGroup>
            </div>
            <ModalActions>
              <Button fontSize="1rem" size="small" onClick={handleCloseModals}>Cancel</Button>
              <Button 
                fontSize="1rem" 
                size="small" 
                backgroundColor="#28a745"
                hoverBackground="#218838" 
                onClick={handleSavePet}>Save Changes</Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}

      {showDeletePetModal && (
        <ModalOverlay onClick={handleCloseModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Delete Pet</h2>
              <Close onClick={handleCloseModals}>×</Close>
            </ModalHeader>
            <div>
              <p>Are you sure you want to delete <b>{selectedPet?.name} </b>?</p>
              <p>This action cannot be undone.</p>
            </div>
            <ModalActions>
              <Button fontSize="1rem" size="small" onClick={handleCloseModals}>Cancel</Button>
              <Button 
                fontSize="1rem" 
                size="small" 
                backgroundColor="red"
                hoverBackground="#B81323"
                onClick={handleConfirmDeletePet}
              >
                Delete Pet
              </Button>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </ProfileContainer>
  );
});

Profile.displayName = 'Profile';

export default Profile;
