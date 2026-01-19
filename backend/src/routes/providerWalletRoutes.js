const express = require('express');
const router = express.Router();
const providerWalletController = require('../controllers/providerWalletController');

// Provider Wallet
router.get('/me/wallet', providerWalletController.getWallet);

// Provider Payout Methods
router.get('/me/payout-methods', providerWalletController.listPayoutMethods);
router.put('/me/payout-methods/:id', providerWalletController.updatePayoutMethod);
router.delete('/me/payout-methods/:id', providerWalletController.deletePayoutMethod);

// Provider Campaigns
router.get('/:id/campaigns', providerWalletController.listProviderCampaigns);

module.exports = router;
