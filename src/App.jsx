import Organizaciones from './admin/pages/Organizaciones';
import PropietariosPage from './admin/pages/Propietarios';
import UnidadesPage from './admin/pages/Unidades';
import SectoresPage from './admin/pages/SectoresPage';
import DashboardPropietario from './residencia/pages/Dashboard';
import Dashboard from './admin/pages/Dashboard';
import Usuarios from './admin/pages/Usuarios';
import GastosPage from './admin/pages/Gastos';
import CobrosPage from './admin/pages/Cobros';
import RecibosAdmin from './admin/pages/RecibosAdmin'; // detalle de recibos por unidad
import RecibosResumen from './admin/pages/RecibosResumen'; // resumen por periodo

import './App.css';

import MainLayout from './layout/MainLayout';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginAdmin from './admin/pages/LoginAdmin';
import CambiarPassword from './admin/pages/CambiarPassword';
import LoginPropietario from './residencia/pages/LoginPropietario';
import CambiarPasswordPropietario from './residencia/pages/CambiarPassword';
import AdminLayout from './admin/layout/AdminLayout';
import ResidenciaLayout from './residencia/layout/ResidenciaLayout';


function App() {
  return (
    <Router>
  <Routes>
        <Route path="/admin/unidades" element={
          <AdminLayout>
            <UnidadesPage />
          </AdminLayout>
        } />
        <Route path="/admin/propietarios" element={
          <AdminLayout>
            <PropietariosPage />
          </AdminLayout>
        } />
        <Route path="/admin/organizaciones" element={
          <AdminLayout>
            <Organizaciones />
          </AdminLayout>
        } />
        <Route path="/admin/usuarios" element={
          <AdminLayout>
            <Usuarios />
          </AdminLayout>
        } />
        <Route path="/admin/sectores" element={
          <AdminLayout>
            <SectoresPage />
          </AdminLayout>
        } />
        <Route path="/admin/login" element={
          <AdminLayout>
            <LoginAdmin />
          </AdminLayout>
        } />
        <Route path="/admin/cambiar-password" element={
          <AdminLayout>
            <CambiarPassword />
          </AdminLayout>
        } />
        <Route path="/admin/dashboard" element={
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        } />
        <Route path="/admin/cobros" element={
          <AdminLayout>
            <CobrosPage />
          </AdminLayout>
        } />
        <Route path="/admin/gastos" element={
          <AdminLayout>
            <GastosPage />
          </AdminLayout>
        } />
        <Route path="/admin/recibos" element={
          <AdminLayout>
            <RecibosResumen />
          </AdminLayout>
        } />
        <Route path="/admin/recibos/detalle" element={
          <AdminLayout>
            <RecibosAdmin />
          </AdminLayout>
        } />
        <Route path="/propietario/login" element={
          <ResidenciaLayout>
            <LoginPropietario />
          </ResidenciaLayout>
        } />
        <Route path="/propietario/cambiar-password" element={
          <ResidenciaLayout>
            <CambiarPasswordPropietario />
          </ResidenciaLayout>
        } />
        <Route path="/propietario/dashboard" element={
          <ResidenciaLayout>
            <DashboardPropietario />
          </ResidenciaLayout>
        } />
        <Route path="/" element={
          <MainLayout>
            <h1 className="text-2xl font-bold">Bienvenido a MiCondominioOnline</h1>
            <p className="mt-4">Aquí puedes gestionar tu comunidad de propietarios de manera eficiente.</p>
          </MainLayout>
        } />
  <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App
