import { Area } from "./Area";

export interface User{
  id: number;
  first_name:string;
  last_name:string;
  email:string;
  roles_id:Role[];
}

export interface Role {
  id: number;
  name: string;
} 

export interface LoginResponse {
  token: string;
  token_type: string;
  user:User;
}

export interface UserRoleAreas{
  role_id: number;
  role_name: string;
  areas: Area[];
}

export interface UserAreasResponse {
  message: string;
  data: UserRoleAreas[];
  status: number;
}