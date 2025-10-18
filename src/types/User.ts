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

