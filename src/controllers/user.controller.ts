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
import { paginationObject } from "../utils/pagination";

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

    const user: any = await User.findOne({ username }).populate('role');
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
      firstName: user?.firstName,
      lastName: user?.lastName,
      username: user?.username,
      role: user?.role?.role
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


const safeAssign = (target: any, source: any) => {
  for (const key in source) {
    if (
      source[key] !== undefined &&
      source[key] !== null &&
      (typeof source[key] !== "string" || source[key].trim() !== "") &&
      (!Array.isArray(source[key]) || source[key].length > 0)
    ) {
      target[key] = source[key];
    }
  }
};

export const userCreate = async (req: Request, res: Response) => {
  try {
    const { step } = req.body;
    const stepNumber = parseInt(step);

    if (![1, 2, 3, 4].includes(stepNumber)) {
      return handleError(res, { message: "Invalid step" });
    }

    let user;
    let userId = req.body.userId;

    // Step 1: Create User and UserDetails
    if (stepNumber === 1) {
      const {
        firstName,
        lastName,
        phoneNumber,
        personalNumber,
        currentAddress,
        permenentAddress,
        role,
      } = req.body;

      if (!req.file) {
        return handleError(res, { message: "Image is required in step 1" });
      }

      const file = req.file as Express.Multer.File;
      const uploadResult = await Cloudinary.uploadToCloudinary(
        file,
        "employee_management"
      );

      const rawPassword = generatePassword();
      const hashedPassword = await bcrypt.hash(rawPassword, 10);
      const employeeId = await generateEmployeeId();

      user = new User({
        firstName,
        lastName,
        role,
        password: hashedPassword,
        image: uploadResult.secure_url,
        employeeId,
        username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
      });

      const savedUser = await user.save();

      const userDetails = new UserDetails({
        userId: savedUser._id,
        phoneNumber,
        personalNumber,
        currentAddress,
        permenentAddress,
      });

      await userDetails.save();

      return apiResponse(res, StatusCodes.CREATED, "Step 1 completed", {
        userId: savedUser._id,
        username: savedUser.username,
        employeeId: savedUser.employeeId,
      });
    }

    // Steps 2–4: Update UserDetails only
    if (!userId) {
      return handleError(res, { message: "userId is required for steps 2–4" });
    }

    const userDetailsUpdate: any = {};

    if (stepNumber === 2) {
      const {
        managerId,
        designationId,
        teamId,
        secondarySkills,
        primarySkills,
        department,
      } = req.body;

      const parsedPrimarySkills =
        typeof primarySkills === "string"
          ? primarySkills.split(",").map((id: string) => id.trim())
          : Array.isArray(primarySkills)
            ? primarySkills
            : [];

      const parsedSecondarySkills =
        typeof secondarySkills === "string"
          ? secondarySkills.split(",").map((id: string) => id.trim())
          : Array.isArray(secondarySkills)
            ? secondarySkills
            : [];

      safeAssign(userDetailsUpdate, {
        managerId,
        designationId,
        teamId,
        secondarySkills: parsedSecondarySkills,
        primarySkills: parsedPrimarySkills,
        department,
      });
    }

    if (stepNumber === 3) {
      const {
        joiningDate,
        probationDate,
        panNo,
        aadharNo,
        pfNo,
        uanDetail,
        previousExperience,
      } = req.body;

      safeAssign(userDetailsUpdate, {
        joiningDate,
        probationDate,
        panNo,
        aadharNo,
        pfNo,
        uanDetail,
        previousExperience,
      });
    }

    if (stepNumber === 4) {
      const { accountNumber, ifscCode, branchName } = req.body;

      const bankDetails: any = {};
      safeAssign(bankDetails, { accountNumber, ifscCode, branchName });

      if (Object.keys(bankDetails).length > 0) {
        userDetailsUpdate.bankDetails = bankDetails;
      }
    }

    await UserDetails.findOneAndUpdate(
      { userId: userId },
      { $set: userDetailsUpdate },
      { new: true }
    );

    return apiResponse(res, StatusCodes.OK, `Step ${stepNumber} completed`, {
      userId,
    });
  } catch (error) {
    handleError(res, error);
  }
};

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

export const updateUser = async (req: Request, res: Response) => {
  try {
    const stepNumber = parseInt(req.body.step);
    const userId = req.params.userId;

    if (!userId) {
      return handleError(res, { message: "userId is required in params" });
    }

    if (![1, 2, 3, 4].includes(stepNumber)) {
      return handleError(res, { message: "Invalid step" });
    }

    const userDetailsUpdate: any = {};

    // Step 1: Update basic user info
    if (stepNumber === 1) {
      const {
        firstName,
        lastName,
        phoneNumber,
        personalNumber,
        currentAddress,
        permenentAddress,
        role,
      } = req.body;

      let updateUserData: any = {
        firstName,
        lastName,
        role,
      };

      if (req.file) {
        const file = req.file as Express.Multer.File;
        const uploadResult = await Cloudinary.uploadToCloudinary(
          file,
          "employee_management"
        );
        updateUserData.image = uploadResult.secure_url;
      } {
        updateUserData.image = req.body.image
      }

      await User.findByIdAndUpdate(userId, { $set: updateUserData }, { new: true });

      Object.assign(userDetailsUpdate, {
        phoneNumber,
        personalNumber,
        currentAddress,
        permenentAddress,
      });
    }

    // Step 2: Update professional info
    if (stepNumber === 2) {
      const {
        managerId,
        designationId,
        teamId,
        secondarySkills,
        primarySkills,
        department,
      } = req.body;

      const parsedPrimarySkills = typeof primarySkills === 'string'
        ? primarySkills.split(',').map((id: string) => id.trim())
        : [];

      const parsedSecondarySkills = typeof secondarySkills === 'string'
        ? secondarySkills.split(',').map((id: string) => id.trim())
        : [];

      Object.assign(userDetailsUpdate, {
        managerId,
        designationId,
        teamId,
        secondarySkills: parsedSecondarySkills,
        primarySkills: parsedPrimarySkills,
        department,
      });
    }

    // Step 3: Update legal & experience info
    if (stepNumber === 3) {
      const {
        joiningDate,
        probationDate,
        panNo,
        aadharNo,
        pfNo,
        uanDetail,
        previousExperience,
      } = req.body;

      Object.assign(userDetailsUpdate, {
        joiningDate,
        probationDate,
        panNo,
        aadharNo,
        pfNo,
        uanDetail,
        previousExperience,
      });
    }

    // Step 4: Update bank details
    if (stepNumber === 4) {
      const { accountNumber, ifscCode, branchName } = req.body;

      userDetailsUpdate.bankDetails = {
        accountNumber,
        ifscCode,
        branchName,
      };
    }

    // Apply update if any details collected
    if (Object.keys(userDetailsUpdate).length > 0) {
      await UserDetails.findOneAndUpdate(
        { userId },
        { $set: userDetailsUpdate },
        { new: true }
      );
    }

    return apiResponse(res, StatusCodes.OK, `Step ${stepNumber} update successful`, {
      userId,
    });
  } catch (error) {
    handleError(res, error);
  }
};


export const getAllRole = async (req: Request, res: Response) => {
  try {
    const roles = await Role.find({ role: { $ne: "ADMIN" } });

    if (roles.length === 0) {
      return apiResponse(res, StatusCodes.OK, messages.ROLE_FOUND, []);
    }
    apiResponse(res, StatusCodes.OK, messages.ROLE_FOUND, { roles: roles });
  } catch (error) {
    handleError(res, error);
  }
};

export const userList = async (req: Request, res: Response) => {
  try {
    const { search, role, pagination } = req.query;

    const query: any = { isDeleted: false, isActive: true };
    const isPaginationEnabled = pagination !== "false";

    let filterRoleId: Types.ObjectId | null = null;
    if (role && Types.ObjectId.isValid(role as string)) {
      filterRoleId = new Types.ObjectId(role as string);
    }

    // Shared base pipeline (used for both count and data)
    const basePipeline: any[] = [
      {
        $addFields: {
          fullName: { $concat: ["$firstName", " ", "$lastName"] },
        },
      },
      { $match: query },
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
        $lookup: {
          from: "roles",
          localField: "role",
          foreignField: "_id",
          as: "userRole",
        },
      },
      {
        $unwind: {
          path: "$userRole",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          ...(filterRoleId && { role: filterRoleId }),
          "userRole.role": { $ne: "ADMIN" },
        },
      },
    ];

    // Add search filter
    if (search) {
      basePipeline.push({
        $match: {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    // If pagination is disabled and no role is passed, fetch only project managers
    if (!isPaginationEnabled && !filterRoleId) {
      basePipeline.push({
        $match: {
          "userRole.role": "PROJECT_MANAGER",
        },
      });
    }

    // Clone base pipeline for count query
    const countPipeline = JSON.parse(JSON.stringify(basePipeline));
    countPipeline.push({ $count: "total" });

    // Run count query
    const countResult = await User.aggregate(countPipeline);
    const totalUser = countResult[0]?.total || 0;

    // Prepare final pipeline for user data
    const dataPipeline = [...basePipeline];

    // Apply sort and pagination
    if (isPaginationEnabled) {
      const paginationData = paginationObject(req.query);
      dataPipeline.push({ $sort: paginationData.sort || { createdAt: -1 } });
      dataPipeline.push({ $skip: paginationData.skip || 0 });
      dataPipeline.push({ $limit: paginationData.resultPerPage || 10 });
    } else {
      dataPipeline.push({ $sort: { createdAt: -1 } });
    }

    // Final projection
    dataPipeline.push({
      $project: {
        firstName: 1,
        lastName: 1,
        fullName: 1,
        email: 1,
        isDeleted: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        role: "$userRole.role",
      },
    });

    const user = await User.aggregate(dataPipeline);

    const totalPages = isPaginationEnabled
      ? Math.ceil(totalUser / (paginationObject(req.query).resultPerPage || 10))
      : 1;

    apiResponse(res, StatusCodes.OK, messages.USER_LIST, {
      user,
      totalUser,
      totalPages,
    });
  } catch (error) {
    console.error("Aggregation Error:", error);
    handleError(res, error);
  }
};

