import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import dotenv from 'dotenv';
import { seedStarterMedia } from './src/utils/seedMedia.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

// Ensure data and uploads folders exist
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const MUSIC_DIR = path.join(UPLOADS_DIR, 'music');
const PHOTOS_DIR = path.join(UPLOADS_DIR, 'photos');
const DATA_DIR = path.resolve(process.cwd(), 'data');

[UPLOADS_DIR, MUSIC_DIR, PHOTOS_DIR, DATA_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure Multer for File Uploads
const musicStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, MUSIC_DIR);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `music_${Date.now()}_${safeName}`);
  },
});

const photoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, PHOTOS_DIR);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `photo_${Date.now()}_${safeName}`);
  },
});

const uploadMusic = multer({
  storage: musicStorage,
  limits: { fileSize: 40 * 1024 * 1024 }, // 40MB max for high-quality audio
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files (.mp3, .wav, .ogg, .m4a) are allowed'));
    }
  },
});

const uploadPhoto = multer({
  storage: photoStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max for photos
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (.jpg, .jpeg, .png, .webp) are allowed'));
    }
  },
});

// Default wedding config
const CONFIG_FILE = path.join(DATA_DIR, 'wedding-config.json');
const RSVPS_FILE = path.join(DATA_DIR, 'rsvps.json');
const WISHES_FILE = path.join(DATA_DIR, 'wishes.json');

const DEFAULT_CONFIG = {
  adminPin: '1234',
  groomName: 'Hrishikesh',
  brideName: 'Anuja',
  weddingDate: '2026-11-21T19:30:00',
  venueName: 'Lotus Inn Banquet Hall & Lawns',
  venueAddress: 'Lotus Inn, Ring Rd, near Govind Prabhu Temple, Rahatgaon, Amravati, Maharashtra 444603',
  googleMapsUrl: 'https://maps.google.com/?q=Lotus+Inn+Rahatgaon+Amravati+Maharashtra',
  tagline: 'Together with their families, invite you to celebrate the joyous union of',
  shloka: 'मंगलम् भगवान विष्णुः मंगलम् गरुड़ध्वजः। मंगलम् पुण्डरीकाक्षः मङ्गलाय तनो हरिः॥',
  activeMusicUrl: '/uploads/music/music_1793446606579_Tera_Ban_Jaunga_Instrumental_Cover.wav',
  activeMusicTitle: 'Tera Ban Jaunga (Instrumental Cover)',
  photos: {
    hero: '/uploads/photos/photo_1793440001000_royal_couple_hero.jpg',
    bride: '/uploads/photos/photo_1793440002000_bride_portrait.jpg',
    groom: '/uploads/photos/photo_1793440003000_groom_portrait.jpg',
    haldi: '/uploads/photos/photo_1793440004000_haldi_ceremony.jpg',
    sangeet: '/uploads/photos/photo_1793440005000_sangeet_celebration.jpg',
    binayak: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=800&q=80',
    mayra: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    varmala: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
  },
  events: [
    {
      id: 'sangeet',
      title: 'Sangeet Ceremony & Dance Night',
      date: 'November 20, 2026',
      time: '8:00 PM Onwards',
      day: 'day1',
      venue: 'Lotus Inn Banquet Hall, Rahatgaon',
      attire: 'Glamorous Indian Traditional / Indo-Western',
      desc: 'Get ready for an evening full of musical performances, dance battles, delicious food, and joyous celebrations as both families hit the dance floor!',
      icon: 'Music',
      color: '#E0533C',
    },
    {
      id: 'binayak',
      title: 'Ghee Binayak & Ganesh Sthapana',
      date: 'November 21, 2026',
      time: '8:00 AM',
      day: 'day2',
      venue: 'Lotus Inn Puja Mandap, Rahatgaon',
      attire: 'Traditional Festive Ethnic',
      desc: 'A holy Ganpati Sthapana and Ghee Binayak Puja to seek divine blessings from Lord Ganesha for auspicious beginnings and a harmonious union.',
      icon: 'Sparkles',
      color: '#D4AF37',
    },
    {
      id: 'haldi',
      title: 'Haldi Ceremony & Flower Shower',
      date: 'November 21, 2026',
      time: '10:30 AM',
      day: 'day2',
      venue: 'Lotus Inn Lawns, Rahatgaon',
      attire: 'Shades of Yellow / Mustard Festive Wear',
      desc: 'Join us in applying holy turmeric paste to the couple amidst marigold flowers, vibrant songs, live dhol beats, and sunny celebrations!',
      icon: 'Sun',
      color: '#E6A100',
    },
    {
      id: 'mayra',
      title: 'Mayra / Bhaat Ceremony',
      date: 'November 21, 2026',
      time: '3:00 PM',
      day: 'day2',
      venue: 'Lotus Inn Courtyard, Rahatgaon',
      attire: 'Traditional Royal Attire',
      desc: 'A heartfelt ceremony honoring maternal relatives as they welcome guests with ancestral blessings, traditional gifts, and unconditional warmth.',
      icon: 'HeartHandshake',
      color: '#C73859',
    },
    {
      id: 'varmala',
      title: 'Varmala & Sacred Seven Pheras',
      date: 'November 21, 2026',
      time: '7:30 PM Onwards',
      day: 'day2',
      venue: 'Grand Mandap at Lotus Inn, Rahatgaon',
      attire: 'Grand Ethnic / Royal Traditional',
      desc: 'The sacred pinnacle wedding moment! Exchange of floral garlands under the floral canopy, followed by Seven Sacred Pheras around the holy fire.',
      icon: 'Flame',
      color: '#8A1B2D',
    },
  ],
};

function getLatestUploadedMusic() {
  try {
    if (fs.existsSync(MUSIC_DIR)) {
      const files = fs
        .readdirSync(MUSIC_DIR)
        .filter((f) => /\.(mp3|wav|ogg|m4a|aac)$/i.test(f))
        .map((f) => ({
          name: f,
          time: fs.statSync(path.join(MUSIC_DIR, f)).mtimeMs,
        }))
        .sort((a, b) => b.time - a.time);

      if (files.length > 0) {
        const cleanTitle = files[0].name
          .replace(/^music_\d+_/, '')
          .replace(/\.[^/.]+$/, '')
          .replace(/_/g, ' ');
        return {
          url: `/uploads/music/${files[0].name}`,
          title: cleanTitle,
        };
      }
    }
  } catch (e) {}
  return null;
}

function readConfig() {
  try {
    const latestMusic = getLatestUploadedMusic();
    const effectiveDefault = latestMusic
      ? {
          ...DEFAULT_CONFIG,
          activeMusicUrl: latestMusic.url,
          activeMusicTitle: latestMusic.title,
        }
      : DEFAULT_CONFIG;

    if (!fs.existsSync(CONFIG_FILE)) {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(effectiveDefault, null, 2), 'utf-8');
      return effectiveDefault;
    }
    const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return { ...effectiveDefault, ...parsed };
  } catch (e) {
    console.error('Error reading wedding config:', e);
    return DEFAULT_CONFIG;
  }
}

function writeConfig(data: any) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function readJsonFile(file: string, fallback: any[] = []) {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch (e) {
    return fallback;
  }
}

function writeJsonFile(file: string, data: any) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded files
app.use('/uploads', express.static(UPLOADS_DIR));

// API: Wedding Configuration
app.get('/api/wedding', (_req: Request, res: Response) => {
  const config = readConfig();
  // Never expose admin PIN to client config response
  const { adminPin, ...safeConfig } = config;
  res.json({ success: true, wedding: safeConfig });
});

app.post('/api/wedding', (req: Request, res: Response) => {
  const { pin, updates } = req.body;
  const current = readConfig();

  if (pin !== current.adminPin) {
    res.status(401).json({ success: false, message: 'Invalid Admin PIN' });
    return;
  }

  const updated = {
    ...current,
    ...updates,
    photos: { ...current.photos, ...(updates.photos || {}) },
    events: updates.events || current.events,
  };

  writeConfig(updated);
  const { adminPin, ...safeConfig } = updated;
  res.json({ success: true, wedding: safeConfig });
});

// API: Verify Admin PIN
app.post('/api/admin/verify', (req: Request, res: Response) => {
  const { pin } = req.body;
  const current = readConfig();
  if (pin === current.adminPin) {
    res.json({ success: true, message: 'Admin authenticated' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid PIN' });
  }
});

// Helper: scan directory safely and return only valid existing files
function getDirectoryFiles(dir: string, urlPrefix: string, allowedExts: RegExp) {
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      return [];
    }
    return fs
      .readdirSync(dir)
      .filter((f) => !f.startsWith('.') && allowedExts.test(f))
      .map((f) => {
        try {
          const fullPath = path.join(dir, f);
          const stats = fs.statSync(fullPath);
          if (!stats.isFile()) return null;
          return {
            filename: f,
            url: `${urlPrefix}/${f}`,
            size: stats.size,
            createdAt: stats.mtime.toISOString(),
          };
        } catch (e) {
          return null;
        }
      })
      .filter((f): f is NonNullable<typeof f> => f !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
    return [];
  }
}

// Ensure default starter media files exist on server disk
async function ensureStarterMedia() {
  try {
    const existingMusic = getDirectoryFiles(MUSIC_DIR, '/uploads/music', /\.(mp3|wav|ogg|m4a|aac)$/i);
    const existingPhotos = getDirectoryFiles(PHOTOS_DIR, '/uploads/photos', /\.(jpg|jpeg|png|webp|gif|svg)$/i);
    if (existingMusic.length === 0 || existingPhotos.length === 0) {
      console.log('Starter media empty on disk, triggering seedStarterMedia...');
      await seedStarterMedia();
    }
  } catch (e) {
    console.error('Error during ensureStarterMedia:', e);
  }
}

// API: Upload Music
app.post('/api/upload/music', (req: Request, res: Response) => {
  uploadMusic.single('music')(req, res, (err: any) => {
    if (err) {
      res.status(400).json({ success: false, message: err.message || 'Music upload error' });
      return;
    }
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No music file provided' });
        return;
      }

      const fileUrl = `/uploads/music/${req.file.filename}`;
      const title =
        req.body.title ||
        req.file.originalname
          .replace(/^music_\d+_/, '')
          .replace(/\.[^/.]+$/, '')
          .replace(/_/g, ' ');

      // Update active music in config
      const current = readConfig();
      current.activeMusicUrl = fileUrl;
      current.activeMusicTitle = title;
      writeConfig(current);

      res.json({
        success: true,
        message: 'Music uploaded to server disk and activated successfully! 🎵',
        music: {
          url: fileUrl,
          filename: req.file.filename,
          title,
          size: req.file.size,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Music upload failed' });
    }
  });
});

// API: Set Active Music (from library, preset, or direct URL)
app.post('/api/music/select', (req: Request, res: Response) => {
  try {
    const { url, title, pin } = req.body;
    const current = readConfig();
    if (pin && pin !== current.adminPin) {
      res.status(401).json({ success: false, message: 'Invalid Admin PIN' });
      return;
    }
    if (!url) {
      res.status(400).json({ success: false, message: 'Music URL is required' });
      return;
    }

    current.activeMusicUrl = url;
    if (title) {
      current.activeMusicTitle = title;
    }
    writeConfig(current);

    const { adminPin, ...safeConfig } = current;
    res.json({
      success: true,
      message: 'Active music updated successfully',
      wedding: safeConfig,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to update music' });
  }
});

// API: Upload Photo
app.post('/api/upload/photo', (req: Request, res: Response) => {
  uploadPhoto.single('photo')(req, res, (err: any) => {
    if (err) {
      res.status(400).json({ success: false, message: err.message || 'Photo upload error' });
      return;
    }
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No photo file provided' });
        return;
      }

      const fileUrl = `/uploads/photos/${req.file.filename}`;
      const key = req.body.key; // e.g. 'hero', 'bride', 'groom', 'sangeet', 'haldi', etc.

      const current = readConfig();
      if (key && current.photos) {
        current.photos[key] = fileUrl;
        writeConfig(current);
      }

      res.json({
        success: true,
        message: 'Photo uploaded to server disk successfully! 📸',
        photo: {
          url: fileUrl,
          filename: req.file.filename,
          key: key || 'general',
          size: req.file.size,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Photo upload failed' });
    }
  });
});

// API: List Media Files (Server Files Inventory)
app.get('/api/media', (_req: Request, res: Response) => {
  try {
    const musicFiles = getDirectoryFiles(MUSIC_DIR, '/uploads/music', /\.(mp3|wav|ogg|m4a|aac)$/i);
    const photoFiles = getDirectoryFiles(PHOTOS_DIR, '/uploads/photos', /\.(jpg|jpeg|png|webp|gif|svg)$/i);

    res.json({
      success: true,
      music: musicFiles,
      photos: photoFiles,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to list media files' });
  }
});

// API: Seed Starter Media Files On Demand
app.post('/api/media/seed', async (_req: Request, res: Response) => {
  try {
    await seedStarterMedia();
    const musicFiles = getDirectoryFiles(MUSIC_DIR, '/uploads/music', /\.(mp3|wav|ogg|m4a|aac)$/i);
    const photoFiles = getDirectoryFiles(PHOTOS_DIR, '/uploads/photos', /\.(jpg|jpeg|png|webp|gif|svg)$/i);

    res.json({
      success: true,
      message: 'Starter tracks and ceremony photos seeded to disk successfully! ✨',
      music: musicFiles,
      photos: photoFiles,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Seeding starter media failed' });
  }
});

// API: Delete Media
app.delete('/api/media/:type/:filename', (req: Request, res: Response) => {
  const { type, filename } = req.params;
  const targetDir = type === 'music' ? MUSIC_DIR : PHOTOS_DIR;
  const safeFilename = path.basename(filename);
  const filePath = path.join(targetDir, safeFilename);

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: `File ${safeFilename} deleted from server storage` });
      return;
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
      return;
    }
  }
  res.status(404).json({ success: false, message: 'File not found on server' });
});


// API: RSVPs
app.get('/api/rsvps', (_req: Request, res: Response) => {
  const rsvps = readJsonFile(RSVPS_FILE, []);
  res.json({ success: true, rsvps });
});

app.post('/api/rsvp', (req: Request, res: Response) => {
  const { name, phone, email, attending, guestsCount, eventsAttending, dietary, message } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: 'Guest name is required' });
    return;
  }

  const rsvps = readJsonFile(RSVPS_FILE, []);
  const newRsvp = {
    id: `rsvp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    phone: phone || '',
    email: email || '',
    attending: attending || 'yes',
    guestsCount: Number(guestsCount) || 1,
    eventsAttending: eventsAttending || ['all'],
    dietary: dietary || 'Vegetarian',
    message: message || '',
    createdAt: new Date().toISOString(),
  };

  rsvps.unshift(newRsvp);
  writeJsonFile(RSVPS_FILE, rsvps);
  res.json({ success: true, rsvp: newRsvp, message: 'RSVP recorded! Thank you for blessing us!' });
});

// API: Guest Wishes & Blessings
app.get('/api/wishes', (_req: Request, res: Response) => {
  const defaultWishes = [
    {
      id: 'wish_1',
      author: 'Aunt Meena & Uncle Rajesh',
      city: 'Pune',
      message: 'Heartiest congratulations to our dearest Anuja and Hrishikesh! May your married life be filled with boundless laughter, prosperity, and eternal affection.',
      timestamp: '2026-10-30T10:15:00.000Z',
    },
    {
      id: 'wish_2',
      author: 'Rohit, Sneha & Little Aarav',
      city: 'Mumbai',
      message: 'So thrilled to witness this golden celebration! Counting down the days to dance at your Sangeet. Lots of love always!',
      timestamp: '2026-10-29T14:40:00.000Z',
    },
    {
      id: 'wish_3',
      author: 'The Sharma Family',
      city: 'Nagpur',
      message: 'May Lord Ganesha bestow boundless peace, health, and endless love upon the wonderful couple. Looking forward to celebrating!',
      timestamp: '2026-10-28T18:20:00.000Z',
    },
  ];
  const wishes = readJsonFile(WISHES_FILE, defaultWishes);
  res.json({ success: true, wishes });
});

app.post('/api/wishes', (req: Request, res: Response) => {
  const { author, city, message } = req.body;
  if (!author || !message) {
    res.status(400).json({ success: false, message: 'Name and blessing message are required' });
    return;
  }

  const defaultWishes = [
    {
      id: 'wish_1',
      author: 'Aunt Meena & Uncle Rajesh',
      city: 'Pune',
      message: 'Heartiest congratulations to our dearest Anuja and Hrishikesh! May your married life be filled with boundless laughter, prosperity, and eternal affection.',
      timestamp: '2026-10-30T10:15:00.000Z',
    },
  ];
  const wishes = readJsonFile(WISHES_FILE, defaultWishes);
  const newWish = {
    id: `wish_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    author,
    city: city || 'Well-wisher',
    message,
    timestamp: new Date().toISOString(),
  };

  wishes.unshift(newWish);
  writeJsonFile(WISHES_FILE, wishes);
  res.json({ success: true, wish: newWish, message: 'Your blessing has been lovingly posted!' });
});

// Preset Music Tracks Library (available immediately for one-click selection)
app.get('/api/preset-music', (_req: Request, res: Response) => {
  const presets = [
    {
      id: 'flute-sacred',
      title: 'Sacred Indian Flute & Sitar Ensemble',
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=indian-instrumental-flute-112702.mp3',
      tag: 'Traditional Flute & Sitar',
    },
    {
      id: 'royal-shehnai',
      title: 'Mangal Shahnai & Festive Dholak',
      url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_248fa3910c.mp3?filename=indian-celebration-10777.mp3',
      tag: 'Auspicious Shehnai',
    },
    {
      id: 'serene-santoor',
      title: 'Gentle Kashmiri Santoor & Tanpura',
      url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=meditative-indian-14227.mp3',
      tag: 'Melodic Santoor',
    },
  ];
  res.json({ success: true, presets });
});

// Setup Vite or Static Serving
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  await ensureStarterMedia();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wedding Invitation Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
