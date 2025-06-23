import fs from "fs";
import path from "path";
import { Role } from "./models/role.model";
const filePath = path.join(__dirname, "seeds", "role.json");

const createrole = JSON.parse(fs.readFileSync(filePath, "utf-8"));
export const seedRole = async () => {
    try{
        console.log(createrole)
        const roleData  =  await Role.find()
        if(roleData.length === 0){
        await Role.create(createrole)
        }else{
          console.log('Role exist')
        }
  } catch (error: any) {
    return error.message;
  }
};