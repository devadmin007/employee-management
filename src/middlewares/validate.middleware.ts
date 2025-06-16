import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
declare global {
  namespace Express {
    interface Request {
      user?: { role?: string; [key: string]: any };
    }
  }
}

export const authorization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userRole = req.userInfo?.role;
  if (userRole === "HR" || userRole === "ADMIN") {
    next();
  } else {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "You are not authorized to access this resource.",
    });
  }
};
