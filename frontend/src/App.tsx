import { Route, Routes } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { RoleBasedRedirect } from "./components/RoleBasedRedirect";
import PublicRoute from "./components/PublicRoute";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { DashboardPage } from "@/pages/students/DashboardPage";
import { BooksPage } from "./pages/students/BooksPage";
import BorrowingsPage from "./pages/students/BorrowingsPage";
import FinesPage from "./pages/students/FinesPage";
import { ReviewPage } from "./pages/students/ReviewPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminBooksPage } from "./pages/admin/AdminBooksPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";
import { AdminRoute } from "./components/AdminRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      <Route path="/" element={<RoleBasedRedirect />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/my-borrowings" element={<BorrowingsPage />} />
          <Route path="/my-fines" element={<FinesPage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Route>
      </Route>

      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<Layout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="books" element={<AdminBooksPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
        </Route>
      </Route>

    </Routes >
  )
}
