import { Area } from "./Area";

export interface User{
  id: number;
  first_name:string;
  last_name:string;
  email:string;
  roles_id:number;
}

export interface LoginResponse {
  token: string;
  token_type: string;
  user:User;
}

export interface UserAreasResponse {
  areas: Area[];
  status: number;
}