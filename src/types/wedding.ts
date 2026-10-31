export interface WeddingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  day: string;
  venue: string;
  attire: string;
  desc: string;
  icon?: string;
  color?: string;
}

export interface WeddingConfig {
  groomName: string;
  brideName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  tagline: string;
  shloka: string;
  activeMusicUrl: string;
  activeMusicTitle: string;
  photos: {
    hero: string;
    bride: string;
    groom: string;
    sangeet: string;
    binayak: string;
    haldi: string;
    mayra: string;
    varmala: string;
    [key: string]: string;
  };
  events: WeddingEvent[];
}

export interface RSVP {
  id: string;
  name: string;
  phone: string;
  email: string;
  attending: 'yes' | 'no' | 'maybe';
  guestsCount: number;
  eventsAttending: string[];
  dietary: string;
  message: string;
  createdAt: string;
}

export interface Wish {
  id: string;
  author: string;
  city: string;
  message: string;
  timestamp: string;
}

export interface MediaFile {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
}
