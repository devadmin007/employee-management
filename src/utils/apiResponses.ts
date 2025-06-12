import {Response} from 'express';


export const apiResponse = async<T>(res: Response, code: number, message: string,  data?: T) =>{
const status = code >= 200 && code < 400 ? 'success' : 'fail';
res.status(code).json({
    status,
    message,
    data : data ?? null
})
}

