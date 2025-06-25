
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
}

export interface FilterState {
  counties: string[];
  caseTypes: string[];
  yearRange: [number, number];
}

export interface SubmitCaseData {
  victimName: string;
  age?: number;
  date: string;
  location: string;
  county: string;
  type: Case['type'];
  description: string;
  photos?: File[];
  videoLinks?: string[];
  reporterName: string;
  reporterContact: string;
}
