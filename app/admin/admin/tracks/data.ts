// app/admin/tracks/data.ts
export type Track = {
    id: number;
    trackImage: string;
    trackId: string;
    trackName: string;
    musician: string;
    price: string;
    trackKey: string;
    
  };
  
  let tracks: Track[] = [
    {
      id: 1,
      trackImage: "/vercel.svg",
      trackId: "1232DR",
      trackName: "Spin Back",
      musician: "Waytoolost",
      price: "$130.00",
      trackKey: "C#",
    },
    {
      id: 2,
      trackImage: "/vercel.svg",
      trackId: "1232DR",
      trackName: "Spin Back",
      musician: "Waytoolost",
      price: "$100.00",
      trackKey: "C#",
    },
    {
      id: 3,
      trackImage: "/vercel.svg",
      trackId: "1232DR",
      trackName: "Spin Back",
      musician: "Waytoolost",
      price: "$100.00",
      trackKey: "C#",
    },
    {
      id: 4,
      trackImage: "/vercel.svg",
      trackId: "1232DR",
      trackName: "Spin Back",
      musician: "Waytoolost",
      price: "$100.00",
      trackKey: "C#",
    },
    {
      id: 5,
      trackImage: "/vercel.svg",
      trackId: "1232DR",
      trackName: "Spin Back",
      musician: "Waytoolost",
      price: "$100.00",
      trackKey: "C#",
    },
    {
      id: 6,
      trackImage: "/vercel.svg",
      trackId: "1232DR",
      trackName: "Spin Back",
      musician: "Waytoolost",
      price: "$100.00",
      trackKey: "C#",
    },
    {
      id: 7,
      trackImage: "/vercel.svg",
      trackId: "1232DR",
      trackName: "Spin Back",
      musician: "Waytoolost",
      price: "$100.00",
      trackKey: "C#",
    },
    {
      id: 8,
      trackImage: "/vercel.svg",
      trackId: "1232DR",
      trackName: "Spin Back",
      musician: "Waytoolost",
      price: "$100.00",
      trackKey: "C#",
    },
    {
      id: 9,
      trackImage: "/vercel.svg",
      trackId: "1232DR",
      trackName: "Spin Back",
      musician: "Waytoolost",
      price: "$100.00",
      trackKey: "C#",
    },
    // ...more tracks
  ];
  
  export function getTracks(): Promise<Track[]> {
    return Promise.resolve(tracks);
  }
  
  export function addTrack(track: Track) {
    tracks = [...tracks, track];
  }
  
  export function updateTrack(updated: Track) {
    tracks = tracks.map(t => t.id === updated.id ? updated : t);
  }