import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { createPatient, createMedicalAlert, 
    createVaccination, createPatientNote } from '../store/patientsSlice';
import styled, { keyframes } from 'styled-components';

interface PatientData {
  id: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: string;
  color: string;
  gender: string;
  microchipNumber: string;
  ownerId: string;
  medicalAlerts: string[];
}

interface MedicalAlert {
  alertText: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

interface Vaccination {
  vaccineName: string;
  dateAdministered: string;
  nextDueDate: string;
  administeredBy: string;
  lotNumber?: string;
  manufacturer?: string;
  notes?: string;
}

interface PatientNote {
  weight: number;
  noteText: string;
  noteType: 'general' | 'medical' | 'behavioral';
}

const steps = ['Patient Info', 'Medical Alerts', 'Vaccinations', 'Notes'];

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1a2027;
`;

const Alert = styled.div`
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: #1976d2;
`;

const StepperContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  position: relative;
`;

const StepWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 0.875rem;
  background: ${props => 
    props.$completed ? '#4caf50' : 
    props.$active ? '#1976d2' : '#e0e0e0'
  };
  color: ${props => props.$active || props.$completed ? 'white' : '#666'};
  margin-bottom: 8px;
  z-index: 2;
`;

const StepLabel = styled.span<{ $active: boolean; $completed: boolean }>`
  font-weight: ${props => props.$active ? '600' : '400'};
  color: ${props => 
    props.$completed ? '#4caf50' : 
    props.$active ? '#1976d2' : '#666'
  };
  font-size: 0.875rem;
`;

const StepLine = styled.div<{ $completed: boolean }>`
  position: absolute;
  top: 16px;
  left: 50%;
  right: -50%;
  height: 2px;
  background: ${props => props.$completed ? '#4caf50' : '#e0e0e0'};
  z-index: 1;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a2027;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1a2027;
`;

const AlertCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fafafa;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #1976d2;
          border-color: #1976d2;
          color: white;
          
          &:hover:not(:disabled) {
            background: #1565c0;
            border-color: #1565c0;
          }
        `;
      case 'secondary':
        return `
          background: transparent;
          border-color: #666;
          color: #666;
          
          &:hover:not(:disabled) {
            background: #f5f5f5;
          }
        `;
      default:
        return `
          background: transparent;
          border-color: #666;
          color: #666;
          
          &:hover:not(:disabled) {
            background: #f5f5f5;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RemoveButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #d32f2f;
  border-radius: 6px;
  background: transparent;
  color: #d32f2f;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 10px;

  &:hover {
    background: #d32f2f;
    color: white;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #1976d2;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const CreatePatient: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState<PatientData | null>(null);

  const [patientInfo, setPatientInfo] = useState({
    name: '',
    species: '',
    breed: '',
    dateOfBirth: '',
    color: '',
    gender: '',
    microchipNumber: '',
    status: 'active'
  });

  const [medicalAlerts, setMedicalAlerts] = useState<MedicalAlert[]>([
    { alertText: '', severity: 'medium', notes: '' }
  ]);

  const [vaccinations, setVaccinations] = useState<Vaccination[]>([
    {
      vaccineName: '',
      dateAdministered: '',
      nextDueDate: '',
      administeredBy: '',
      lotNumber: '',
      manufacturer: '',
      notes: ''
    }
  ]);

  const [patientNote, setPatientNote] = useState<PatientNote>({
    weight: 0,
    noteText: '',
    noteType: 'general'
  });

  useEffect(() => {
    if (location.state?.pet) {
      const { pet } = location.state;
      setPatientData(pet);
      setPatientInfo({
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        dateOfBirth: pet.dateOfBirth.split('T')[0],
        color: pet.color,
        gender: pet.gender,
        microchipNumber: pet.microchipNumber || '',
        status: 'active'
      });
    }
  }, [location.state]);

  const handleNext = async () => {
    if (activeStep === steps.length - 1) {
      await handleSubmit();
    } else {
      await submitStepData();
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const submitStepData = async () => {
    setLoading(true);
    try {
      switch (activeStep) {
        case 0:
          break;

        case 1:
          for (const alert of medicalAlerts.filter(a => a.alertText)) {
            await dispatch(createMedicalAlert({
              patientId: patientData?.id,
              alertText: alert.alertText,
              severity: alert.severity,
              notes: alert.notes
            })).unwrap();
          }
          break;

        case 2:
          for (const vaccine of vaccinations.filter(v => v.vaccineName)) {
            await dispatch(createVaccination({
              patientId: patientData?.id,
              vaccineName: vaccine.vaccineName,
              dateAdministered: vaccine.dateAdministered,
              nextDueDate: vaccine.nextDueDate,
              administeredBy: vaccine.administeredBy,
              lotNumber: vaccine.lotNumber,
              manufacturer: vaccine.manufacturer,
              notes: vaccine.notes
            })).unwrap();
          }
          break;

        case 3:
          await dispatch(createPatientNote({
            patientId: patientData?.id,
            weight: patientNote.weight,
            noteText: patientNote.noteText,
            noteType: patientNote.noteType
          })).unwrap();
          break;
      }
    } catch (error) {
      console.error(`Error submitting step ${activeStep + 1}:`, error);
      alert(`Failed to submit ${steps[activeStep]}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const patientPayload = {
        id: patientData?.id,
        name: patientInfo.name,
        species: patientInfo.species,
        breed: patientInfo.breed,
        dateOfBirth: patientInfo.dateOfBirth,
        color: patientInfo.color,
        gender: patientInfo.gender,
        microchipNumber: patientInfo.microchipNumber,
        status: patientInfo.status,
        ownerId: patientData?.ownerId || '',
        medicalAlerts: medicalAlerts.map(alert => alert.alertText).filter(Boolean)
      };

      await dispatch(createPatient(patientPayload)).unwrap();

      alert('Patient created successfully!');
      navigate('/clients');
    } catch (error) {
      console.error('Error creating patient:', error);
      // alert('Error creating patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid>
            <FormGroup>
              <Label>Pet Name</Label>
              <Input
                type="text"
                value={patientInfo.name}
                onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Species</Label>
              <Select
                value={patientInfo.species}
                onChange={(e) => setPatientInfo({ ...patientInfo, species: e.target.value })}
              >
                <option value="">Select Species</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Other">Other</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Breed</Label>
              <Input
                type="text"
                value={patientInfo.breed}
                onChange={(e) => setPatientInfo({ ...patientInfo, breed: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Date of Birth</Label>
              <Input
                type="date"
                value={patientInfo.dateOfBirth}
                onChange={(e) => setPatientInfo({ ...patientInfo, dateOfBirth: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Color</Label>
              <Input
                type="text"
                value={patientInfo.color}
                onChange={(e) => setPatientInfo({ ...patientInfo, color: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Gender</Label>
              <Select
                value={patientInfo.gender}
                onChange={(e) => setPatientInfo({ ...patientInfo, gender: e.target.value })}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Microchip Number</Label>
              <Input
                type="text"
                value={patientInfo.microchipNumber}
                onChange={(e) => setPatientInfo({ ...patientInfo, microchipNumber: e.target.value })}
              />
            </FormGroup>
          </Grid>
        );

      case 1:
        return (
          <div>
            <SectionTitle>Medical Alerts</SectionTitle>
            {medicalAlerts.map((alert, index) => (
              <AlertCard key={index}>
                <Grid>
                  <FormGroup>
                    <Label>Alert Description</Label>
                    <Input
                      type="text"
                      value={alert.alertText}
                      onChange={(e) => {
                        const newAlerts = [...medicalAlerts];
                        newAlerts[index].alertText = e.target.value;
                        setMedicalAlerts(newAlerts);
                      }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Severity</Label>
                    <Select
                      value={alert.severity}
                      onChange={(e) => {
                        const newAlerts = [...medicalAlerts];
                        newAlerts[index].severity = e.target.value as any;
                        setMedicalAlerts(newAlerts);
                      }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </Select>
                  </FormGroup>
                  <FormGroup>
                    <Label>Notes</Label>
                    <TextArea
                      value={alert.notes}
                      onChange={(e) => {
                        const newAlerts = [...medicalAlerts];
                        newAlerts[index].notes = e.target.value;
                        setMedicalAlerts(newAlerts);
                      }}
                    />
                  </FormGroup>
                </Grid>
                {medicalAlerts.length > 1 && (
                  <RemoveButton
                    onClick={() => setMedicalAlerts(medicalAlerts.filter((_, i) => i !== index))}
                  >
                    Remove Alert
                  </RemoveButton>
                )}
              </AlertCard>
            ))}
            <Button
              onClick={() => setMedicalAlerts([...medicalAlerts, { alertText: '', severity: 'medium', notes: '' }])}
            >
              Add Another Alert
            </Button>
          </div>
        );

      case 2:
        return (
          <div>
            <SectionTitle>Vaccination Records</SectionTitle>
            {vaccinations.map((vaccine, index) => (
              <AlertCard key={index}>
                <Grid>
                  <FormGroup>
                    <Label>Vaccine Name</Label>
                    <Input
                      type="text"
                      value={vaccine.vaccineName}
                      onChange={(e) => {
                        const newVaccines = [...vaccinations];
                        newVaccines[index].vaccineName = e.target.value;
                        setVaccinations(newVaccines);
                      }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Administered By</Label>
                    <Input
                      type="text"
                      value={vaccine.administeredBy}
                      onChange={(e) => {
                        const newVaccines = [...vaccinations];
                        newVaccines[index].administeredBy = e.target.value;
                        setVaccinations(newVaccines);
                      }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Date Administered</Label>
                    <Input
                      type="date"
                      value={vaccine.dateAdministered}
                      onChange={(e) => {
                        const newVaccines = [...vaccinations];
                        newVaccines[index].dateAdministered = e.target.value;
                        setVaccinations(newVaccines);
                      }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Next Due Date</Label>
                    <Input
                      type="date"
                      value={vaccine.nextDueDate}
                      onChange={(e) => {
                        const newVaccines = [...vaccinations];
                        newVaccines[index].nextDueDate = e.target.value;
                        setVaccinations(newVaccines);
                      }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Lot Number</Label>
                    <Input
                      type="text"
                      value={vaccine.lotNumber}
                      onChange={(e) => {
                        const newVaccines = [...vaccinations];
                        newVaccines[index].lotNumber = e.target.value;
                        setVaccinations(newVaccines);
                      }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Manufacturer</Label>
                    <Input
                      type="text"
                      value={vaccine.manufacturer}
                      onChange={(e) => {
                        const newVaccines = [...vaccinations];
                        newVaccines[index].manufacturer = e.target.value;
                        setVaccinations(newVaccines);
                      }}
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Notes</Label>
                    <TextArea
                      value={vaccine.notes}
                      onChange={(e) => {
                        const newVaccines = [...vaccinations];
                        newVaccines[index].notes = e.target.value;
                        setVaccinations(newVaccines);
                      }}
                    />
                  </FormGroup>
                </Grid>
                {vaccinations.length > 1 && (
                  <RemoveButton
                    onClick={() => setVaccinations(vaccinations.filter((_, i) => i !== index))}
                  >
                    Remove Vaccine
                  </RemoveButton>
                )}
              </AlertCard>
            ))}
            <Button
              onClick={() => setVaccinations([...vaccinations, {
                vaccineName: '',
                dateAdministered: '',
                nextDueDate: '',
                administeredBy: '',
                lotNumber: '',
                manufacturer: '',
                notes: ''
              }])}
            >
              Add Another Vaccine
            </Button>
          </div>
        );

      case 3:
        return (
          <Grid>
            <FormGroup>
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                value={patientNote.weight}
                onChange={(e) => setPatientNote({ ...patientNote, weight: parseFloat(e.target.value) || 0 })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Note Type</Label>
              <Select
                value={patientNote.noteType}
                onChange={(e) => setPatientNote({ ...patientNote, noteType: e.target.value as any })}
              >
                <option value="general">General</option>
                <option value="medical">Medical</option>
                <option value="behavioral">Behavioral</option>
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>Notes</Label>
              <TextArea
                value={patientNote.noteText}
                onChange={(e) => setPatientNote({ ...patientNote, noteText: e.target.value })}
                placeholder="Enter any additional notes about the patient..."
              />
            </FormGroup>
          </Grid>
        );

      default:
        return null;
    }
  };

  if (!patientData) {
    return (
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <Container>
      <Title>Create Patient Record</Title>

      <Alert>
        {patientData.name} - {patientData.species}
      </Alert>

      <StepperContainer>
        {steps.map((label, index) => (
          <StepWrapper key={label}>
            <Step
              $active={activeStep === index}
              $completed={activeStep > index}
            >
              {activeStep > index ? '✓' : index + 1}
            </Step>
            <StepLabel
              $active={activeStep === index}
              $completed={activeStep > index}
            >
              {label}
            </StepLabel>
            {index < steps.length - 1 && (
              <StepLine $completed={activeStep > index} />
            )}
          </StepWrapper>
        ))}
      </StepperContainer>

      <Card>
        {renderStepContent(activeStep)}
      </Card>

      <ButtonGroup>
        <Button onClick={handleBack}>
          {activeStep === 0 ? 'Back to Clients' : 'Back'}
        </Button>
        <Button
          $variant="primary"
          onClick={handleNext}
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : activeStep === steps.length - 1 ? 'Complete' : 'Next'}
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default CreatePatient;