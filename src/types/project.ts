
export interface Project {
  id: string;
  title: string;
  clientName: string;
  clientPhone: string;
  address: string;
  scheduledDate: string; // ISO date string (YYYY-MM-DD)
  time: string; // HH:MM format
  description: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  latitude: number;
  longitude: number;
}
