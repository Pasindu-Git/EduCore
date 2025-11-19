import { Routes, Route, useLocation } from "react-router-dom";
import Sidebar from './Components/pages/Sidebar';
import Dashboard from './Components/pages/Dashboard/Dashboard';
import UserManagement from './Components/pages/UserManagement/UserManagement';
import RolesPermissions from './Components/pages/RolePermissions/RolesPermissions';
import SystemSettings from "./Components/pages/SystemSettings/SystemSettings";
import Feedback from './Components/pages/Feedback/Feedback';
import AdminFeedback from './Components/pages/Feedback/AdminFeedback';
import Enrollment from './Components/pages/Enrollment/Enrollment';
import ClassManagement from './Components/pages/ClassManagement/ClassManagement';
import Login from './Components/pages/LoginForm';
import ProtectedRoute from './Components/ProtectedRoute';
import SignupForm from "./Components/pages/SignupForm";
import Analytics from "./Components/pages/Analytics/Analytics";
import Home from "./Components/pages/Home";

function App() {
  const location = useLocation();

  // paths where the sidebar should be hidden
  const HIDE_SIDEBAR_PATHS = ["/", "/login", "/SignupForm"];
  const hideSidebar = HIDE_SIDEBAR_PATHS.includes(location.pathname);

  // optionally also require auth before showing sidebar:
  const isAuthed = !!localStorage.getItem("token");
  const showSidebar = isAuthed && !hideSidebar;

  return (
    <div className="app">
      {showSidebar && <Sidebar />}

      <main className="main-content" style={{ marginLeft: showSidebar ? undefined : 0 }}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/SignupForm" element={<SignupForm />} />
          <Route path="/login" element={<Login />} />

          {/* Common Dashboard for all roles */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                element={<Dashboard />}
                allowedRoles={["Admin", "Student", "Teacher", "Class Coordinator", "IT Supporter"]}
              />
            }
          />

          {/* Admin Only Pages */}
          <Route path="/users" element={<ProtectedRoute element={<UserManagement />} allowedRoles={["Admin"]} />} />
          <Route path="/roles" element={<ProtectedRoute element={<RolesPermissions />} allowedRoles={["Admin"]} />} />
          <Route path="/settings" element={<ProtectedRoute element={<SystemSettings />} allowedRoles={["Admin"]} />} />
          <Route path="/admin/feedback" element={<ProtectedRoute element={<AdminFeedback />} allowedRoles={["Admin"]} />} />
          <Route path="/analytics" element={<ProtectedRoute element={<Analytics />} allowedRoles={["Admin"]} />} />

          {/* Teacher & Coordinator Pages */}
          <Route
            path="/classmanagement"
            element={<ProtectedRoute element={<ClassManagement />} allowedRoles={["Teacher", "Class Coordinator", "Admin"]} />}
          />
          <Route
            path="/enrollment"
            element={<ProtectedRoute element={<Enrollment />} allowedRoles={["Teacher", "Class Coordinator", "Admin"]} />}
          />

          {/* Student Page */}
          <Route path="/feedback" element={<ProtectedRoute element={<Feedback />} allowedRoles={["Student"]} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
