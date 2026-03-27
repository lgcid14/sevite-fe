import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicForm from './pages/PublicForm';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import TicketsList from './pages/admin/TicketsList';
import TicketDetail from './pages/admin/TicketDetail';
import Surveys from './pages/admin/Surveys';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/crear-ticket" element={<PublicForm />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tickets" element={<TicketsList />} />
            <Route path="tickets/:id" element={<TicketDetail />} />
            <Route path="surveys" element={<Surveys />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
