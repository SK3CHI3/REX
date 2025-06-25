
import { Case } from '@/types';

export const mockCases: Case[] = [
  {
    id: '1',
    victimName: 'John Doe',
    age: 25,
    date: '2024-01-15',
    location: 'Kibera, Nairobi',
    county: 'Nairobi',
    coordinates: [-1.3132, 36.7908],
    type: 'assault',
    description: 'Victim was assaulted during a peaceful protest. Multiple witnesses present.',
    status: 'verified',
    photos: ['https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400'],
    source: 'Daily Nation',
    reportedBy: 'Human Rights Watch'
  },
  {
    id: '2',
    victimName: 'Jane Smith',
    age: 30,
    date: '2024-02-20',
    location: 'Mombasa Road',
    county: 'Nairobi',
    coordinates: [-1.3089, 36.9301],
    type: 'unlawful_arrest',
    description: 'Unlawful arrest during routine traffic stop. No charges filed.',
    status: 'investigating',
    source: 'The Standard',
  },
  {
    id: '3',
    victimName: 'Michael Johnson',
    age: 22,
    date: '2023-12-10',
    location: 'Kisumu Central',
    county: 'Kisumu',
    coordinates: [-0.0917, 34.7680],
    type: 'death',
    description: 'Fatal shooting during police operation. Family demands justice.',
    status: 'verified',
    photos: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400'],
    source: 'Kenya Human Rights Commission'
  },
  {
    id: '4',
    victimName: 'Sarah Wilson',
    age: 28,
    date: '2024-03-05',
    location: 'Nakuru Town',
    county: 'Nakuru',
    coordinates: [-0.3031, 36.0800],
    type: 'harassment',
    description: 'Verbal harassment and intimidation at roadblock.',
    status: 'verified',
    source: 'Citizen Report'
  },
  {
    id: '5',
    victimName: 'David Kamau',
    age: 35,
    date: '2024-01-28',
    location: 'Eldoret',
    county: 'Uasin Gishu',
    coordinates: [0.5143, 35.2698],
    type: 'assault',
    description: 'Beaten during arrest despite cooperation.',
    status: 'investigating',
    source: 'Local News'
  }
];

export const kenyanCounties = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu',
  'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho',
  'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui',
  'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
  'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi',
  'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri',
  'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

export const caseTypes = [
  { value: 'death', label: 'Death' },
  { value: 'assault', label: 'Physical Assault' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'unlawful_arrest', label: 'Unlawful Arrest' },
  { value: 'other', label: 'Other' }
];
