import Donor from "../models/Donor.js";

/* --------------------------
   Create donor profile
-------------------------- */
export const createDonor = async (req, res, next) => {
  try {
    const exists = await Donor.findOne({ userId: req.user.userId });
    if (exists) {
      return res.status(409).json({ message: "Donor already exists" });
    }

    const { displayName, email, phone, country } = req.body;

    const donor = await Donor.create({
      userId: req.user.userId,
      displayName,
      email,
      phone,
      country
    });

    res.status(201).json({ donor: donor.toClient() });
  } catch (err) {
    next(err);
  }
};

/* --------------------------
   Get my donor profile
-------------------------- */
export const getMyDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.userId })
      .populate("donations");

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.json({ donor: donor.toClient() });
  } catch (err) {
    next(err);
  }
};

/* --------------------------
   Update donor profile
-------------------------- */
export const updateDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.userId });
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    const {
      displayName,
      phone,
      country,
      anonymousByDefault,
      receiveUpdates,
      receiveReceipts
    } = req.body;

    if (displayName !== undefined) donor.displayName = displayName;
    if (phone !== undefined) donor.phone = phone;
    if (country !== undefined) donor.country = country;
    if (anonymousByDefault !== undefined) donor.anonymousByDefault = anonymousByDefault;
    if (receiveUpdates !== undefined) donor.receiveUpdates = receiveUpdates;
    if (receiveReceipts !== undefined) donor.receiveReceipts = receiveReceipts;

    await donor.save();

    res.json({ donor: donor.toClient() });
  } catch (err) {
    next(err);
  }
};

/* --------------------------
   Add payment method
-------------------------- */
export const addPaymentMethod = async (req, res, next) => {
  try {
    const { method, mpesaPhone, bankName, accountName, accountNumber } = req.body;

    const donor = await Donor.findOne({ userId: req.user.userId });
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    if (method === "MPESA" && !mpesaPhone) {
      return res.status(400).json({ message: "Mpesa phone required" });
    }

    donor.paymentMethods.push({
      method,
      mpesaPhone,
      bankName,
      accountName,
      accountNumber
    });

    await donor.save();

    res.json({ donor: donor.toClient() });
  } catch (err) {
    next(err);
  }
};

/* --------------------------
   Admin: list donors
-------------------------- */
export const listDonors = async (req, res, next) => {
  try {
    const donors = await Donor.find()
      .populate("userId", "firstName lastName email");

    res.json({ donors: donors.map(d => d.toClient()) });
  } catch (err) {
    next(err);
  }
};

/* --------------------------
   Admin: get donor by id
-------------------------- */
export const getDonorById = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id)
      .populate("userId", "firstName lastName email")
      .populate("donations");

    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.json({ donor: donor.toClient() });
  } catch (err) {
    next(err);
  }
};

/* --------------------------
   Admin: delete donor
-------------------------- */
export const deleteDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findByIdAndDelete(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }

    res.json({ message: "Donor deleted" });
  } catch (err) {
    next(err);
  }
};
