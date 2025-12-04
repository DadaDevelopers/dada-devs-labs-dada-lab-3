import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import BeneficiaryDashboard from "../pages/dashboard/BeneficiaryDashboard";
import ProviderDashboard from "../pages/dashboard/ProviderDasboard";
import DonorDashboard from "../pages/dashboard/DonorDashboard";
import CampaignPage from "../pages/CampaignPage";

export default function AppRouter() {
    return (
        <Routes>
            {/* Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Campaign */}
            <Route path="/campaigns" element={<CampaignPage />} />

            {/* Dashboards */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/beneficiary" element={<BeneficiaryDashboard />} />
            <Route path="/provider" element={<ProviderDashboard />} />
            <Route path="/donor" element={<DonorDashboard />} />
        </Routes>
    );
}
