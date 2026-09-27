export type ThemeMode = 'day' | 'night';

export interface Suite {
  id: string;
  name: string;
  tagline: string;
  pricePerNight: number;
  rating: number;
  reviewsCount: number;
  maxCats: number;
  sizeSqFt: number;
  features: string[];
  image: string;
  isPopular?: boolean;
}

export interface AddOnOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface BookingFormData {
  suiteId: string;
  checkInDate: string;
  checkOutDate: string;
  catName: string;
  catBreed: string;
  catAge: string;
  catTemperament: string;
  specialCareNotes: string;
  selectedAddOns: string[];
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
}

export interface ConfirmedBooking extends BookingFormData {
  bookingId: string;
  createdAt: string;
  nights: number;
  suiteName: string;
  suitePrice: number;
  addOnsTotal: number;
  totalAmount: number;
  status: 'Confirmed' | 'Pending';
}

export interface FacilityItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  perks: string[];
  image: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  subtitle: string;
  category: 'Ocean View' | 'Suites' | 'Play & Spa' | 'Twilight';
  timeOfDay: 'day' | 'night' | 'both';
  image: string;
}

export type Student = 'sasha' | 'badrul';

export type JobsheetStatus = 'not-started' | 'in-progress' | 'checked';

export interface JobsheetItem {
  id: number;
  status: JobsheetStatus;
  pdfName: string | null;
  pdfUrl: string | null;
  uploadedAt: string | null;
  liveName: string | null;
  liveUrl: string | null;
  note: string | null;
}
