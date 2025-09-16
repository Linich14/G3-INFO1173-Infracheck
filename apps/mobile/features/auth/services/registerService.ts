import { RegisterData } from '../types/RegisterData';

export async function registerUser(data: RegisterData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/v1/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      return { success: true, message: 'Registro exitoso' };
    } else {
      const errorData = await response.json();
      return { success: false, message: errorData.detail || 'Verifica los datos.' };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
