import { Request, Response } from "express";
import { apiResponse } from "../utils/apiResponses";
import { handleError } from "../utils/errHandler";
import { StatusCodes } from "http-status-codes";
import { messages } from "../utils/messages";
import { Holiday } from "../models/holidayList.model";
import { createHolidaySchema, updateHolidaySchema } from "../utils/zod";

export const addHoliday = async (req: Request, res: Response) => {
  try {
    const parseData = createHolidaySchema.parse(req.body);
    const label = parseData.label;

    const existingHoliday = await Holiday.findOne({ label });

    if (existingHoliday) {
      return apiResponse(res, StatusCodes.BAD_REQUEST, messages.HOLIDAY_EXIST);
    }

    const holiday = await Holiday.create({ label });

    if (holiday) {
      apiResponse(res, StatusCodes.CREATED, messages.HOLIDAY_CREATED, {
        label,
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllHolidays = async (req: Request, res: Response) => {
  try {
    const holiday = await Holiday.find();
    if (holiday.length === 0) {
      return apiResponse(
        res,
        StatusCodes.NOT_FOUND,
        messages.HOLIDAY_NOT_FOUND
      );
    }

    apiResponse(res, StatusCodes.OK, messages.HOLIDAY_FOUND, {
      holidays: holiday,
    });
  } catch (error) {
    handleError(res, error);
  }
};

export const getHoliday = async (req: Request, res: Response) => {
  try {
    const holidayId = req.params.id;

    const holiday = await Holiday.findById(holidayId);

    if (!holiday) {
      return apiResponse(
        res,
        StatusCodes.NOT_FOUND,
        messages.HOLIDAY_NOT_FOUND
      );
    }

    apiResponse(res, StatusCodes.OK, messages.HOLIDAY_FOUND, {
      holiday: holiday,
    });

  } catch (error) {
    handleError(res, error);
  }
};

export const updateHolidayById = async (req: Request, res: Response) => {
  try {
    const holidayId = req.params.id;

    const parseData = updateHolidaySchema.parse(req.body);

    const existingHoliday = await Holiday.findById(holidayId);

    if (!existingHoliday) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.HOLIDAY_EXIST);
    }
    const label = parseData.label;

    const updateHoliday = await Holiday.findByIdAndUpdate(
      holidayId,
      { label: label },
      { new: true }
    );
    if (!updateHoliday) {
      apiResponse(res, StatusCodes.OK, messages.HOLIDAY_NOT_UPDATED);
    }
    apiResponse(res, StatusCodes.OK, messages.HOLIDAY_UPDATED);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteHolidayById = async (req: Request, res: Response) => {
  try {
    const holidayId = req.params.id;
    const existingHoliday = await Holiday.findById(holidayId);
    if (!existingHoliday) {
      apiResponse(res, StatusCodes.BAD_REQUEST, messages.HOLIDAY_NOT_FOUND);
    }
    await Holiday.findByIdAndDelete(holidayId);
    apiResponse(res, StatusCodes.OK, messages.HOLIDAY_DELETED);
  } catch (error) {
    handleError(res, error);
  }
};
