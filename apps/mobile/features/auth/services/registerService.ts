import { RegisterData } from '../types/RegisterData';
import { API_CONFIG } from '~/constants/config';

export async function registerUser(data: RegisterData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/v1/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    // El backend siempre responde con { success, message }
    if (response.ok && result.success) {
      return { success: true, message: result.message || 'Registro exitoso' };
    } else {
      return { success: false, message: result.message || 'Verifica los datos.' };
    }
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
