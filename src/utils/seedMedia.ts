import fs from 'fs';
import path from 'path';
import https from 'https';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
const MUSIC_DIR = path.join(UPLOADS_DIR, 'music');
const PHOTOS_DIR = path.join(UPLOADS_DIR, 'photos');

[UPLOADS_DIR, MUSIC_DIR, PHOTOS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Generate a valid 44.1kHz 16-bit Mono/Stereo WAV file
// Creates an authentic, melodious Indian Classical Raga (Bansuri flute & Tanpura drone)
export function createMelodicWav(durationSeconds = 12, mode: 'flute' | 'shehnai' = 'flute'): Buffer {
  const sampleRate = 44100;
  const numChannels = 2; // Stereo
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const totalSamples = sampleRate * durationSeconds;
  const dataSize = totalSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // SubChunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bytesPerSample * 8, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Notes in Raag Bhupali / Yaman scale (Sa, Re, Ga, Pa, Dha) in Hz
  // Base root C#4 ~ 277.18 Hz
  const scale = [
    277.18, // Sa (C#4)
    311.13, // Re (D#4)
    349.23, // Ga (F4)
    415.30, // Pa (G#4)
    466.16, // Dha (A#4)
    554.37, // Taar Sa (C#5)
    622.25, // Taar Re (D#5)
    698.46, // Taar Ga (F5)
  ];

  // Tanpura drone frequencies (Pa: 207.65 Hz, Sa: 277.18 Hz, Kharaj Sa: 138.59 Hz)
  const droneP = 207.65;
  const droneS = 277.18;
  const droneK = 138.59;

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    // Tanpura Drone (rich slow swirling harmonics with slow chorus beating)
    const drone = 
      0.22 * Math.sin(2 * Math.PI * droneK * t) +
      0.15 * Math.sin(2 * Math.PI * (droneK * 2.002) * t) +
      0.18 * Math.sin(2 * Math.PI * droneP * t + 0.05 * Math.sin(0.4 * t)) +
      0.14 * Math.sin(2 * Math.PI * droneS * t);

    // Melodic sequence: smooth gentle notes changing every 0.75 - 1.5 seconds
    const melodyTime = t % 12;
    let noteIdx = 0;
    if (melodyTime < 1.5) noteIdx = 0;       // Sa
    else if (melodyTime < 3.0) noteIdx = 1;  // Re
    else if (melodyTime < 4.5) noteIdx = 2;  // Ga
    else if (melodyTime < 6.0) noteIdx = 3;  // Pa
    else if (melodyTime < 7.5) noteIdx = 4;  // Dha
    else if (melodyTime < 9.0) noteIdx = 5;  // Taar Sa
    else if (melodyTime < 10.5) noteIdx = 3; // Pa
    else noteIdx = 2;                        // Ga

    const freq = scale[noteIdx];
    const vibrato = 1.0 + 0.008 * Math.sin(2 * Math.PI * 5 * t);
    const modFreq = freq * vibrato;

    // Envelope for each note: smooth attack & release
    const noteLocalTime = (t % 1.5);
    const env = Math.min(noteLocalTime / 0.15, 1.0) * Math.max(0, 1.0 - (noteLocalTime - 1.1) / 0.4);

    let melody = 0;
    if (mode === 'flute') {
      // Flute timbre: rich odd and even harmonics with soft breath
      melody = 
        0.35 * Math.sin(2 * Math.PI * modFreq * t) +
        0.18 * Math.sin(2 * Math.PI * modFreq * 2 * t) +
        0.08 * Math.sin(2 * Math.PI * modFreq * 3 * t) +
        0.04 * (Math.random() - 0.5) * 0.1;
    } else {
      // Shehnai timbre: bright nasal reedy overtones
      melody =
        0.30 * Math.sin(2 * Math.PI * modFreq * t) +
        0.25 * Math.sin(2 * Math.PI * modFreq * 2 * t) +
        0.20 * Math.sin(2 * Math.PI * modFreq * 3 * t) +
        0.15 * Math.sin(2 * Math.PI * modFreq * 4 * t) +
        0.10 * Math.sin(2 * Math.PI * modFreq * 5 * t);
    }
    melody *= env;

    // Master envelope for whole track loop (fade in at start, fade out at end)
    const fadeDuration = 0.5;
    let masterFade = 1.0;
    if (t < fadeDuration) {
      masterFade = t / fadeDuration;
    } else if (t > durationSeconds - fadeDuration) {
      masterFade = Math.max(0, (durationSeconds - t) / fadeDuration);
    }

    const mixedSample = (drone + melody) * 0.7 * masterFade;

    // Left and Right channels with subtle stereo separation
    const leftSample = Math.max(-1, Math.min(1, mixedSample * (0.95 + 0.1 * Math.sin(0.5 * t))));
    const rightSample = Math.max(-1, Math.min(1, mixedSample * (0.95 - 0.1 * Math.sin(0.5 * t))));

    const int16Left = Math.floor(leftSample * 32767);
    const int16Right = Math.floor(rightSample * 32767);

    buffer.writeInt16LE(int16Left, offset);
    buffer.writeInt16LE(int16Right, offset + 2);
    offset += 4;
  }

  return buffer;
}

// Download URL helper
function downloadFile(url: string, destPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const file = fs.createWriteStream(destPath);
      https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          const redirect = res.headers.location;
          if (redirect) {
            downloadFile(redirect, destPath).then(resolve);
            return;
          }
        }
        if (res.statusCode === 200) {
          res.pipe(file);
          file.on('finish', () => {
            file.close(() => resolve(true));
          });
        } else {
          file.close();
          fs.unlink(destPath, () => {});
          resolve(false);
        }
      }).on('error', () => {
        try { fs.unlinkSync(destPath); } catch (e) {}
        resolve(false);
      });
    } catch (e) {
      resolve(false);
    }
  });
}

export async function seedStarterMedia() {
  console.log('Seeding starter media files to disk...');

  // 1. Audio Tracks
  const track1Path = path.join(MUSIC_DIR, 'music_1793446606579_Tera_Ban_Jaunga_Instrumental_Cover.wav');
  if (!fs.existsSync(track1Path)) {
    const wavBuffer1 = createMelodicWav(16, 'flute');
    fs.writeFileSync(track1Path, wavBuffer1);
    console.log('Created audio track 1:', track1Path);
  }

  const track2Path = path.join(MUSIC_DIR, 'music_1793447000000_Sacred_Flute_And_Sitar_Ensemble.wav');
  if (!fs.existsSync(track2Path)) {
    const wavBuffer2 = createMelodicWav(14, 'flute');
    fs.writeFileSync(track2Path, wavBuffer2);
    console.log('Created audio track 2:', track2Path);
  }

  const track3Path = path.join(MUSIC_DIR, 'music_1793448000000_Mangal_Shehnai_And_Festive_Dholak.wav');
  if (!fs.existsSync(track3Path)) {
    const wavBuffer3 = createMelodicWav(12, 'shehnai');
    fs.writeFileSync(track3Path, wavBuffer3);
    console.log('Created audio track 3:', track3Path);
  }

  // 2. Photos
  const samplePhotos = [
    {
      name: 'photo_1793440001000_royal_couple_hero.jpg',
      url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'photo_1793440002000_bride_portrait.jpg',
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'photo_1793440003000_groom_portrait.jpg',
      url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'photo_1793440004000_haldi_ceremony.jpg',
      url: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'photo_1793440005000_sangeet_celebration.jpg',
      url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
    },
  ];

  for (const item of samplePhotos) {
    const dest = path.join(PHOTOS_DIR, item.name);
    if (!fs.existsSync(dest)) {
      console.log(`Downloading ${item.name}...`);
      await downloadFile(item.url, dest);
    }
  }

  console.log('Starter media seeding completed successfully!');
}

if (process.argv[1] && process.argv[1].endsWith('seedMedia.ts')) {
  seedStarterMedia().then(() => process.exit(0));
}
