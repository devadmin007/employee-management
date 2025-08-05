import nodeCron from "node-cron";
import moment from "moment";
import { generateSalary } from "../controllers/salary.controller"; // adjust path if needed

const cronJob = async () => {
  nodeCron.schedule("59 23 28-31 * *", async () => {
    const today = moment();
    const tomorrow = moment().add(1, "day");

   
    // Only proceed if today is the last day of the month
    if (tomorrow.date() === 1) {
      console.log("Last day of the month: generating salary...");
      await generateSalary();
      console.log("Salary generation complete.");
    } else {
      console.log("Not last day of the month — skipping salary generation.");
    }
  });
};

export default cronJob;
