import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/hooks';
import { RootState } from '@/store';
import { fetchPatients } from '../store/patientsSlice';

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
`;

const TableWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  overflow-x: auto; /* horizontal scroll for small devices */
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`; 

interface MedicalAlertsProps {
  alert: boolean;
}

const MedicalAlerts = styled.div<MedicalAlertsProps>`
  width: 100%;
  color: ${({ alert }) => (alert ? 'red' : 'green')};
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
  font-size: 14px;
`;

const ExpandedTd = styled.td`
  padding: 12px;
  background: #f9f9f9;
  border-bottom: 1px solid #ddd;
  font-size: 14px;
`;

const Patients: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients, loading, error } = useSelector((state: RootState) => state.patients);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchPatients());
  }, [dispatch]);

  const toggleRow = (index: number) => {
    setExpandedRow(prev => (prev === index ? null : index));
  };

  if (loading) return <Container><p>Loading patients...</p></Container>;
  if (error) return <Container><p style={{color: 'red'}}>{error}</p></Container>;

  return (
    <Container>
      <Title>Patients</Title>
      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Species</Th>
              <Th>Breed</Th>
              <Th>Active</Th>
              <Th>Created</Th>
              <Th>DOB</Th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient, index) => (
              <React.Fragment key={index}>
                <tr 
                  onClick={() => toggleRow(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <Td>{patient.name}</Td>
                  <Td>{patient.species}</Td>
                  <Td>{patient.breed}</Td>
                  <Td>{patient.isActive ? 'Yes' : 'No'}</Td>
                  <Td>{new Date(patient.createdAt).toLocaleString()}</Td>
                  <Td>{new Date(patient.dateOfBirth).toLocaleDateString()}</Td>
                </tr>

                {expandedRow === index && (
                  <tr>
                    <ExpandedTd colSpan={6}>
                        <MedicalAlerts alert={patient.medicalAlerts.length > 0}>
                            <strong>Medical Alerts: {" "}</strong> 
                            {patient.medicalAlerts.length > 0 ? patient.medicalAlerts.join(', ') : ' No alerts'}
                        </MedicalAlerts>
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

export default Patients;
