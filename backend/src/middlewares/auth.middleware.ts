import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ message: "No token provided" });
	}
	const token = authHeader.split(" ")[1];
	try {
		const secret = process.env.JWT_ACCESS_SECRET || "changeme";
		const decoded = jwt.verify(token, secret);
		// @ts-ignore
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({ message: "Invalid token" });
	}
};
