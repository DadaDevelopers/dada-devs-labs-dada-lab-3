const express = require('express');
const router = express.Router();
const campaignConfirmationController = require('../controllers/campaignConfirmationController');

// Campaign Confirmation
router.post('/:id/provider-confirm', campaignConfirmationController.providerConfirm);
router.post('/:id/beneficiary-confirm', campaignConfirmationController.beneficiaryConfirm);

module.exports = router;
