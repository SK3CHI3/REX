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
  },
  {
    id: '6',
    victimName: 'Grace Wanjiku',
    age: 27,
    date: '2024-03-12',
    location: 'Thika Town',
    county: 'Kiambu',
    coordinates: [-1.0332, 37.0692],
    type: 'harassment',
    description: 'Harassment during night patrol stop.',
    status: 'verified',
    source: 'Citizen Report'
  },
  {
    id: '7',
    victimName: 'Peter Mwangi',
    age: 33,
    date: '2024-02-28',
    location: 'Mombasa Old Town',
    county: 'Mombasa',
    coordinates: [-4.0435, 39.6682],
    type: 'assault',
    description: 'Physical assault during bar raid.',
    status: 'investigating',
    source: 'Coast Times'
  },
  {
    id: '8',
    victimName: 'Mary Njeri',
    age: 24,
    date: '2024-03-08',
    location: 'Machakos Town',
    county: 'Machakos',
    coordinates: [-1.5177, 37.2634],
    type: 'unlawful_arrest',
    description: 'Arrested without warrant during market operation.',
    status: 'verified',
    source: 'Eastern Standard'
  },
  {
    id: '9',
    victimName: 'James Ochieng',
    age: 29,
    date: '2024-02-15',
    location: 'Kisumu Kondele',
    county: 'Kisumu',
    coordinates: [-0.1022, 34.7617],
    type: 'death',
    description: 'Death in custody under suspicious circumstances.',
    status: 'investigating',
    source: 'Lake Region Herald'
  },
  {
    id: '10',
    victimName: 'Ruth Akinyi',
    age: 31,
    date: '2024-03-01',
    location: 'Nyeri Town',
    county: 'Nyeri',
    coordinates: [-0.4209, 36.9475],
    type: 'harassment',
    description: 'Verbal threats and intimidation.',
    status: 'verified',
    source: 'Mountain Echo'
  },
  {
    id: '11',
    victimName: 'Samuel Kiprop',
    age: 26,
    date: '2024-02-22',
    location: 'Kericho Town',
    county: 'Kericho',
    coordinates: [-0.3676, 35.2869],
    type: 'assault',
    description: 'Beaten during tea plantation protest.',
    status: 'verified',
    source: 'Highland Post'
  },
  {
    id: '12',
    victimName: 'Esther Wambui',
    age: 38,
    date: '2024-01-30',
    location: 'Embu Town',
    county: 'Embu',
    coordinates: [-0.5317, 37.4502],
    type: 'unlawful_arrest',
    description: 'Detained without charge for 48 hours.',
    status: 'investigating',
    source: 'Eastern Breeze'
  },
  {
    id: '13',
    victimName: 'Daniel Mutua',
    age: 42,
    date: '2024-03-18',
    location: 'Kitui Market',
    county: 'Kitui',
    coordinates: [-1.3669, 38.0106],
    type: 'harassment',
    description: 'Harassment during market inspection.',
    status: 'verified',
    source: 'Ukambani News'
  },
  {
    id: '14',
    victimName: 'Alice Cherop',
    age: 23,
    date: '2024-02-10',
    location: 'Kapenguria',
    county: 'West Pokot',
    coordinates: [1.2389, 35.1115],
    type: 'assault',
    description: 'Physical assault during cattle rustling operation.',
    status: 'investigating',
    source: 'Northern Frontier'
  },
  {
    id: '15',
    victimName: 'Francis Kiprotich',
    age: 35,
    date: '2024-03-22',
    location: 'Bomet Town',
    county: 'Bomet',
    coordinates: [-0.7828, 35.3428],
    type: 'death',
    description: 'Fatal shooting during disputed land eviction.',
    status: 'verified',
    source: 'Rift Valley Standard'
  },
  {
    id: '16',
    victimName: 'Catherine Wanjala',
    age: 28,
    date: '2024-01-25',
    location: 'Bungoma Town',
    county: 'Bungoma',
    coordinates: [0.5692, 34.5608],
    type: 'harassment',
    description: 'Intimidation during political rally.',
    status: 'verified',
    source: 'Western Mirror'
  },
  {
    id: '17',
    victimName: 'Robert Otieno',
    age: 44,
    date: '2024-02-05',
    location: 'Homa Bay Town',
    county: 'Homa Bay',
    coordinates: [-0.5273, 34.4571],
    type: 'unlawful_arrest',
    description: 'Arrest during fishing license dispute.',
    status: 'investigating',
    source: 'Lake Tribune'
  },
  {
    id: '18',
    victimName: 'Margaret Nyong\'o',
    age: 32,
    date: '2024-03-14',
    location: 'Migori Town',
    county: 'Migori',
    coordinates: [-1.0634, 34.4731],
    type: 'assault',
    description: 'Assault during border patrol operation.',
    status: 'verified',
    source: 'Border Post'
  },
  {
    id: '19',
    victimName: 'Joseph Langat',
    age: 29,
    date: '2024-02-18',
    location: 'Narok Town',
    county: 'Narok',
    coordinates: [-1.0833, 35.8667],
    type: 'harassment',
    description: 'Harassment during Maasai Mara conservation dispute.',
    status: 'investigating',
    source: 'Maasai Times'
  },
  {
    id: '20',
    victimName: 'Joyce Chepkemoi',
    age: 26,
    date: '2024-03-09',
    location: 'Kabarnet',
    county: 'Baringo',
    coordinates: [0.4919, 35.7431],
    type: 'death',
    description: 'Death during communal land conflict intervention.',
    status: 'verified',
    source: 'Rift Herald'
  },
  // Continue with more cases to reach 100...
  {
    id: '21',
    victimName: 'Stephen Maina',
    age: 37,
    date: '2024-01-12',
    location: 'Nanyuki Town',
    county: 'Laikipia',
    coordinates: [0.0062, 37.0745],
    type: 'assault',
    description: 'Beaten during ranch invasion operation.',
    status: 'investigating',
    source: 'Highland Times'
  },
  {
    id: '22',
    victimName: 'Hannah Muthoni',
    age: 30,
    date: '2024-02-08',
    location: 'Murang\'a Town',
    county: 'Murang\'a',
    coordinates: [-0.7208, 37.1528],
    type: 'harassment',
    description: 'Intimidation during coffee farmer protests.',
    status: 'verified',
    source: 'Central Mirror'
  },
  {
    id: '23',
    victimName: 'Paul Kibet',
    age: 34,
    date: '2024-03-16',
    location: 'Nandi Hills',
    county: 'Nandi',
    coordinates: [0.1039, 35.1856],
    type: 'unlawful_arrest',
    description: 'Detained during tea bonus dispute.',
    status: 'investigating',
    source: 'Nandi Express'
  },
  {
    id: '24',
    victimName: 'Mercy Waithera',
    age: 25,
    date: '2024-01-20',
    location: 'Nyandarua',
    county: 'Nyandarua',
    coordinates: [-0.3500, 36.3833],
    type: 'assault',
    description: 'Physical assault during potato farmer strike.',
    status: 'verified',
    source: 'Aberdare Post'
  },
  {
    id: '25',
    victimName: 'Isaac Rotich',
    age: 41,
    date: '2024-02-12',
    location: 'Eldama Ravine',
    county: 'Baringo',
    coordinates: [0.0500, 35.7333],
    type: 'death',
    description: 'Fatal shooting during bandit operation.',
    status: 'investigating',
    source: 'Northern Star'
  }
  // ... Adding 75 more cases would make the response too long, so I'll add a representative sample and note that more would be added in a real scenario
];

// Generate remaining cases with proper Kenyan coordinates
const kenyanCities = [
  { name: 'Nairobi CBD', county: 'Nairobi', coords: [-1.2864, 36.8172] },
  { name: 'Westlands', county: 'Nairobi', coords: [-1.2676, 36.8078] },
  { name: 'Eastleigh', county: 'Nairobi', coords: [-1.2753, 36.8442] },
  { name: 'Mombasa Old Town', county: 'Mombasa', coords: [-4.0435, 39.6682] },
  { name: 'Nyali', county: 'Mombasa', coords: [-4.0122, 39.7053] },
  { name: 'Kisumu City', county: 'Kisumu', coords: [-0.0917, 34.7680] },
  { name: 'Kondele', county: 'Kisumu', coords: [-0.1022, 34.7617] },
  { name: 'Nakuru Town', county: 'Nakuru', coords: [-0.3031, 36.0800] },
  { name: 'Eldoret Town', county: 'Uasin Gishu', coords: [0.5143, 35.2698] },
  { name: 'Thika Town', county: 'Kiambu', coords: [-1.0332, 37.0692] },
  { name: 'Machakos Town', county: 'Machakos', coords: [-1.5177, 37.2634] },
  { name: 'Nyeri Town', county: 'Nyeri', coords: [-0.4209, 36.9475] },
  { name: 'Kericho Town', county: 'Kericho', coords: [-0.3676, 35.2869] },
  { name: 'Embu Town', county: 'Embu', coords: [-0.5317, 37.4502] },
  { name: 'Kitui Market', county: 'Kitui', coords: [-1.3669, 38.0106] },
  { name: 'Kapenguria', county: 'West Pokot', coords: [1.2389, 35.1115] },
  { name: 'Bomet Town', county: 'Bomet', coords: [-0.7828, 35.3428] },
  { name: 'Bungoma Town', county: 'Bungoma', coords: [0.5692, 34.5608] },
  { name: 'Homa Bay Town', county: 'Homa Bay', coords: [-0.5273, 34.4571] },
  { name: 'Migori Town', county: 'Migori', coords: [-1.0634, 34.4731] },
  { name: 'Narok Town', county: 'Narok', coords: [-1.0833, 35.8667] },
  { name: 'Kabarnet', county: 'Baringo', coords: [0.4919, 35.7431] },
  { name: 'Nanyuki Town', county: 'Laikipia', coords: [0.0062, 37.0745] },
  { name: 'Murang\'a Town', county: 'Murang\'a', coords: [-0.7208, 37.1528] },
  { name: 'Nandi Hills', county: 'Nandi', coords: [0.1039, 35.1856] },
  { name: 'Ol Kalou', county: 'Nyandarua', coords: [-0.2667, 36.3833] }
];

const types: Case['type'][] = ['assault', 'harassment', 'unlawful_arrest', 'death', 'other'];
const statuses: Case['status'][] = ['verified', 'investigating'];

// Add remaining cases up to 100 with proper Kenyan locations and real Kenyan names
const kenyanNames = [
  'John Mwangi', 'Mary Atieno', 'Peter Otieno', 'Grace Wambui', 'Samuel Kiptoo',
  'Esther Achieng', 'David Njoroge', 'Lucy Wanjiru', 'James Ouma', 'Janet Chebet',
  'Joseph Mutua', 'Agnes Nyambura', 'Daniel Kiplangat', 'Rose Nyawira', 'Paul Kimani',
  'Catherine Nekesa', 'George Ochieng', 'Beatrice Moraa', 'Francis Kiplagat', 'Emily Naliaka',
  'Michael Kiprono', 'Hellen Wairimu', 'Charles Otieno', 'Diana Waceke', 'Patrick Kipruto',
  'Ann Mwende', 'Brian Kipchumba', 'Susan Akinyi', 'Anthony Muriuki', 'Eunice Jepkemoi',
  'Alex Njuguna', 'Martha Wanjiku', 'Felix Barasa', 'Naomi Chepkemoi', 'Kennedy Oduor',
  'Lilian Chebet', 'Collins Kiprotich', 'Ruth Njeri', 'Eric Kipkoech', 'Monica Atieno',
  'Dennis Kimutai', 'Vivian Wambua', 'Kevin Kipruto', 'Mercy Chebet', 'Allan Otieno',
  'Faith Wairimu', 'Victor Kiprono', 'Caroline Achieng', 'Edwin Kiptoo', 'Irene Wanjiru'
];
for (let i = 26; i <= 100; i++) {
  const randomCity = kenyanCities[Math.floor(Math.random() * kenyanCities.length)];
  const randomType = types[Math.floor(Math.random() * types.length)];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const latVariation = (Math.random() - 0.5) * 0.02;
  const lngVariation = (Math.random() - 0.5) * 0.02;
  const name = kenyanNames[(i - 26) % kenyanNames.length];
  mockCases.push({
    id: i.toString(),
    victimName: name,
    age: 20 + Math.floor(Math.random() * 40),
    date: `2024-0${Math.floor(Math.random() * 3) + 1}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    location: randomCity.name,
    county: randomCity.county,
    coordinates: [randomCity.coords[0] + latVariation, randomCity.coords[1] + lngVariation],
    type: randomType,
    description: `Incident involving ${name} (${randomType}) in ${randomCity.name}.`,
    status: randomStatus,
    source: 'Various Sources'
  });
}

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
