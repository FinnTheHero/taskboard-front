import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { GroupProvider } from "./context/GroupContext";
import { BoardPage } from "./pages/BoardPage";
import { BoardsPage } from "./pages/BoardsPage";
import { GroupManagePage } from "./pages/GroupManagePage";
import { JoinGroupPage } from "./pages/JoinGroupPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";

export default function App() {
  return (
    <AuthProvider>
      <GroupProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/join-group" element={<JoinGroupPage />} />
              <Route element={<Layout />}>
                <Route path="/boards" element={<BoardsPage />} />
                <Route path="/boards/:boardId" element={<BoardPage />} />
                <Route path="/group/manage" element={<GroupManagePage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/boards" replace />} />
          </Routes>
        </BrowserRouter>
      </GroupProvider>
    </AuthProvider>
  );
}
