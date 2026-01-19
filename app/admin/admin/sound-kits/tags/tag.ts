export type SoundKitTag = {
  id: number;
  name: string;
  description: string;
};

let tags: SoundKitTag[] = [
  { id: 1, name: "808", description: "Lorem ipsum is simply dummy...." },
  { id: 2, name: "Snare", description: "Lorem ipsum is simply dummy...." },
  { id: 3, name: "Kick", description: "Lorem ipsum is simply dummy...." },
  { id: 4, name: "Vocal", description: "Lorem ipsum is simply dummy...." },
  { id: 5, name: "FX", description: "Lorem ipsum is simply dummy...." },
  { id: 6, name: "Percussion", description: "Lorem ipsum is simply dummy...." },
  { id: 7, name: "Hi-hat", description: "Lorem ipsum is simply dummy...." },
  { id: 8, name: "Clap", description: "Lorem ipsum is simply dummy...." },
];

export function getSoundKitTags(): Promise<SoundKitTag[]> {
  return Promise.resolve(tags);
}

export function addSoundKitTag(tag: SoundKitTag) {
  tags = [...tags, tag];
}

export function updateSoundKitTag(updated: SoundKitTag) {
  tags = tags.map(t => t.id === updated.id ? updated : t);
} 