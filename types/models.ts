import type { Timestamp } from 'firebase/firestore';

export type Status = 'Pending' | 'Under Review' | 'In Progress' | 'Resolved' | 'Rejected';

export type Category =
  | 'Potholes'
  | 'Water Leak'
  | 'Gutters'
  | 'Flooding'
  | 'Streetlights'
  | 'Power Outage'
  | 'Illegal Dumping'
  | 'Public Facility'
  | 'Other';

// The Gambia's eight local government areas, labelled with the region or
// municipality people actually use day to day.
export type Area =
  | 'Banjul City'
  | 'Kanifing Municipal'
  | 'West Coast (Brikama)'
  | 'North Bank (Kerewan)'
  | 'Lower River (Mansakonko)'
  | 'Central River North (Kuntaur)'
  | 'Central River South (Janjanbureh)'
  | 'Upper River (Basse)';

export type Role = 'citizen' | 'admin';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Timestamp;
}

export interface Report {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: Category;
  status: Status;
  imageUrl: string | null;
  location: { lat: number; lng: number } | null;
  address: string | null;
  // null on reports filed before areas were introduced.
  area: Area | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  adminNotes: string | null;
}
