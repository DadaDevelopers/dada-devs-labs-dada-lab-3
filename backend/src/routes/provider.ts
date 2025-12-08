import { Router } from "express";
import * as providerController from "../controllers/provider.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, providerController.createProvider);
router.get("/", providerController.getProviders);
router.get("/:id", providerController.getProviderById);

export default router;
