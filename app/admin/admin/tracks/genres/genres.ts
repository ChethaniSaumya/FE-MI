export type Genre = {
  id: number;
  name: string;
  description: string;
};

export const genres: Genre[] = [
  { id: 1, name: "none", description: "Lorem ipsum is simply dummy...." },
  { id: 2, name: "Electronics02", description: "Lorem ipsum is simply dummy...." },
  { id: 3, name: "Electronics03", description: "Lorem ipsum is simply dummy...." },
  { id: 4, name: "Electronics04", description: "Lorem ipsum is simply dummy...." },
  { id: 5, name: "Electronics05", description: "Lorem ipsum is simply dummy...." },
  { id: 6, name: "Electronics6", description: "Lorem ipsum is simply dummy...." },
  { id: 7, name: "Electronics7", description: "Lorem ipsum is simply dummy...." },
  { id: 8, name: "Electronics8", description: "Lorem ipsum is simply dummy...." },
  { id: 9, name: "Electronics9", description: "Lorem ipsum is simply dummy...." },
  { id: 10, name: "Electronics10", description: "Lorem ipsum is simply dummy...." },
  { id: 11, name: "Electronics11", description: "Lorem ipsum is simply dummy...." },
  { id: 12, name: "Electronics12", description: "Lorem ipsum is simply dummy...." },
  { id: 13, name: "Electronics13", description: "Lorem ipsum is simply dummy...." },
  { id: 14, name: "Electronics14", description: "Lorem ipsum is simply dummy...." },
  { id: 15, name: "Electronics15", description: "Lorem ipsum is simply dummy...." },

];

export async function getGenres() {
  // Simulate async fetch
  return genres;
} 