import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "@/pages/index";
import SignupPage from "@/pages/signup";
import VerifyPage from "@/pages/verify";
import SuccessPage from "@/pages/success";
import ErrorPage from "@/pages/error";
import ResendPage from "@/pages/resend";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/error" element={<ErrorPage />} />
      <Route path="/resend" element={<ResendPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
