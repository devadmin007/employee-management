import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface EmailPayload {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (payload: EmailPayload): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      port: 465,
      service: "gmail",
      auth: {
        user: 'keyurmodi2508@gmail.com',
        pass: 'nbunbakymdzdlnbi',
      },
    });
    console.log(payload, 'snwksnjkns')
    const mailOptions = {
      from: 'keyurmodi2508@gmail.com',
      to: payload.email,
      subject: payload.subject,
      html: payload.message,
    };
    console.log(mailOptions, ".................");

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error: any) {
    throw new Error(`Failed to send email: ${error}`);
  }

};

export default sendEmail;

