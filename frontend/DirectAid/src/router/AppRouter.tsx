import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage"
import LoginPage from "../components/pages/LoginPage";
import SignUpPage from "../components/pages/SignUpPage";
import ProfileSettingsPage from "../components/pages/ProfileSettingsPage";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import BeneficiaryDashboard from "../pages/dashboard/BeneficiaryDashboard";
import ProviderDashboard from "../pages/dashboard/ProviderDasboard";
import CampaignPage from "../pages/CampaignPage";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/profile" element={<ProfileSettingsPage />} />
            <Route path="/admindashboard" element={<AdminDashboard />} />
            <Route path="/userdashboard" element={<BeneficiaryDashboard />} />
            <Route path="/providerdashboard" element={<ProviderDashboard />} />
            <Route path="/campaigns" element={<CampaignPage />} />
        </Routes>
    );
}
