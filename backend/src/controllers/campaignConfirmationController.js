
const Campaign = require('../models/Campaign');
const User = require('../models/User');

// 6. POST /api/campaigns/:id/provider-confirm
exports.providerConfirm = async (req, res) => {
	try {
		const campaignId = req.params.id;
		// Only provider can confirm delivery
		// Assume req.user._id is provider's user ID
		const campaign = await Campaign.findById(campaignId);
		if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
		if (campaign.provider.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Not authorized' });
		}
		campaign.providerConfirmed = true;
		await campaign.save();
		res.json({ message: 'Provider confirmed delivery', campaign });
	} catch (err) {
		res.status(500).json({ message: 'Error confirming delivery', error: err.message });
	}
};

// 7. POST /api/campaigns/:id/beneficiary-confirm
exports.beneficiaryConfirm = async (req, res) => {
	try {
		const campaignId = req.params.id;
		// Only beneficiary can confirm receipt
		// Assume req.user._id is beneficiary's user ID
		const campaign = await Campaign.findById(campaignId);
		if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
		if (campaign.beneficiary.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: 'Not authorized' });
		}
		campaign.beneficiaryConfirmed = true;
		await campaign.save();
		res.json({ message: 'Beneficiary confirmed receipt', campaign });
	} catch (err) {
		res.status(500).json({ message: 'Error confirming receipt', error: err.message });
	}
};
