const AVATAR_COLORS = [
  '#E57373', '#F06292', '#BA68C8', '#9575CD',
  '#7986CB', '#64B5F6', '#4FC3F7', '#4DD0E1',
  '#4DB6AC', '#81C784', '#AED581', '#DCE775',
  '#FFD54F', '#FFB74D', '#FF8A65', '#A1887F',
];

export const getRandomAvatarColor = (): string => {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
};

export const getTableRadius = (capacity: number): number => {
  const baseRadius = 110;
  return baseRadius + (capacity - 8) * 10;
};

export const getSeatRadius = (tableRadius: number): number => {
  return 28;
};

export const getSeatDistance = (tableRadius: number): number => {
  return tableRadius + 55;
};

export const calculateSeatPosition = (
  tableX: number,
  tableY: number,
  tableRadius: number,
  seatIndex: number,
  totalSeats: number
): { x: number; y: number } => {
  const angle = (seatIndex / totalSeats) * Math.PI * 2 - Math.PI / 2;
  const distance = getSeatDistance(tableRadius);
  return {
    x: tableX + Math.cos(angle) * distance,
    y: tableY + Math.sin(angle) * distance,
  };
};
