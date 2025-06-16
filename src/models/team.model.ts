import { Document,Schema, model} from "mongoose";


export interface Team {
    label:String;
    value:string
}

export interface TeamDocument extends Team , Document {};

const teamSchema = new Schema<TeamDocument>({
    label : {
        type: String,
        required:true,
        unique:true
    },
    value : {
        type: String
    }
    
},{
    timestamps: true
})

export const Team = model<TeamDocument>("Team",teamSchema)