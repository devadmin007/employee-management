// export const userCreate = async (req: Request, res: Response) => {
//   try {
//     const { firstName, lastName } = req.body;

//     // 1. Validate base user data
//     const userData = await createUserSchema.parseAsync(req.body);

//     // 2. Handle image upload from req.file
//     if (!req.file || Object.keys(req.file).length === 0) {
//       return handleError(res, { message: "Image file is required" });
//     }

//     const file = req.file as Express.Multer.File;
//     const uploadResult = await Cloudinary.uploadToCloudinary(file, "user_images");

//     // 3. Generate username and password
//     const rawPassword = generatePassword();
//     const hashedPassword = await bcrypt.hash(rawPassword, 10);
//     const employeeId = await generateEmployeeId();

//     // 4. Save to User collection
//     const user = new User({
//       firstName: userData.firstName,
//       lastName: userData.lastName,
//       role: userData.role,
//       password: hashedPassword,
//       username: `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
//     });

//     const saveUser = await user.save();

//     // 5. Prepare user details data
//     req.body.employeeId = employeeId;
//     const userDetail = await userDetailsSchema.parseAsync(req.body);

//     const finalData = {
//       userId: saveUser._id,
//       ...userDetail,
//       image: uploadResult.secure_url, // 👈 Include image URL in user details
//     };

//     // 6. Save to UserDetails collection
//     const createUserDetail = await UserDetails.create(finalData);

//     // 7. Return success response
//     apiResponse(res, StatusCodes.CREATED, "User created successfully", {
//       userId: saveUser._id,
//       username: saveUser.username,
//       role: saveUser.role,
//       employeeId: createUserDetail.employeeId,
//       image: createUserDetail.image,
//     });
//   } catch (error) {
//     handleError(res, error);
//   }
// };
