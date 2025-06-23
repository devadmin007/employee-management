import fs from "fs";
import path from "path";
import { Role } from "./models/role.model";
const filePath = path.join(__dirname, "seeds", "role.json");

const createrole = JSON.parse(fs.readFileSync(filePath, "utf-8"));
export const seedRole = async () => {
    try{
        console.log(createrole)
        await Role.create(createrole)
  } catch (error: any) {
    return error.message;
  }
};