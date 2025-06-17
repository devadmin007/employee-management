import { Request, Response } from "express";
import { skillZodSchema, updateSkillSchema } from "../utils/zod";
import { apiResponse } from "../utils/apiResponses";
import { handleError } from "../utils/errHandler";
import { StatusCodes } from "http-status-codes";
import { Skill } from "../models/skill.model";
import { messages } from "../utils/messages";
import { commonPagination } from "../utils/pagination";

export const addSkill = async (req: Request, res: Response) => {
  try {
    const parseResult = skillZodSchema.parse(req.body);
    const label = parseResult.label;
    const value = label.toLocaleLowerCase().replace(/\s+/g, "_");

    const existingSkill = await Skill.findOne({ label });

    if (existingSkill) {
      apiResponse(res, StatusCodes.OK, messages.EXISTING_SKILL);
    }

    const skill = await Skill.create({ label, value });
    if (skill) {
      apiResponse(res, StatusCodes.CREATED, messages.SKILL_ADDED, {
        label: skill.label,
        value: skill.value,
      });
    }
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllSkill = async (req: Request, res: Response) => {
  try {

    const { skill, totalCount, totalPages ,currentPage} = await commonPagination(req, Skill);

    if (skill) {
      apiResponse(res, StatusCodes.OK, messages.SKILLS_FOUND, { skill, totalCount, totalPages, currentPage });
      return;
    }
    apiResponse(res, StatusCodes.NOT_FOUND, messages.SKILLS_NOT_FOUND);
  } catch (error) {
    handleError(res, error);
  }
};

export const getSkillById = async (req: Request, res: Response) => {
  try {
    const skillId = req.params.id;
    const skill = await Skill.findById(skillId);

    if (!skill) {
      apiResponse(res, StatusCodes.OK, messages.SKILL_NOT_FOUND);
    }

    apiResponse(res, StatusCodes.OK, messages.SKILL_FOUND, skill);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateSkillById = async (req: Request, res: Response) => {
  try {
    const skillId = req.params.id;
    const existingSkill = await Skill.findById(skillId);
    if (!existingSkill) {
      apiResponse(res, StatusCodes.NOT_FOUND, messages.SKILL_NOT_FOUND);
    }
    const parseResult = updateSkillSchema.parse(req.body);
    const label = parseResult.label;
    const value = label.toLocaleLowerCase().replace(/\s+/g, "_");

    const updatedSkill = await Skill.findByIdAndUpdate(
      skillId,
      { label, value },
      { new: true }
    );

    if (!updatedSkill) {
      apiResponse(res, StatusCodes.OK, messages.SKILL_NOT_UPDATED);
    }
    apiResponse(res, StatusCodes.OK, messages.SKILL_UPDATED);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteSkillById = async (req: Request, res: Response) => {
  try {
    const skillId = req.params.id;
    const existingSkill = await Skill.findById(skillId);

    if (!existingSkill) {
      apiResponse(res, StatusCodes.OK, messages.SKILL_NOT_FOUND);
    }

    await Skill.findByIdAndDelete(skillId);

    apiResponse(res, StatusCodes.OK, messages.SKILL_DELETED);
  } catch (error) {
    handleError(res, error);
  }
};
