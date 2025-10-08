import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import { fetchProfile, selectProfile, selectProfileLoading, 
  selectProfileError, updateProfile, deleteProfile } from '../store/profileSlice';
import { RootState } from '../store';
import { useAppDispatch } from '../store/hooks';
import styled from 'styled-components'; 
import { petService } from '../services/petService'; 

const PetDetails = styled.div<{ isExpanded: boolean }>`
  display: flex;
  flex-direction: column;
  margin-top: -1rem;
  gap: 0.5rem;
  max-height: ${props => props.isExpanded ? '500px' : '0'};
  opacity: ${props => props.isExpanded ? 1 : 0};
  overflow-y: auto;
  transition: all 0.3s ease; 
  position: absolute;
  top: 100%;     
  left: 0;
  width: 100%;
  background: #ECF2F7;
  z-index: 10000;
  padding: 1rem;
  border-radius: 0 0 21px 21px;  
`;

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
  gap: 1rem;
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
  margin-bottom: 0.75rem;
  
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
  
  strong {
    color: #495057;
    display: inline-block;
    min-width: 120px;
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

const AddPetButton = styled.button`
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 14px;
  cursor: pointer;
  
  &:hover {
    background: #218838;
  }
`;

const PetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(410px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
  overflow: visible;   
`;

const PetCard = styled.div<{ isExpanded?: boolean }>`
  background: #ecf2f7ff;
  padding: 0.5rem 1rem;
  font-size: 1.3rem;
  border-radius: 21px; 
  cursor: pointer;
  position: relative;
  overflow: visible;
  min-height: 120px;
`;

const ExpandIcon = styled.span<{ isExpanded: boolean }>`
  font-size: 1.5rem;
  transition: transform 0.3s ease;
  transform: ${props => props.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const PetHeader = styled.h4`
  margin: 0 0 1rem 0;
  color: #1E1E2F;
  font-size: 1.3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
  
const PetActions = styled.div<{ isExpanded: boolean }>`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  justify-content: flex-end;
  position: relative;
  z-index: 20;
  visibility: ${props => props.isExpanded ? 'hidden' : 'visible'};
  opacity: ${props => props.isExpanded ? 0 : 1};
  transition: opacity 0.3s ease;
`;

const PetActionButton = styled.button`
  padding: 6px 11px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &.edit {
    border-radius: 6px;
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
  
  &.delete {
    border-radius: 6px;
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background: #1E1E2F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 2rem;
  
  &:hover {
    background: #434367;
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
  border-radius: 8px;
  margin-bottom: 2rem;
  border: 1px solid #f5c6cb;
`;

const StatusBadge = styled.span<{ isActive: boolean }>`
  display: inline-block;
  padding: 4px 11px;
  margin-top: 1rem;
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
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    margin: 0;
    color: #1E1E2F;
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

const CancelButton = styled.button`
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  
  &:hover {
    background: #5a6268;
  }
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

const SaveButton = styled.button`
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  
  &:hover {
    background: #218838;
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
  border-radius: 4px;
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
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const PetCardComponent = React.memo(({ 
  pet, 
  isExpanded, 
  onToggle, 
  onEdit, 
  onDelete, 
  formatDate 
}: { 
  pet: any;
  isExpanded: boolean;
  onToggle: (petId: string, e: React.MouseEvent) => void;
  onEdit: (pet: any, e: React.MouseEvent) => void;
  onDelete: (pet: any, e: React.MouseEvent) => void;
  formatDate: (date: string) => string;
}) => (
  <PetCard 
    key={pet._id} 
    isExpanded={isExpanded}
    onClick={(e) => onToggle(pet._id, e)}
  >
    <PetCardContent>
      <InfoItem> 
        <StatusBadge isActive={pet.isActive}>
          {pet.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      </InfoItem>
      <PetHeader>
        {pet.name}
        <ExpandIcon isExpanded={isExpanded}>▼</ExpandIcon>
      </PetHeader>
    </PetCardContent>
    
    <PetDetails isExpanded={isExpanded}>
      <InlineWrapper><strong>Species:</strong><span>{pet.species}</span></InlineWrapper>
      <InlineWrapper><strong>Breed:</strong><span>{pet.breed}</span></InlineWrapper>
      <InlineWrapper><strong>Age:</strong><span>{pet.age} years</span></InlineWrapper>
      <InlineWrapper><strong>Weight:</strong><span>{pet.weight} kg</span></InlineWrapper>
      <InlineWrapper><strong>Color:</strong><span>{pet.color}</span></InlineWrapper>
      <InlineWrapper><strong>Gender:</strong><span>{pet.gender}</span></InlineWrapper>
      <InlineWrapper><strong>Birth Date:</strong><span>{formatDate(pet.dateOfBirth)}</span></InlineWrapper>
      <InlineWrapper><strong>Microchip:</strong><span>{pet.microchipNumber || 'N/A'}</span></InlineWrapper>
      <InlineWrapper><strong>Insurance:</strong><span>{pet.insuranceNumber || 'N/A'}</span></InlineWrapper>
    </PetDetails>
    
    <PetActions isExpanded={isExpanded}>
      <PetActionButton 
        className="edit" 
        onClick={(e) => {
          e.stopPropagation();
          onEdit(pet, e);
        }}
      >
        Edit
      </PetActionButton>
      <PetActionButton 
        className="delete" 
        onClick={(e) => {
          e.stopPropagation();
          onDelete(pet, e);
        }}
      >
        Delete
      </PetActionButton>
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
  
  const [expandedPets, setExpandedPets] = useState<Set<string>>(new Set());
  const [modalState, setModalState] = useState({
    showEditModal: false,
    showDeleteModal: false,
    showAddPetModal: false,
    showEditPetModal: false,
    showDeletePetModal: false
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

  const profileInitials = useMemo(() => {
    return profile ? `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`.toUpperCase() : '';
  }, [profile?.firstName, profile?.lastName]);

  const petsCount = useMemo(() => profile?.pets?.length || 0, [profile?.pets]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  const togglePetExpansion = useCallback((petId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(petId)) {
        newSet.delete(petId);
      } else {
        newSet.add(petId);
      }
      return newSet;
    });
  }, []);

  const handleCloseModals = useCallback(() => {
    setModalState({
      showEditModal: false,
      showDeleteModal: false,
      showAddPetModal: false,
      showEditPetModal: false,
      showDeletePetModal: false
    });
    setSelectedPet(null);
  }, []);

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
      dispatch(fetchProfile());
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
        <Button onClick={handleLogout}>Logout</Button>
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
              <span>Authenticated ✓</span>
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

        <Button onClick={handleLogout}>Logout</Button>
      </ProfileContainer>
    );
  }

  const { 
    showEditModal, 
    showDeleteModal, 
    showAddPetModal, 
    showEditPetModal, 
    showDeletePetModal 
  } = modalState;

  return ( 
    <ProfileContainer>
      <ProfileHeader>
        <ProfileImageContainer>
          <ProfileImage imageUrl={profile.profileImage}>
            {!profile.profileImage && profileInitials}
          </ProfileImage>
          <ProfileButtons>
            <ProfileButton className="edit" onClick={handleEditProfile}>
              Edit
            </ProfileButton>
            <ProfileButton className="delete" onClick={handleDeleteProfile}>
              Delete
            </ProfileButton>
          </ProfileButtons>
          {deleteMessage && (
            <DeleteMessage>
              Your profile will be deleted soon
            </DeleteMessage>
          )}
        </ProfileImageContainer>
        <ProfileContent>
          <ProfileInfo>
            <h1>{profile.firstName} {profile.lastName}</h1>
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
          <AddPetButton onClick={handleAddPet}>
            New Pet
          </AddPetButton>
        </PetGridHeader>
        
        {!profile.pets || profile.pets.length === 0 ? (
          <p>No pets registered.</p>
        ) : (
          <PetGrid>
            {profile.pets.map((pet) => (
              <PetCardComponent
                key={pet._id}
                pet={pet}
                isExpanded={expandedPets.has(pet._id)}
                onToggle={togglePetExpansion}
                onEdit={handleEditPet}
                onDelete={handleDeletePet}
                formatDate={formatDate}
              />
            ))}
          </PetGrid>
        )} 
      </PetsSection>

      <Button onClick={handleLogout}>Logout</Button>
 
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
              <CancelButton onClick={handleCloseModals}>Cancel</CancelButton>
              <SaveButton onClick={handleSaveEdit}>Save Changes</SaveButton>
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
              <CancelButton onClick={handleCloseModals}>Cancel</CancelButton>
              <ConfirmButton onClick={handleConfirmDelete}>Delete Profile</ConfirmButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
 
      {showAddPetModal && (
        <ModalOverlay onClick={handleCloseModals}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Add New Pet</h2>
              <CloseButton onClick={handleCloseModals}>×</CloseButton>
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
              <CancelButton onClick={handleCloseModals}>Cancel</CancelButton>
              <SaveButton onClick={handleSavePet}>Add Pet</SaveButton>
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
              <CancelButton onClick={handleCloseModals}>Cancel</CancelButton>
              <SaveButton onClick={handleSavePet}>Save Changes</SaveButton>
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
              <CancelButton onClick={handleCloseModals}>Cancel</CancelButton>
              <ConfirmButton onClick={handleConfirmDeletePet}>Delete Pet</ConfirmButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </ProfileContainer>
  );
});

Profile.displayName = 'Profile';

export default Profile;