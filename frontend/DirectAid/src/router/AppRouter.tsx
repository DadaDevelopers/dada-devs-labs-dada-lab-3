import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage"
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import BeneficiaryDashboard from "../pages/dashboard/BeneficiaryDashboard";
import ProviderDashboard from "../pages/dashboard/ProviderDasboard";
import CampaignPage from "../pages/CampaignPage";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Signup />} />
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/" element={<BeneficiaryDashboard />} />
            <Route path="/" element={<ProviderDashboard />} />
            <Route path="/" element={<CampaignPage />} />
            <Route path="/" element={<LandingPage />} />
        </Routes>
    );
}
