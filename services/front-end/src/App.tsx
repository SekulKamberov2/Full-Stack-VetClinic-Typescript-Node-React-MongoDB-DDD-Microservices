import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import styled, { createGlobalStyle } from 'styled-components';
import Reports from './pages/Reports';
import Clients from './pages/Clients';
import Patients from './pages/Patients'; 
import Dashboard from './pages/Dashboard';
import ClientsList from './pages/ClientsList';
import CreatePatient from './pages/CreatePatient';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    color: #333;  
  }
`;

const AppContainer = styled.div`
  min-height: 100vh; 
`;

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <GlobalStyle />
      <Router>
        <AppContainer>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={<Navigate to="/profile" replace />} />
            
            <Route path="/profile" element={ 
                <Profile />
            
            } />
            
            <Route path="/create-patient" element={
              <ProtectedRoute allowedRoles="vet">
                <CreatePatient />
              </ProtectedRoute>
            } />
            
            <Route path="/clients-list" element={
              <ProtectedRoute allowedRoles={['admin', 'vet']}>
                <ClientsList />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin', 'vet', 'staff']}>
                <Dashboard />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<div>Welcome to Dashboard</div>} />
              
              <Route path="clients" element={
                <ProtectedRoute allowedRoles={['admin', 'vet']}>
                  <Clients />
                </ProtectedRoute>
              } />
              
              <Route path="patients" element={
                <ProtectedRoute allowedRoles={['admin', 'vet', 'staff']}>
                  <Patients />
                </ProtectedRoute>
              } />
              
              <Route path="reports" element={
                <ProtectedRoute allowedRoles={['admin', 'vet']}>
                  <Reports />
                </ProtectedRoute>
              } />
              
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
             
          </Routes>
        </AppContainer>
      </Router>
    </Provider>
  );
};

export default App;
