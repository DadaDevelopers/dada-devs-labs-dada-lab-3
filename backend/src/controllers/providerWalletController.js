
const Provider = require('../models/Provider');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
// Assume Wallet and PayoutMethod models exist or are part of Provider

// 1. GET /api/providers/me/wallet
exports.getWallet = async (req, res) => {
	try {
		// Assuming req.user._id is the logged-in provider's user ID
		const provider = await Provider.findOne({ user: req.user._id });
		if (!provider) return res.status(404).json({ message: 'Provider not found' });
		// Example wallet structure
		res.json({ balance: provider.walletBalance, currency: provider.walletCurrency });
	} catch (err) {
		res.status(500).json({ message: 'Error fetching wallet', error: err.message });
	}
};

// 2. GET /api/providers/me/payout-methods
exports.listPayoutMethods = async (req, res) => {
	try {
		const provider = await Provider.findOne({ user: req.user._id });
		if (!provider) return res.status(404).json({ message: 'Provider not found' });
		res.json({ payoutMethods: provider.payoutMethods || [] });
	} catch (err) {
		res.status(500).json({ message: 'Error fetching payout methods', error: err.message });
	}
};

// 3. PUT /api/providers/me/payout-methods/:id
exports.updatePayoutMethod = async (req, res) => {
	try {
		const provider = await Provider.findOne({ user: req.user._id });
		if (!provider) return res.status(404).json({ message: 'Provider not found' });
		const methodId = req.params.id;
		const methodIndex = provider.payoutMethods.findIndex(m => m._id.toString() === methodId);
		if (methodIndex === -1) return res.status(404).json({ message: 'Payout method not found' });
		provider.payoutMethods[methodIndex] = { ...provider.payoutMethods[methodIndex], ...req.body };
		await provider.save();
		res.json({ payoutMethod: provider.payoutMethods[methodIndex] });
	} catch (err) {
		res.status(500).json({ message: 'Error updating payout method', error: err.message });
	}
};

// 4. DELETE /api/providers/me/payout-methods/:id
exports.deletePayoutMethod = async (req, res) => {
	try {
		const provider = await Provider.findOne({ user: req.user._id });
		if (!provider) return res.status(404).json({ message: 'Provider not found' });
		const methodId = req.params.id;
		provider.payoutMethods = provider.payoutMethods.filter(m => m._id.toString() !== methodId);
		await provider.save();
		res.json({ message: 'Payout method deleted' });
	} catch (err) {
		res.status(500).json({ message: 'Error deleting payout method', error: err.message });
	}
};

// 5. GET /api/providers/:id/campaigns
exports.listProviderCampaigns = async (req, res) => {
	try {
		const providerId = req.params.id;
		const campaigns = await Campaign.find({ provider: providerId });
		res.json({ campaigns });
	} catch (err) {
		res.status(500).json({ message: 'Error fetching campaigns', error: err.message });
	}
};
