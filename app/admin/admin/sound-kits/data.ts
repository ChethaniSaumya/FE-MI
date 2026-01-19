export type SoundKit = {
  id: number;
  image: string;
  soundKitId: string;
  soundKitName: string;
  musician: string;
  price: string;
};

let soundKits: SoundKit[] = [
  {
    id: 1,
    image: "/vercel.svg",
    soundKitId: "SK1234",
    soundKitName: "808 Essentials",
    musician: "Waytoolostf",
    price: "$100.00",
  },
  {
    id: 2,
    image: "/vercel.svg",
    soundKitId: "SK1235",
    soundKitName: "Trap Drums Vol. 1",
    musician: "Waytoolost",
    price: "$120.00",
  },
  {
    id: 3,
    image: "/vercel.svg",
    soundKitId: "SK1236",
    soundKitName: "Lo-Fi Vibes",
    musician: "Waytoolost",
    price: "$90.00",
  },
  {
    id: 4,
    image: "/vercel.svg",
    soundKitId: "SK1236",
    soundKitName: "Lo-Fi Vibes",
    musician: "Waytoolost",
    price: "$90.00",
  },
  {
    id: 5,
    image: "/vercel.svg",
    soundKitId: "SK1235",
    soundKitName: "Trap Drums Vol. 1",
    musician: "Waytoolost",
    price: "$120.00",
  },
  {
    id: 6,
    image: "/vercel.svg",
    soundKitId: "SK1236",
    soundKitName: "Lo-Fi Vibes",
    musician: "Waytoolost",
    price: "$90.00",
  },
  {
    id: 7,
    image: "/vercel.svg",
    soundKitId: "SK1236",
    soundKitName: "Lo-Fi Vibes",
    musician: "Waytoolost",
    price: "$90.00",
  },
  {
    id: 8,
    image: "/vercel.svg",
    soundKitId: "SK1235",
    soundKitName: "Trap Drums Vol. 1",
    musician: "Waytoolost",
    price: "$120.00",
  },
  {
    id: 9,
    image: "/vercel.svg",
    soundKitId: "SK1236",
    soundKitName: "Lo-Fi Vibes",
    musician: "Waytoolost",
    price: "$90.00",
  },
  {
    id: 10,
    image: "/vercel.svg",
    soundKitId: "SK1236",
    soundKitName: "Lo-Fi Vibes",
    musician: "Waytoolost",
    price: "$90.00",
  },
  // ...more sound kits
];

export function getSoundKits(): Promise<SoundKit[]> {
  return Promise.resolve(soundKits);
}

export function addSoundKit(soundKit: SoundKit) {
  soundKits = [...soundKits, soundKit];
}

export function updateSoundKit(updated: SoundKit) {
  soundKits = soundKits.map(sk => sk.id === updated.id ? updated : sk);
} 