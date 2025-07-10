import { Salary } from "../models/salary.model";
import { LeaveBalance } from "../models/leaveBalance.models";
import moment from "moment";
import { PassThrough } from "stream";
import { Request, Response } from "express";
import { handleError } from "../utils/errHandler";

import { apiResponse } from "../utils/apiResponses";
import { StatusCodes } from "http-status-codes";

import { messages } from "../utils/messages";
import { User } from "../models/user.model";
import { UserDetails } from "../models/userDetails.model";

import { paginationObject } from "../utils/pagination";
import PDFDocument from "pdfkit";
import getStream from "get-stream";
import { Cloudinary } from "../utils/cloudinary";
import { Mongoose } from "mongoose";
import mongoose from "mongoose";

// export const generateSalary = async () => {
//   try {
//     console.log('24===')
//     const generatedAt = new Date();
//     const currentMonth = moment(generatedAt).format("MMMM");
//     const currentYear = moment(generatedAt).year();
//     const totalDays = moment(
//       `${currentMonth} ${currentYear}`,
//       "MMMM YYYY"
//     ).daysInMonth();

//     const users = await User.find({ isDeleted: false });

//     for (const user of users) {
//       const employeeId = user._id;

//       const userDetails = await UserDetails.findOne({ userId: employeeId });

//       if (!userDetails || !userDetails.currentSalary) continue;

//       const baseSalary = userDetails.currentSalary;

//       const existingSalary = await Salary.findOne({
//         employeeId,
//         month: currentMonth,
//       });

//       if (existingSalary) continue;

//       const leaveBalance: any = await LeaveBalance.findOne({
//         employeeId: employeeId,
//       });
// console.log(leaveBalance);

//       const balance = leaveBalance?.leave;
//       const extraLeave = leaveBalance?.extraLeave;

//       let leaveDeduct = 0;

//       if (balance <= 0 && extraLeave > 0) {
//         const perDay = baseSalary / totalDays;
//         leaveDeduct = perDay * extraLeave;
//       }
//       const netSalary = baseSalary - leaveDeduct;
//       console.log(currentMonth);
//       await Salary.create({
//         employeeId,
//         leaveDeducation: leaveDeduct,
//         netSalary,
//         generatedAt:new Date(),
//         month: currentMonth,
//         extraLeave,
//       });

//       console.log("salary generated completed");
//     }
//   } catch (error) {
//     console.log(`error during salary generation`);
//   }
// };

export const generateSalary = async () => {
  try {
    const generatedAt = new Date();
    const currentMonth = moment(generatedAt).format("MMMM");
    const currentYear = moment(generatedAt).year();
    const totalDays = moment(
      `${currentMonth} ${currentYear}`,
      "MMMM YYYY"
    ).daysInMonth();

    const users = await User.find({ isDeleted: false });

    for (const user of users) {
      const employeeId = user._id;

      const userDetails = await UserDetails.findOne({ userId: employeeId });

      if (!userDetails) {
        continue;
      }

      if (!userDetails.currentSalary) {
        continue;
      }

      const baseSalary = userDetails.currentSalary;

      const existingSalary = await Salary.findOne({
        employeeId,
        month: currentMonth,
      });

      if (existingSalary) {
        continue;
      }

      const leaveBalance: any = await LeaveBalance.findOne({ employeeId });

      if (!leaveBalance) {
      }

      const balance = leaveBalance?.leave ?? 0;
      const extraLeave = leaveBalance?.extraLeave ?? 0;

      let leaveDeduct = 0;

      if (balance <= 0 && extraLeave > 0) {
        const perDay = baseSalary / totalDays;
        leaveDeduct = perDay * extraLeave;
      }

      const netSalary = baseSalary - leaveDeduct;

      try {
        await Salary.create({
          employeeId,
          leaveDeducation: leaveDeduct,
          netSalary,
          generatedAt: new Date(),
          month: currentMonth,
          extraLeave,
        });

        console.log(` Salary generated for ${employeeId}`);
      } catch (err) {
        console.error(` Failed to generate salary for ${employeeId}:`, err);
      }
    }

    console.log(" Salary generation completed for all users.");
  } catch (error) {
    console.error(" Error during salary generation:", error);
  }
};

export const getSalaryList = async (req: any, res: Response) => {
  try {
    const pagination = paginationObject(req.query);

    const { skip, resultPerPage, sort } = pagination;
    const match: any = { isDeleted: false };
    const { search, month } = req.query;

    if (
      req.userInfo.role.role === "EMPLOYEE" ||
      req.userInfo.role.role === "PROJECT_MANAGER"
    ) {
      console.log(req.userInfo);
      match.employeeId = new mongoose.Types.ObjectId(req.userInfo.id);
    }
    if (month) {
      match.month = { $regex: `^${month}$`, $options: "i" };
    }
    const pipeline: any = [
      {
        $match: match,
      },
      {
        $lookup: {
          from: "users",
          localField: "employeeId",
          foreignField: "_id",
          as: "employeeId",
        },
      },
      {
        $unwind: { path: "$employeeId", preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          employee_full_name: {
            $concat: ["$employeeId.firstName", " ", "$employeeId.lastName"],
          },
        },
      },
    ];
    if (search) {
      pipeline.push({
        $match: {
          $or: [{ employee_full_name: { $regex: search, $options: "i" } }],
        },
      });
    }

    pipeline.push(
      {
        $project: {
          netSalary: 1,
          month: 1,
          isActive: 1,
          isDeleted: 1,
          createdAt: 1,
          updatedAt: 1,
          employee_full_name: 1,
          extraLeave: 1
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: resultPerPage }
    );
    const [salary, totalSalary] = await Promise.all([
      Salary.aggregate(pipeline),
      Salary.countDocuments(match),
    ]);

    return apiResponse(
      res,
      StatusCodes.OK,
      "Salary list fetched successfully",
      {
        data: salary,
        pagination: {
          totalCount: totalSalary,
          totalPages: pagination.page,
          itemsPerPage: resultPerPage,
        },
      }
    );
  } catch (error) {
    handleError(res, error);
  }
};

export const getSalaryById = async (req: Request, res: Response) => {
  try {
    const salaryId = req.params.id;

    const salary = await Salary.findById(salaryId).populate({
      path: "employeeId",
      select: "-password",
    });

    if (!salary) {
      return apiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        messages.SALARY_NOT_FOUND
      );
    }

    apiResponse(res, StatusCodes.OK, messages.SALARY_FOUND, salary);
  } catch (error) {
    handleError(res, error);
  }
};

export const addSalaryPdf = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.body;

    if (!month && !year) {
      return handleError(res, {
        message: "Please provide at least month or a year",
      });
    }

    // Build match filter
    const match: any = {};
    if (month) {
      match.month = { $regex: `^${month}$`, $options: "i" };
    }
    if (year) {
      match.generatedAt = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      };
    }

    // Fetch salary records
    const salaries = await Salary.find(match).populate({
      path: "employeeId",
      select: "firstName lastName email employeeId",
    });

    if (salaries.length === 0) {
      return handleError(res, {
        message: `No salary records found for ${month || ""} ${year || ""
          }`.trim(),
      });
    }

    // Generate PDF
    const doc = new PDFDocument();
    const chunks: Uint8Array[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);

      const fileObj = {
        originalname: `salary-report-${month || year}-${Date.now()}.pdf`,
        buffer: pdfBuffer,
      } as Express.Multer.File;

      const result = await Cloudinary.uploadToCloudinary(fileObj, "emp");

      return apiResponse(
        res,
        StatusCodes.CREATED,
        "PDF file has been generated successfully",
        { pdfUrl: result.secure_url }
      );
    });

    // // === PDF HEADER ===
    // doc
    //   .fontSize(20)
    //   .fillColor("#000")
    //   .text("Salary Report", { align: "center" })
    //   .moveDown(0.5);

    // doc
    //   .fontSize(12)
    //   .fillColor("gray")
    //   .text(`Period: ${month || "All Months"} ${year || ""}`, {
    //     align: "center",
    //   })
    //   .moveDown(1);

    // // === EMPLOYEE SALARY BLOCKS ===
    // salaries.forEach((salary, index) => {
    //   const employee = salary.employeeId as any;

    //   doc
    //     .fillColor("#000")
    //     .fontSize(13)
    //     .text(`${index + 1}. ${employee.firstName} ${employee.lastName}`, {
    //       underline: true,
    //     });

    //   doc
    //     .fontSize(11)
    //     .fillColor("#333")
    //     .text(`   Email: ${employee.email}`)
    //     .text(`   Net Salary: ₹${salary.netSalary.toFixed(2)}`)
    //     .text(`   Leave Deduction: ₹${salary.leaveDeducation.toFixed(2)}`)
    //      .text(`   Extra Leave: ${salary.extraLeave ?? 0}`)
    //     .text(
    //       `   Generated At: ${moment(salary.generatedAt).format("YYYY-MM-DD")}`
    //     )
    //     .moveDown(1);
    // });

    // // === FOOTER ===
    // doc
    //   .fontSize(10)
    //   .fillColor("gray")
    //   .text(`Report generated on ${moment().format("YYYY-MM-DD HH:mm:ss")}`, {
    //     align: "center",
    //   });

    // === PDF HEADER ===
    doc
      .fontSize(20)
      .fillColor("#000")
      .text("Salary Report", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .fillColor("gray")
      .text(`Period: ${month || "All Months"} ${year || ""}`, {
        align: "center",
      });
    doc.moveDown(1);

    // === TABLE HEADERS ===
    const startX = doc.page.margins.left;
    let startY = doc.y;

    const colWidths = [30, 100, 130, 80, 80, 70, 100]; // widths for each column

    doc
      .fontSize(10)
      .fillColor("#444")
      .text("No.", startX, startY)
      .text("Name", startX + colWidths[0], startY)
      .text("Email", startX + colWidths[0] + colWidths[1], startY)
      .text(
        "Net Salary",
        startX + colWidths[0] + colWidths[1] + colWidths[2],
        startY
      )
      .text(
        "Leave Ded.",
        startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
        startY
      )
      .text(
        "Extra",
        startX +
        colWidths[0] +
        colWidths[1] +
        colWidths[2] +
        colWidths[3] +
        colWidths[4],
        startY
      )
      .text(
        "Generated At",
        startX +
        colWidths[0] +
        colWidths[1] +
        colWidths[2] +
        colWidths[3] +
        colWidths[4] +
        colWidths[5],
        startY
      );

    doc.moveDown(0.5);
    doc.moveTo(startX, doc.y).lineTo(550, doc.y).stroke();

    // === TABLE ROWS ===
    salaries.forEach((salary, index) => {
      const employee = salary.employeeId as any;
      const y = doc.y + 5;

      doc
        .fontSize(9)
        .fillColor("#000")
        .text(`${index + 1}`, startX, y)
        .text(
          `${employee.firstName} ${employee.lastName}`,
          startX + colWidths[0],
          y
        )
        .text(`${employee.email}`, startX + colWidths[0] + colWidths[1], y, {
          width: colWidths[2] - 5,
          ellipsis: true,
        })
        .text(
          `₹${salary.netSalary.toFixed(2)}`,
          startX + colWidths[0] + colWidths[1] + colWidths[2],
          y
        )
        .text(
          `₹${salary.leaveDeducation.toFixed(2)}`,
          startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3],
          y
        )
        .text(
          `${salary.extraLeave ?? 0}`,
          startX +
          colWidths[0] +
          colWidths[1] +
          colWidths[2] +
          colWidths[3] +
          colWidths[4],
          y
        )
        .text(
          `${moment(salary.generatedAt).format("YYYY-MM-DD")}`,
          startX +
          colWidths[0] +
          colWidths[1] +
          colWidths[2] +
          colWidths[3] +
          colWidths[4] +
          colWidths[5],
          y
        );

      doc.moveDown(0.5);

      // Optional: Page break if reaching bottom
      if (doc.y > 750) {
        doc.addPage();
      }
    });

    // === FOOTER ===
    doc.moveDown(1);
    doc
      .fontSize(10)
      .fillColor("gray")
      .text(`Report generated on ${moment().format("YYYY-MM-DD HH:mm:ss")}`, {
        align: "center",
      });
    doc.end(); // this triggers 'end' event above
  } catch (error) {
    handleError(res, error);
  }
};
