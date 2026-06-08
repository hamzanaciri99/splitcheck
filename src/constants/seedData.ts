export type SeedParticipant = {
  name: string;
  avatarInitials: string;
  avatarColor: string;
};

export type SeedItem = {
  name: string;
  price: number;
  assignedTo: string; // comma-separated names
};

export type SeedReceipt = {
  title: string;
  date: string;
  totalAmount: number;
  payer: string;
  isSettled: boolean;
  daysAgo: number; // used to calculate timestamp
  items: SeedItem[];
};

export const SEED_PARTICIPANTS: SeedParticipant[] = [
  { name: 'Me', avatarInitials: 'ME', avatarColor: '#6750A4' },
  { name: 'Sarah', avatarInitials: 'SA', avatarColor: '#7C5CBF' },
  { name: 'Mike', avatarInitials: 'MI', avatarColor: '#386A20' },
  { name: 'Alex', avatarInitials: 'AL', avatarColor: '#B3261E' },
];

export const SEED_RECEIPTS: SeedReceipt[] = [
  {
    title: "Dinner at Joe's",
    date: '2h ago',
    totalAmount: 45.0,
    payer: 'You',
    isSettled: false,
    daysAgo: 0,
    items: [
      { name: 'Special Cocktails', price: 15.0, assignedTo: 'Me' },
      { name: 'Dinner Roast', price: 30.0, assignedTo: 'Sarah,Mike' },
    ],
  },
  {
    title: 'Office Coffee Run',
    date: 'Yesterday',
    totalAmount: 18.6,
    payer: 'Sarah',
    isSettled: false,
    daysAgo: 1,
    items: [
      { name: 'Latte', price: 6.2, assignedTo: 'Me' },
      { name: 'Espresso', price: 6.2, assignedTo: 'Sarah' },
      { name: 'Cortado', price: 6.2, assignedTo: 'Mike' },
    ],
  },
  {
    title: 'Weekly Groceries',
    date: 'Nov 12',
    totalAmount: 120.0,
    payer: 'You',
    isSettled: true,
    daysAgo: 5,
    items: [
      { name: 'Veggies', price: 40.0, assignedTo: 'Me,Sarah,Mike,Alex' },
      { name: 'Fruits', price: 30.0, assignedTo: 'Me,Sarah,Mike,Alex' },
      { name: 'Dry Goods', price: 50.0, assignedTo: 'Me,Sarah,Mike,Alex' },
    ],
  },
  {
    title: 'Tapas Night',
    date: 'Nov 10',
    totalAmount: 88.0,
    payer: 'Mike',
    isSettled: false,
    daysAgo: 7,
    items: [
      { name: 'Patatas Bravas', price: 22.0, assignedTo: 'Me' },
      { name: 'Serrano Ham', price: 44.0, assignedTo: 'Sarah,Mike' },
      { name: 'Sangria Pitcher', price: 22.0, assignedTo: 'Me,Sarah,Mike,Alex' },
    ],
  },
  {
    title: 'The Alchemist Bar & Grill',
    date: 'Oct 24, 2023',
    totalAmount: 86.45,
    payer: 'You',
    isSettled: false,
    daysAgo: 15,
    items: [
      { name: 'Truffle Fries', price: 14.0, assignedTo: 'Alex' },
      { name: 'Old Fashioned', price: 18.0, assignedTo: 'Alex' },
      { name: 'Caesar Salad', price: 16.0, assignedTo: 'Sarah' },
      { name: 'Tax & Tip Share', price: 23.25, assignedTo: 'Alex,Sarah' },
      { name: 'Garlic Pizza Bread', price: 15.2, assignedTo: '' },
    ],
  },
];

export const DEMO_SCANNED_RECEIPT = {
  title: 'The Alchemist Bar & Grill',
  items: [
    { id: 1, name: 'Pizza', price: 18.0, assignedTo: [] as string[] },
    { id: 2, name: 'Soda', price: 3.0, assignedTo: [] as string[] },
    { id: 3, name: 'Burger Deluxe', price: 14.5, assignedTo: [] as string[] },
    { id: 4, name: 'Garlic Bread', price: 6.0, assignedTo: [] as string[] },
  ],
};

export function getAvatarColor(name: string): string {
  const colors = ['#6750A4', '#7C5CBF', '#386A20', '#B3261E', '#006A6A', '#8B5000', '#0061A4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getAvatarInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}
