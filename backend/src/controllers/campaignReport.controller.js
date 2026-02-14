// Controller for handling campaign report endpoints
// POST /api/campaigns/:id/reports - submit a report
// GET /api/campaigns/:id/reports - list all reports for a campaign

import Campaign from "../models/Campaign.js";

// Submit a campaign report
export const submitCampaignReport = async (req, res, next) => {
  try {
    const campaignId = req.params.id;
    const { report, submittedBy } = req.body;
    if (!report) {
      return res.status(400).json({ message: 'Report content is required.' });
    }
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }
    // Add report to campaign (as subdocument or array)
    const reportObj = {
      report,
      submittedBy: submittedBy || req.user?._id,
      submittedAt: new Date(),
    };
    if (!campaign.reports) campaign.reports = [];
    campaign.reports.push(reportObj);
    await campaign.save();
    res.status(201).json({ message: 'Report submitted successfully.', report: reportObj });
  } catch (err) {
    next(err);
  }
};

// List all reports for a campaign
export const listCampaignReports = async (req, res, next) => {
  try {
    const campaignId = req.params.id;
    const campaign = await Campaign.findById(campaignId).select('reports');
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found.' });
    }
    res.json({ reports: campaign.reports || [] });
  } catch (err) {
    next(err);
  }
};
