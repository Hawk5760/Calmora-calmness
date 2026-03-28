export interface Song {
  title: string;
  artist: string;
  mood: string;
  genre: string;
  youtubeUrl: string;
}

const songLibrary: Song[] = [
  // Happy / Uplifting Bollywood
  { title: "Badtameez Dil", artist: "Benny Dayal", mood: "happy", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Badtameez+Dil+Yeh+Jawaani+Hai+Deewani" },
  { title: "London Thumakda", artist: "Labh Janjua & Sonu Kakkar", mood: "happy", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=London+Thumakda+Queen" },
  { title: "Gallan Goodiyaan", artist: "Shankar Mahadevan & others", mood: "happy", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Gallan+Goodiyaan+Dil+Dhadakne+Do" },
  { title: "Nachde Ne Saare", artist: "Jasleen Royal", mood: "happy", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Nachde+Ne+Saare+Baar+Baar+Dekho" },
  { title: "Balam Pichkari", artist: "Vishal Dadlani & Shalmali", mood: "happy", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Balam+Pichkari+Yeh+Jawaani+Hai+Deewani" },
  { title: "Ainvayi Ainvayi", artist: "Salim Merchant", mood: "happy", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Ainvayi+Ainvayi+Band+Baaja+Baaraat" },
  // Calm / Soothing
  { title: "Tum Hi Ho", artist: "Arijit Singh", mood: "calm", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Tum+Hi+Ho+Arijit+Singh+Aashiqui+2" },
  { title: "Agar Tum Saath Ho", artist: "Arijit Singh & Alka Yagnik", mood: "calm", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Agar+Tum+Saath+Ho+Tamasha" },
  { title: "Kabira", artist: "Arijit Singh & Tochi Raina", mood: "calm", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Kabira+Yeh+Jawaani+Hai+Deewani" },
  { title: "Tujhe Kitna Chahne Lage", artist: "Arijit Singh", mood: "calm", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Tujhe+Kitna+Chahne+Lage+Kabir+Singh" },
  { title: "Raabta", artist: "Arijit Singh", mood: "calm", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Raabta+Agent+Vinod+Arijit+Singh" },
  // Motivated / Energetic
  { title: "Kar Har Maidaan Fateh", artist: "Sukhwinder Singh & Shreya Ghoshal", mood: "motivated", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Kar+Har+Maidaan+Fateh+Sanju" },
  { title: "Zinda", artist: "Siddharth Mahadevan", mood: "motivated", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Zinda+Bhaag+Milkha+Bhaag" },
  { title: "Dangal Title Track", artist: "Daler Mehndi", mood: "motivated", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Dangal+Title+Track+Daler+Mehndi" },
  { title: "Apna Time Aayega", artist: "Ranveer Singh", mood: "motivated", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Apna+Time+Aayega+Gully+Boy" },
  { title: "Sultan Title Track", artist: "Sukhwinder Singh & Shadab Faridi", mood: "motivated", genre: "Bollywood", youtubeUrl: "https://www.youtube.com/results?search_query=Sultan+Title+Track+Salman+Khan" },
  // Devotional / Spiritual
  { title: "Gayatri Mantra", artist: "Various Artists", mood: "spiritual", genre: "Devotional", youtubeUrl: "https://www.youtube.com/results?search_query=Gayatri+Mantra+108+times+peaceful" },
  { title: "Hanuman Chalisa", artist: "Hariharan", mood: "spiritual", genre: "Devotional", youtubeUrl: "https://www.youtube.com/results?search_query=Hanuman+Chalisa+Hariharan" },
  { title: "Kun Faya Kun", artist: "A.R. Rahman & Javed Ali", mood: "spiritual", genre: "Sufi", youtubeUrl: "https://www.youtube.com/results?search_query=Kun+Faya+Kun+Rockstar+AR+Rahman" },
];

export const getMoodBasedSongs = (detectedMood: string): Song[] => {
  if (detectedMood === 'sad' || detectedMood === 'angry' || detectedMood === 'anxious') {
    return [
      ...songLibrary.filter(s => s.mood === 'calm').slice(0, 2),
      ...songLibrary.filter(s => s.mood === 'happy').slice(0, 2),
      ...songLibrary.filter(s => s.mood === 'motivated').slice(0, 1),
      ...songLibrary.filter(s => s.mood === 'spiritual').slice(0, 1),
    ];
  } else if (detectedMood === 'calm') {
    return [
      ...songLibrary.filter(s => s.mood === 'calm').slice(0, 2),
      ...songLibrary.filter(s => s.mood === 'spiritual').slice(0, 2),
      ...songLibrary.filter(s => s.mood === 'happy').slice(0, 2),
    ];
  } else if (detectedMood === 'motivated') {
    return [
      ...songLibrary.filter(s => s.mood === 'motivated'),
      ...songLibrary.filter(s => s.mood === 'happy').slice(0, 2),
    ];
  } else {
    return songLibrary.filter(s => s.mood === 'happy').slice(0, 6);
  }
};
