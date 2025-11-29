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
            <Route path="/signup" element={<Signup />} />
            <Route path="/admindashboard" element={<AdminDashboard />} />
            <Route path="/userdashboard" element={<BeneficiaryDashboard />} />
            <Route path="/providerdashboard" element={<ProviderDashboard />} />
            <Route path="/campaigns" element={<CampaignPage />} />
        </Routes>
    );
}
