export type SoundKitCategory = {
  id: number;
  name: string;
  description: string;
};

let categories: SoundKitCategory[] = [
  { id: 1, name: "Electronics", description: "Lorem ipsum is simply dummy...." },
  { id: 2, name: "EDM", description: "Lorem ipsum is simply dummy...." },
  { id: 3, name: "Electronics", description: "Lorem ipsum is simply dummy...." },
  { id: 4, name: "Electronics", description: "Lorem ipsum is simply dummy...." },
  { id: 5, name: "Electronics", description: "Lorem ipsum is simply dummy...." },
  { id: 6, name: "Electronics", description: "Lorem ipsum is simply dummy...." },
  { id: 7, name: "Electronics", description: "Lorem ipsum is simply dummy...." },
  { id: 8, name: "Electronics", description: "Lorem ipsum is simply dummy...." },
  { id: 9, name: "Electronics", description: "Lorem ipsum is simply dummy...." },
  { id: 10, name: "Electronics", description: "Lorem ipsum is simply dummy...." },
  { id: 11, name: "Electronics", description: "Lorem ipsum is simply dummy...." },
  { id: 12, name: "Electronics", description: "Lorem ipsum is simply dummy...." },
  { id: 13, name: "Electronics", description: "Lorem ipsum is simply dummy...." },
  { id: 14, name: "Electronics", description: "Lorem ipsum is simply dummy...." },
  { id: 15, name: "Electronics", description: "Lorem ipsum is simply dummy...." },
];

export function getSoundKitCategories(): Promise<SoundKitCategory[]> {
  return Promise.resolve(categories);
}

export function addSoundKitCategory(category: SoundKitCategory) {
  categories = [...categories, category];
}

export function updateSoundKitCategory(updated: SoundKitCategory) {
  categories = categories.map(c => c.id === updated.id ? updated : c);
} 