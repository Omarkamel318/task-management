export type Role = 'Admin' | 'Manager' | 'Senior' | 'Junior';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: Role;
}
