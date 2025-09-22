import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import styled, { createGlobalStyle } from 'styled-components';
import Reports from './pages/Reports';
import Clients from './components/Clients';
import Patients from './components/Patients'; 
import Dashboard from './components/Dashboard';

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
    min-height: 100vh;
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
            <Route path="/" element={<Navigate to="/profile" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            /> 
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} /> 
              <Route path="/admin" element={<Dashboard />}>
                <Route path="dashboard" element={<div>Welcome to Dashboard</div>} />
                <Route path="clients" element={<Clients />} />
                <Route path="patients" element={<Patients />} />
                <Route path="reports" element={<Reports />} />
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>
            <Route path="*" element={<Navigate to="/profile" replace />} />
          </Routes>
        </AppContainer>
      </Router>
    </Provider>
  );
};

export default App;
