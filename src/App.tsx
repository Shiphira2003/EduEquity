import RegisterStudent from "./pages/RegisterStudent";
import LandingPage from "./pages/LandingPage";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import ApplicationAuditLogs from "./pages/admin/ApplicationAuditLogs.tsx";
import AdminProfile from "./pages/admin/AdminProfile.tsx";
import StudentApplication from "./pages/StudentApplication.tsx";
import AdminStudents from "./pages/admin/AdminStudents.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminApplications from "./pages/admin/AdminApplications.tsx";
import AdminDisbursements from "./pages/admin/AdminDisbursements.tsx";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs.tsx";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements.tsx";
import StudentLayout from "./layouts/StudentLayout";
import ProtectedStudentRoute from "./routes/ProtectedStudentRoute";
import StudentDashboard from "./pages/student/StudentDashboard";
import MyApplications from "./pages/student/MyApplications";
import Profile from "./pages/student/Profile";
import AdminLayout from "./layouts/AdminLayout";
import About from "./pages/About.tsx";
import { Navigate } from "react-router-dom";

// ... existing imports

function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/register-student" element={<RegisterStudent />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />

            {/* Admin Portal Routes */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="applications" element={<AdminApplications />} />
                <Route path="disbursements" element={<AdminDisbursements />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                <Route path="announcements" element={<AdminAnnouncements />} />
                <Route
                    path="applications/:id/audit-logs"
                    element={<ApplicationAuditLogs />}
                />
            </Route>

            {/* Student Portal Routes */}
            <Route element={<ProtectedStudentRoute />}>
                <Route path="/student" element={<StudentLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<StudentDashboard />} />
                    <Route path="applications" element={<MyApplications />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="apply" element={<StudentApplication />} />
                </Route>
            </Route>

        </Routes>
    )
}

export default App;
