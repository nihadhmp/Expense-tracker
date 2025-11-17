import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Dashboard/Home";
import Expense from "./pages/Dashboard/Expence";
import Categories from "./pages/Dashboard/Categories";
import MonthlySummary from "./pages/Dashboard/Income";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <div>
      {/* <TestToast /> */}
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/signUp"
            element={
              <GuestRoute>
                <SignUp />
              </GuestRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="expenses" element={<Expense />} />
            <Route path="categories" element={<Categories />} />
            <Route path="summary" element={<MonthlySummary />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
