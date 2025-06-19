import { User } from "../models/user.model";
import { registerSchema, loginSchema } from "../utils/zod";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { apiResponse } from "../utils/apiResponses";
import { messages } from "../utils/messages";
import { handleError } from "../utils/errHandler";
import { StatusCodes } from "http-status-codes";
import { Console } from "console";

export const createUser = async (req: Request, res: Response) => {
  try {
    const parseResult = registerSchema.parse(req.body);
    const { username, password } = parseResult;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.EXISTING_USER);
    }
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);
    const finalData = {
      ...parseResult,
      password: hashedPassword,
    };

    const user = await User.create(finalData);
    if (user) {
      apiResponse(res, StatusCodes.CREATED, messages.USER_REGISTERED, {
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.parse(req.body);
    const { username, password } = parseResult;

    const user = await User.findOne({ username });
    if (!user) {
      apiResponse(res, StatusCodes.NOT_FOUND, messages.USER_NOT_FOUND);
      return;
    }

    const comparedPassword = await bcrypt.compare(password, user.password);
    if (!comparedPassword) {
      apiResponse(res, StatusCodes.UNAUTHORIZED, messages.INCORRECT_PASSWORD);
    }

    const accessToken = jwt.sign(
      {
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRETKEY!,
      { expiresIn: "7d" }
    );

    apiResponse(res, StatusCodes.OK, messages.USER_LOGIN_SUCCESS, {
      token: accessToken,
    });
  } catch (error) {
    handleError(res, error);
  }
};
