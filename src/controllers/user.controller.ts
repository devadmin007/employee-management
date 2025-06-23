import { User } from "../models/user.model";
import {
  registerSchema,
  loginSchema,
  createUserSchema,
  userDetailsSchema,
  updateUserSchema,
} from "../utils/zod";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { apiResponse } from "../utils/apiResponses";
import { messages } from "../utils/messages";
import { handleError } from "../utils/errHandler";
import { StatusCodes } from "http-status-codes";
import { UserDetails } from "../models/userDetails.model";
import { Types } from "mongoose";
import { Cloudinary } from "../utils/cloudinary";
import { Role } from "../models/role.model";
import mongoose from "mongoose";

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
        id: user._id,
      },
      process.env.JWT_SECRETKEY!,
      { expiresIn: "7d" }
    );

    apiResponse(res, StatusCodes.OK, messages.USER_LOGIN_SUCCESS, {
      token: accessToken,
      firstName: user.firstName,
      lastName: user.lastName,
      username : user.username
    });
  } catch (error) {
    handleError(res, error);
  }
};

const generateEmployeeId = async () => {
  const lastUser = await User.findOne().sort({ createdAt: -1 });
  const lastNumber = lastUser?.employeeId?.match(/\d+/)?.[0] || "0";
  const newNumber = String(Number(lastNumber) + 1).padStart(3, "0");
  return `EMP${newNumber}`;
};

const generatePassword = () => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
  return Array.from(
    { length: 10 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};


export const userCreate = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { firstName, lastName } = req.body;
    const userData = await createUserSchema.parseAsync(req.body);

    if (!req.file || Object.keys(req.file).length === 0) {
      await session.abortTransaction();
      session.endSession();
      return handleError(res, { message: "Image file is required" });
    }

    const file = req.file as Express.Multer.File;
    const uploadResult = await Cloudinary.uploadToCloudinary(
      file,
      "employee_management"
    );

    const rawPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const employeeId = await generateEmployeeId();

    req.body.employeeId = employeeId;

    const user = new User({
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      password: hashedPassword,
      image: uploadResult.secure_url,
      employeeId: employeeId,
      username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
    });

    const saveUser = await user.save({ session });

    const userDetail = await userDetailsSchema.parseAsync(req.body);

    const finalData = {
      userId: saveUser._id,
      ...userDetail,
    };

    await UserDetails.create([finalData], { session });

    await session.commitTransaction();
    session.endSession();

    apiResponse(res, StatusCodes.CREATED, "User created successfully", {
      userId: saveUser._id,
      username: saveUser.username,
      employeeId: saveUser.employeeId,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    handleError(res, error);
  }
};
;

export const getUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const userWithDetails = await User.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(userId),
          isActive: true,
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "userdetails",
          localField: "_id",
          foreignField: "userId",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          password: 0,
          __v: 0,
          "userDetails._id": 0,
          "userDetails.__v": 0,
        },
      },
    ]);

    if (!userWithDetails || userWithDetails.length === 0) {
      return apiResponse(res, StatusCodes.NOT_FOUND, messages.USER_NOT_FOUND);
    }

    return apiResponse(
      res,
      StatusCodes.OK,
      "User fetched successfully",
      userWithDetails[0]
    );
  } catch (error) {
    handleError(res, error);
  }
};

export const updateUserDetaisById = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const updateData = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return apiResponse(res, StatusCodes.BAD_REQUEST, messages.USER_NOT_FOUND);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    const updatedUserDetail = await UserDetails.findOneAndUpdate(
      { userId: userId },
      updateData,
      { new: true }
    );

    return apiResponse(res, StatusCodes.OK, messages.USER_UPDATED, {
      user: updatedUser,
      userDetails: updatedUserDetail,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllRole = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find();

    if (roles.length === 0) {
      return apiResponse(res, StatusCodes.OK, messages.ROLE_NOT_FOUND);
    }
    apiResponse(res, StatusCodes.OK, messages.ROLE_FOUND, { roles: roles });
  } catch (error) {
    handleError(res, error);
  }
};
