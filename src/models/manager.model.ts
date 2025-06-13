import { Document, model, Schema } from "mongoose";

export interface Manager {
  label: string;
  value: string;
}

export interface ManagerDocument extends Manager, Document {}

const managerSchema = new Schema<ManagerDocument>({
  label: { 
    type: String, 
    required: true, 
    unique: true,
    
},
  value: {
    type: String,
    required: true,
   
  },
});


export const Manager = model<ManagerDocument>("Manager", managerSchema);
