// Tipos compartidos para el perfil de usuario
export interface User {
  id: string;
  name: string;
  email: string;
  rut: string;
  address: string;
  avatar?: string;
}

export interface ContactFieldProps {
  icon: React.ReactNode;
  value: string;
  className?: string;
}

export interface UserInfoProps {
  user: User;
}
