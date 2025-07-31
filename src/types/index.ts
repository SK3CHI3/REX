export interface Officer {
  name: string;
  badge_number?: string;
  rank?: string;
  station?: string;
  photo_url?: string;
}

export interface Case {
  id: string;
  victimName: string;
  age?: number;
  date: string;
  location: string;
  county: string;
  coordinates: [number, number];
  type: 'death' | 'assault' | 'harassment' | 'unlawful_arrest' | 'other';
  description: string;
  status: 'verified' | 'investigating' | 'dismissed';
  photos?: string[];
  videoLinks?: string[];
  source: string;
  reportedBy?: string;
  justiceServed?: boolean;
  // Additional detailed information
  time?: string;
  policeStation?: string;
  officersInvolved?: Officer[];
  witnesses?: string[];
  caseNumber?: string;
  familyContact?: string;
  medicalReport?: string;
  legalStatus?: string;
  compensation?: string;
  created_at?: string;
  updated_at?: string;
  scraped_from_url?: string;
  confidence_score?: number;
  auto_approved?: boolean;
}

export interface FilterState {
  search: string;
  counties: string[];
  caseTypes: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

export interface SubmitCaseData {
  victimName: string;
  age?: number;
  date: string;
  time?: string;
  location: string;
  county: string;
  latitude: number;
  longitude: number;
  type: Case['type'];
  description: string;
  justiceServed?: boolean;
  officerNames?: string[];
  witnesses?: string[];
  photos?: File[];
  videoLinks?: string[];
  reporterName: string;
  reporterContact: string;
  // Temporary fields for form state
  newOfficerName?: string;
  newWitnessName?: string;
}
