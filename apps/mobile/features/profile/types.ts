// Tipos compartidos para el perfil de usuario
export interface User {
  usua_id: number;
  usua_rut: string;
  usua_nombre: string;
  usua_apellido: string;
  full_name: string;
  usua_nickname: string;
  usua_email: string;
  usua_telefono: number;
  usua_creado: string;
  usua_actualizado: string | null;
  usua_estado: number;
  rous_id: number;
  role_name: string;
  avatar?: string; 
}

// Interface para la respuesta de la API
export interface UserProfileResponse {
  usua_id: number;
  usua_rut: string;
  usua_nombre: string;
  usua_apellido: string;
  full_name: string;
  usua_nickname: string;
  usua_email: string;
  usua_telefono: number;
  usua_creado: string;
  usua_actualizado: string | null;
  usua_estado: number;
  rous_id: number;
  role_name: string;
}

// Interface para actualizar perfil
export interface UserUpdateData {
  usua_nombre?: string;
  usua_apellido?: string;
  usua_nickname?: string;
  usua_email?: string;
  usua_telefono?: number;
}

// Interface para cambiar contraseña
export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface UserInfoProps {
  user: User;
}

export interface ContactFieldProps {
  icon: React.ReactNode;
  value: string;
  className?: string;
  showEditIcon?: boolean;
}
