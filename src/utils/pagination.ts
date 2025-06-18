import { Request } from "express";

export const commonPagination = async (req: Request, modelName: any) => {
  try {
    const page = Number(req.query.page as string) || 1;
    const limit = Number(req.query.limit as string) || 10;
    const { search } = req.query as { search?: string };
    const skip = (page - 1) * limit;

    const query: any = {};

    if (search) {
      query.$or = [{ label: { $regex: search, $options: "i" } }];
    }
    const skill = await modelName.find(query).skip(skip).limit(limit);
    const totalCount = await modelName.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    return { skip, totalCount, totalPages, search, skill, currentPage: page };
  } catch (error: any) {
    console.log(`error occured in commonPagination ${error}`);
    throw new Error(error);
  }
};
