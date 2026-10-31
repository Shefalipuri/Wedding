import React, { useState, useEffect } from 'react';
import {
  Lock,
  Upload,
  Music,
  Image as ImageIcon,
  Check,
  Trash2,
  Settings,
  HardDrive,
  ExternalLink,
  LogOut,
  Play,
  Pause,
  AlertCircle,
  Sparkles,
  Globe,
  Radio,
  Download,
  Info,
  ShieldCheck,
  FileAudio,
  RefreshCw,
  FolderOpen,
  Database,
  Plus,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { WeddingConfig, MediaFile } from './types/wedding';

interface AdminAppProps {
  onNavigateHome: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ onNavigateHome }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_auth') === 'true';
  });
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState<'music' | 'photos' | 'details' | 'storage'>('storage');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Wedding data
  const [wedding, setWedding] = useState<WeddingConfig | null>(null);

  // Media states
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicTitle, setMusicTitle] = useState('');
  const [isUploadingMusic, setIsUploadingMusic] = useState(false);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  // Direct Online Audio & Photo states
  const [directAudioUrl, setDirectAudioUrl] = useState('');
  const [directAudioTitle, setDirectAudioTitle] = useState('');
  const [isApplyingDirectAudio, setIsApplyingDirectAudio] = useState(false);
  const [directPhotoUrl, setDirectPhotoUrl] = useState('');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoKey, setPhotoKey] = useState<string>('hero');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Server Media list & Storage status
  const [serverMedia, setServerMedia] = useState<{ music: MediaFile[]; photos: MediaFile[] }>({
    music: [],
    photos: [],
  });
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isSeedingMedia, setIsSeedingMedia] = useState(false);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>('');

  // Quick direct uploads on Inventory Tab
  const [quickMusicFile, setQuickMusicFile] = useState<File | null>(null);
  const [quickMusicTitle, setQuickMusicTitle] = useState('');
  const [isQuickUploadingMusic, setIsQuickUploadingMusic] = useState(false);

  const [quickPhotoFile, setQuickPhotoFile] = useState<File | null>(null);
  const [quickPhotoKey, setQuickPhotoKey] = useState<string>('hero');
  const [isQuickUploadingPhoto, setIsQuickUploadingPhoto] = useState(false);

  // Wedding form details
  const [editDetails, setEditDetails] = useState({
    brideName: '',
    groomName: '',
    weddingDate: '',
    venueName: '',
    venueAddress: '',
    tagline: '',
    shloka: '',
    googleMapsUrl: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const fetchWeddingConfig = async () => {
    try {
      const res = await fetch('/api/wedding');
      const data = await res.json();
      if (data.success && data.wedding) {
        setWedding(data.wedding);
        setEditDetails({
          brideName: data.wedding.brideName,
          groomName: data.wedding.groomName,
          weddingDate: data.wedding.weddingDate,
          venueName: data.wedding.venueName,
          venueAddress: data.wedding.venueAddress,
          tagline: data.wedding.tagline || '',
          shloka: data.wedding.shloka || '',
          googleMapsUrl: data.wedding.googleMapsUrl || '',
        });
        setPreviewAudioUrl(data.wedding.activeMusicUrl);
      }
    } catch (e) {
      console.error('Error fetching wedding config:', e);
    }
  };

  const fetchMediaFiles = async (silent = false) => {
    setIsLoadingMedia(true);
    try {
      const res = await fetch(`/api/media?_t=${Date.now()}`);
      const data = await res.json();
      if (data.success) {
        setServerMedia({ music: data.music || [], photos: data.photos || [] });
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastRefreshedTime(timeStr);
        if (!silent) {
          showToast(`Server files inventory updated (${(data.music || []).length} audio, ${(data.photos || []).length} photos) 📂`);
        }
      } else {
        if (!silent) showToast(data.message || 'Failed to read media inventory');
      }
    } catch (e: any) {
      console.error('Error fetching media:', e);
      if (!silent) showToast('Could not reach backend media storage');
    } finally {
      setIsLoadingMedia(false);
    }
  };

  useEffect(() => {
    fetchWeddingConfig();
    if (isAuthenticated) {
      fetchMediaFiles(true);
    }
  }, [isAuthenticated, activeTab]);

  // One-click Seed Starter Media on Disk
  const handleSeedMedia = async () => {
    setIsSeedingMedia(true);
    try {
      const res = await fetch('/api/media/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || 'Starter audio tracks & photos seeded on server disk! ✨');
        fetchMediaFiles(true);
        fetchWeddingConfig();
      } else {
        showToast(data.message || 'Seeding failed');
      }
    } catch (err: any) {
      showToast('Error seeding media files: ' + err.message);
    } finally {
      setIsSeedingMedia(false);
    }
  };

  // Assign photo to ceremony
  const handleAssignPhotoToCeremony = async (photoUrl: string, targetKey: string) => {
    try {
      const res = await fetch('/api/wedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: '1234',
          updates: {
            photos: { [targetKey]: photoUrl },
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Assigned photo to ${targetKey} ceremony card! 📸`);
        fetchWeddingConfig();
      } else {
        showToast(data.message || 'Failed to assign photo');
      }
    } catch (err: any) {
      showToast('Error assigning photo: ' + err.message);
    }
  };

  // Quick upload music from Storage Tab
  const handleQuickUploadMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMusicFile) {
      showToast('Please select an audio file (.mp3, .wav, .ogg, .m4a)');
      return;
    }
    setIsQuickUploadingMusic(true);
    const formData = new FormData();
    formData.append('music', quickMusicFile);
    formData.append('title', quickMusicTitle || quickMusicFile.name);

    try {
      const res = await fetch('/api/upload/music', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        showToast('Music stored to server and activated! 🎵');
        setQuickMusicFile(null);
        setQuickMusicTitle('');
        fetchWeddingConfig();
        fetchMediaFiles(true);
      } else {
        showToast(data.message || 'Upload failed');
      }
    } catch (err: any) {
      showToast('Upload error: ' + err.message);
    } finally {
      setIsQuickUploadingMusic(false);
    }
  };

  // Quick upload photo from Storage Tab
  const handleQuickUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPhotoFile) {
      showToast('Please select a photo (.jpg, .png, .webp)');
      return;
    }
    setIsQuickUploadingPhoto(true);
    const formData = new FormData();
    formData.append('key', quickPhotoKey);
    formData.append('photo', quickPhotoFile);

    try {
      const res = await fetch('/api/upload/photo', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        showToast(`Photo stored and assigned to ${quickPhotoKey}! 📸`);
        setQuickPhotoFile(null);
        fetchWeddingConfig();
        fetchMediaFiles(true);
      } else {
        showToast(data.message || 'Photo upload failed');
      }
    } catch (err: any) {
      showToast('Photo upload error: ' + err.message);
    } finally {
      setIsQuickUploadingPhoto(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
        showToast('Admin logged in successfully! 👑');
        fetchMediaFiles();
      } else {
        showToast('Invalid Admin Security PIN (Default: 1234)');
      }
    } catch (e) {
      if (pin === '1234') {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
        showToast('Admin unlocked');
        fetchMediaFiles();
      } else {
        showToast('Invalid PIN');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    showToast('Logged out of Admin Portal');
  };

  // Upload Music to Backend Storage
  const handleUploadMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicFile) {
      showToast('Please choose an audio file (.mp3, .wav, .m4a, etc.)');
      return;
    }

    setIsUploadingMusic(true);
    const formData = new FormData();
    formData.append('music', musicFile);
    formData.append('title', musicTitle || musicFile.name);

    try {
      const res = await fetch('/api/upload/music', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        showToast('Wedding music uploaded to backend storage & set as active soundtrack! 🎵');
        setMusicFile(null);
        setMusicTitle('');
        setPreviewAudioUrl(data.music.url);
        fetchWeddingConfig();
        fetchMediaFiles();
      } else {
        showToast(data.message || 'Music upload failed');
      }
    } catch (err: any) {
      showToast('Error uploading music: ' + err.message);
    } finally {
      setIsUploadingMusic(false);
    }
  };

  // Upload Photo to Backend Storage
  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoFile) {
      showToast('Please select a photo file to upload');
      return;
    }

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append('key', photoKey);
    formData.append('photo', photoFile);

    try {
      const res = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Photo for ${photoKey} uploaded and stored in backend! 📸`);
        setPhotoFile(null);
        fetchWeddingConfig();
        fetchMediaFiles();
      } else {
        showToast(data.message || 'Photo upload failed');
      }
    } catch (err: any) {
      showToast('Error uploading photo: ' + err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Select any music as active soundtrack (from uploaded list, direct URL, or preset)
  const handleSelectActiveMusic = async (url: string, title: string) => {
    try {
      const res = await fetch('/api/music/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: '1234',
          url,
          title,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPreviewAudioUrl(url);
        fetchWeddingConfig();
        showToast(`Wedding music activated: ${title} 🎵`);
        try {
          const cached = localStorage.getItem('wedding_config_cache');
          const parsed = cached ? JSON.parse(cached) : {};
          localStorage.setItem(
            'wedding_config_cache',
            JSON.stringify({ ...parsed, activeMusicUrl: url, activeMusicTitle: title })
          );
        } catch (e) {}
      } else {
        showToast(data.message || 'Failed to update music');
      }
    } catch (e: any) {
      showToast('Error updating music: ' + e.message);
    }
  };

  // Convert Google Drive or Dropbox links to direct streaming links
  const normalizeAudioUrl = (inputUrl: string): string => {
    let clean = inputUrl.trim();
    // Google Drive share link: https://drive.google.com/file/d/FILE_ID/view...
    const gdMatch = clean.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (gdMatch && gdMatch[1]) {
      return `https://drive.google.com/uc?export=download&id=${gdMatch[1]}`;
    }
    // Dropbox share link: dl=0 -> raw=1
    if (clean.includes('dropbox.com')) {
      clean = clean.replace(/\?dl=0$/, '?raw=1').replace(/\?dl=1$/, '?raw=1');
      if (!clean.includes('raw=1')) {
        clean += (clean.includes('?') ? '&' : '?') + 'raw=1';
      }
      return clean;
    }
    return clean;
  };

  // Set direct online audio URL
  const handleApplyDirectAudio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directAudioUrl.trim()) {
      showToast('Please enter an audio stream URL');
      return;
    }
    setIsApplyingDirectAudio(true);
    const finalUrl = normalizeAudioUrl(directAudioUrl);
    const finalTitle = directAudioTitle.trim() || 'Online Wedding Soundtrack';
    await handleSelectActiveMusic(finalUrl, finalTitle);
    setDirectAudioUrl('');
    setDirectAudioTitle('');
    setIsApplyingDirectAudio(false);
  };

  // Set direct online photo URL
  const handleApplyDirectPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directPhotoUrl.trim()) {
      showToast('Please enter an image URL');
      return;
    }
    try {
      const res = await fetch('/api/wedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: '1234',
          updates: {
            photos: { [photoKey]: directPhotoUrl.trim() },
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Permanent photo URL set for ${photoKey}! 📸`);
        setDirectPhotoUrl('');
        fetchWeddingConfig();
      }
    } catch (e: any) {
      showToast('Error setting photo URL: ' + e.message);
    }
  };

  // Export full wedding configuration backup
  const handleExportBackup = () => {
    if (!wedding) return;
    const jsonStr = JSON.stringify(wedding, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wedding_invitation_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Configuration backup JSON exported! 💾');
  };

  // Restore configuration from backup
  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const res = await fetch('/api/wedding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin: '1234', updates: parsed }),
        });
        const data = await res.json();
        if (data.success) {
          fetchWeddingConfig();
          showToast('Configuration restored successfully! ✨');
        } else {
          showToast('Failed to restore config');
        }
      } catch (err: any) {
        showToast('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  // Switch to Preset Track
  const applyPresetMusic = async (preset: { title: string; url: string }) => {
    await handleSelectActiveMusic(preset.url, preset.title);
  };

  // Delete media file from backend
  const handleDeleteMedia = async (type: 'music' | 'photos', filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename} from backend server storage?`)) return;
    try {
      const res = await fetch(`/api/media/${type}/${filename}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('File removed from server storage');
        fetchMediaFiles();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Wedding Details
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/wedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: '1234',
          updates: editDetails,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchWeddingConfig();
        showToast('Wedding details updated in backend database!');
      } else {
        showToast('Failed to update details');
      }
    } catch (e) {
      console.error(e);
      showToast('Error updating wedding details');
    }
  };

  const presets = [
    {
      title: 'Sacred Indian Flute & Sitar Ensemble',
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=indian-instrumental-flute-112702.mp3',
      tag: 'Classical Flute & Sitar',
    },
    {
      title: 'Mangal Shehnai & Festive Dholak',
      url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_248fa3910c.mp3?filename=indian-celebration-10777.mp3',
      tag: 'Festive Shehnai',
    },
    {
      title: 'Gentle Kashmiri Santoor & Tanpura',
      url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=meditative-indian-14227.mp3',
      tag: 'Melodic Santoor',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#2C1810] font-sans flex flex-col">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#4A0E17] text-[#FFF0A8] border border-[#D4AF37] px-6 py-3 rounded-xl shadow-2xl text-xs font-semibold tracking-wide flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Standalone Admin Bar */}
      <header className="bg-[#4A0E17] text-[#FAF6F0] border-b-2 border-[#D4AF37] px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#681320] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-cinzel text-base sm:text-lg font-bold text-[#FFF0A8]">
              Wedding Backend & File Management Portal
            </h1>
            <p className="text-[11px] text-[#FAF6F0]/70">
              {wedding ? `${wedding.brideName} & ${wedding.groomName} Wedding` : 'Loading backend config...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Link back to Main Guest App */}
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#D4AF37] hover:bg-[#FFE082] text-[#4A0E17] text-xs font-bold transition shadow-sm cursor-pointer"
            title="Open Live Guest Wedding Invitation"
          >
            <span>Open Main Invitation</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
              title="Logout from Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      {!isAuthenticated ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-[#FFFDF9] rounded-2xl max-w-md w-full p-8 border-2 border-[#D4AF37]/50 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#681320] text-[#D4AF37] border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h2 className="font-cinzel text-2xl font-bold text-[#4A0E17]">
                Backend Admin Authentication
              </h2>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Enter your Admin Security PIN to manage wedding music files, ceremony photos, and configuration stored on the backend.
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <input
                type="password"
                placeholder="Enter PIN (Default: 1234)"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full text-center tracking-[0.3em] text-xl font-bold px-4 py-3 rounded-xl border border-gray-300 focus:border-[#8A1B2D] outline-none bg-white shadow-inner"
                autoFocus
              />

              <button
                type="submit"
                className="w-full shimmer-btn text-[#4A0E17] font-bold text-xs uppercase tracking-wider py-3 rounded-full cursor-pointer shadow-md"
              >
                Unlock Backend Controls
              </button>
            </form>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Security PIN: <strong>1234</strong></span>
              <button
                onClick={onNavigateHome}
                className="text-[#8A1B2D] underline hover:text-[#4A0E17] cursor-pointer"
              >
                ← Return to Invitation
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-x-auto">
            {[
              { id: 'music', label: 'Music & Audio Storage', icon: Music },
              { id: 'photos', label: 'Photo Storage & Gallery', icon: ImageIcon },
              { id: 'details', label: 'Wedding Details', icon: Settings },
              { id: 'storage', label: 'Server Files Inventory', icon: HardDrive },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#681320] text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: MUSIC & AUDIO STORAGE */}
          {activeTab === 'music' && (
            <div className="space-y-6">
              
              {/* Active Track Banner & Test Player */}
              <div className="bg-gradient-to-r from-[#FFFDF9] to-[#FAF6F0] p-6 rounded-2xl border-2 border-[#D4AF37] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold tracking-wider uppercase border border-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live Active Guest Soundtrack
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">
                      {wedding?.activeMusicUrl?.startsWith('/uploads/') ? 'Saved on Server Disk' : 'Web Stream URL'}
                    </span>
                  </div>
                  <h3 className="font-cinzel text-xl font-bold text-[#4A0E17]">
                    {wedding?.activeMusicTitle || 'Sacred Indian Flute & Sitar Ensemble'}
                  </h3>
                  <p className="text-xs text-gray-600 font-mono break-all max-w-2xl bg-white/70 px-2.5 py-1 rounded border border-gray-200">
                    {wedding?.activeMusicUrl}
                  </p>
                </div>

                {/* In-Admin Audio Player Preview */}
                {previewAudioUrl && (
                  <div className="flex flex-col items-end gap-1.5 w-full md:w-auto">
                    <span className="text-[10px] font-bold text-[#8A1B2D] uppercase tracking-wider">
                      Listen Live Preview
                    </span>
                    <div className="bg-white p-2 rounded-xl border border-[#D4AF37]/50 shadow-sm w-full md:w-auto">
                      <audio
                        id="adminAudioPlayer"
                        src={previewAudioUrl}
                        onPlay={() => setIsPreviewPlaying(true)}
                        onPause={() => setIsPreviewPlaying(false)}
                        controls
                        className="h-9 w-full md:w-72"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* LIBRARY OF UPLOADED AUDIO FILES ON SERVER DISK */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <FileAudio className="w-5 h-5 text-[#8A1B2D]" />
                    <div>
                      <h3 className="font-cinzel text-base font-bold text-[#4A0E17]">
                        Your Uploaded Music Library ({serverMedia.music.length} Track{serverMedia.music.length === 1 ? '' : 's'})
                      </h3>
                      <p className="text-xs text-gray-500">
                        Tracks saved on the server's disk. You can switch between them at any time.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => fetchMediaFiles(false)}
                    className="flex items-center gap-1 text-xs text-[#8A1B2D] hover:underline cursor-pointer"
                  >
                    <span>Refresh List</span>
                  </button>
                </div>

                {serverMedia.music.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-[#D4AF37]/60 bg-[#FAF6F0] text-center space-y-2">
                    <Music className="w-8 h-8 text-[#8A1B2D]/40 mx-auto" />
                    <p className="text-xs font-semibold text-gray-700">No custom tracks uploaded yet</p>
                    <p className="text-[11px] text-gray-500 max-w-md mx-auto">
                      Upload your MP3 file below (e.g. your couple entry song or favorite instrumental cover).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {serverMedia.music.map((m) => {
                      const isActive = wedding?.activeMusicUrl === m.url;
                      const cleanTitle = m.filename
                        .replace(/^music_\d+_/, '')
                        .replace(/\.[^/.]+$/, '')
                        .replace(/_/g, ' ');

                      return (
                        <div
                          key={m.filename}
                          className={`p-4 rounded-xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3 ${
                            isActive
                              ? 'bg-[#FAF6F0] border-2 border-[#D4AF37] shadow-sm'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                {cleanTitle}
                              </h4>
                              {isActive ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  Currently Playing on Invitation
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-400">Ready in Library</span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 font-mono truncate">
                              File: {m.filename} • {(m.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>

                          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                            <audio src={m.url} controls className="h-8 w-44 sm:w-56" />

                            {!isActive ? (
                              <button
                                onClick={() => handleSelectActiveMusic(m.url, cleanTitle)}
                                className="px-4 py-2 rounded-xl bg-[#681320] text-[#FFF0A8] hover:bg-[#8A1B2D] text-xs font-bold transition shadow-sm cursor-pointer whitespace-nowrap"
                              >
                                Set as Active
                              </button>
                            ) : (
                              <button
                                disabled
                                className="px-4 py-2 rounded-xl bg-gray-100 text-emerald-700 text-xs font-bold border border-emerald-200 cursor-default whitespace-nowrap"
                              >
                                Selected ✓
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteMedia('music', m.filename)}
                              className="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                              title="Delete from server"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* UPLOAD NEW AUDIO FILE FORM */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <Upload className="w-5 h-5 text-[#8A1B2D]" />
                  <div>
                    <h3 className="font-cinzel text-base font-bold text-[#4A0E17]">
                      Upload New Wedding Audio to Backend
                    </h3>
                    <p className="text-xs text-gray-500">
                      The MP3 file is saved to <code className="text-[#8A1B2D]">uploads/music/</code> on the server disk and automatically activated.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUploadMusic} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Song / Track Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tera Ban Jaunga (Instrumental Cover)"
                      value={musicTitle}
                      onChange={(e) => setMusicTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-[#8A1B2D] text-xs outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Select Audio File (.mp3, .wav, .ogg, .m4a)
                    </label>
                    <input
                      type="file"
                      accept="audio/*,.mp3,.wav,.ogg,.m4a"
                      onChange={(e) => setMusicFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-gray-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#681320] file:text-[#FAF6F0] hover:file:bg-[#8A1B2D] cursor-pointer bg-[#FAF6F0] p-2 rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUploadingMusic || !musicFile}
                    className="shimmer-btn text-[#4A0E17] font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-full cursor-pointer shadow-md disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingMusic ? 'Storing to Backend Server...' : 'Upload & Save to Backend'}</span>
                  </button>
                </form>
              </div>

              {/* PERMANENT DIRECT CLOUD URL (RECOMMENDED FOR MASS WHATSAPP INVITES) */}
              <div className="bg-[#FFFDF9] p-6 rounded-2xl border-2 border-dashed border-[#D4AF37] shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#681320] text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-cinzel text-base font-bold text-[#4A0E17]">
                        Permanent Direct Cloud / Web Audio URL
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#681320] text-[10px] font-bold">
                        Recommended for 100% Reliability
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong>Why use a direct cloud URL?</strong> In cloud preview environments and serverless hosts, local disk uploads can be reset if the server container restarts or goes to sleep. By pasting a direct link from <strong>Google Drive</strong>, <strong>Dropbox</strong>, <strong>Cloudinary</strong>, or any web host, the music stays online permanently 24/7 without risk of disappearing!
                    </p>
                  </div>
                </div>

                <form onSubmit={handleApplyDirectAudio} className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Song Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tera Ban Jaunga Flute & Piano"
                        value={directAudioTitle}
                        onChange={(e) => setDirectAudioTitle(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs outline-none bg-white focus:border-[#8A1B2D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Direct Audio URL (Supports Google Drive / Dropbox share links!)
                      </label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/file/d/... OR https://...song.mp3"
                        value={directAudioUrl}
                        onChange={(e) => setDirectAudioUrl(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs outline-none bg-white focus:border-[#8A1B2D]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                    <p className="text-[11px] text-gray-500">
                      💡 Tip: Share a Google Drive audio file with "Anyone with link", paste it here, and the system auto-converts it to a permanent direct stream!
                    </p>
                    <button
                      type="submit"
                      disabled={isApplyingDirectAudio || !directAudioUrl.trim()}
                      className="px-6 py-2.5 rounded-full bg-[#681320] text-[#FFF0A8] hover:bg-[#8A1B2D] text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isApplyingDirectAudio ? 'Activating...' : 'Activate Direct URL'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* PRESETS */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <h3 className="font-cinzel text-sm font-bold text-gray-800">
                  Or Pick From Auspicious Pre-Loaded Instrumentals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {presets.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-gray-200 hover:border-[#D4AF37] bg-[#FAF6F0] flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <span className="text-[10px] text-[#8A1B2D] font-bold uppercase">{p.tag}</span>
                        <h4 className="text-xs font-semibold text-gray-900 mt-1">{p.title}</h4>
                      </div>
                      <button
                        onClick={() => applyPresetMusic(p)}
                        className="w-full py-2 rounded-lg bg-[#681320] text-[#FFF0A8] text-xs font-semibold hover:bg-[#8A1B2D] transition cursor-pointer"
                      >
                        Set as Active
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PHOTO STORAGE & GALLERY */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              {/* Photo Upload Form */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                  <Upload className="w-5 h-5 text-[#8A1B2D]" />
                  <div>
                    <h3 className="font-cinzel text-base font-bold text-[#4A0E17]">
                      Upload Ceremony Photos to Backend
                    </h3>
                    <p className="text-xs text-gray-500">
                      Uploaded pictures are saved to the server's <code className="text-[#8A1B2D]">uploads/photos/</code> folder and update the wedding ceremony cards.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUploadPhoto} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Select Ceremony / Section
                    </label>
                    <select
                      value={photoKey}
                      onChange={(e) => setPhotoKey(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                    >
                      <option value="hero">Hero Couple Photo (Main Banner)</option>
                      <option value="bride">Bride Portrait</option>
                      <option value="groom">Groom Portrait</option>
                      <option value="sangeet">Sangeet Ceremony Photo</option>
                      <option value="binayak">Ghee Binayak Ceremony Photo</option>
                      <option value="haldi">Haldi Ceremony Photo</option>
                      <option value="mayra">Mayra / Bhaat Photo</option>
                      <option value="varmala">Varmala & Pheras Photo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Choose Image (.jpg, .jpeg, .png, .webp)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#681320] file:text-[#FAF6F0] hover:file:bg-[#8A1B2D] cursor-pointer bg-[#FAF6F0] p-1.5 rounded-xl"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={isUploadingPhoto || !photoFile}
                      className="w-full shimmer-btn text-[#4A0E17] font-bold text-xs uppercase tracking-wider py-3 rounded-xl cursor-pointer shadow-md disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isUploadingPhoto ? 'Uploading...' : 'Save Photo to Server'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Permanent Direct Image URL Option */}
              <div className="bg-[#FFFDF9] p-6 rounded-2xl border-2 border-dashed border-[#D4AF37] shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#681320] text-[#D4AF37] flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-cinzel text-base font-bold text-[#4A0E17]">
                      Or Set Permanent Online Photo URL
                    </h3>
                    <p className="text-xs text-gray-600">
                      Use hosted photos (Unsplash, Google Drive, Cloudinary, Imgur) to ensure zero chance of images resetting.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleApplyDirectPhoto} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Section / Ceremony
                    </label>
                    <select
                      value={photoKey}
                      onChange={(e) => setPhotoKey(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                    >
                      <option value="hero">Hero Couple Photo</option>
                      <option value="bride">Bride Portrait</option>
                      <option value="groom">Groom Portrait</option>
                      <option value="sangeet">Sangeet Photo</option>
                      <option value="binayak">Ghee Binayak Photo</option>
                      <option value="haldi">Haldi Photo</option>
                      <option value="mayra">Mayra Photo</option>
                      <option value="varmala">Varmala Photo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Direct Image Web Link
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or Cloudinary URL"
                      value={directPhotoUrl}
                      onChange={(e) => setDirectPhotoUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs outline-none bg-white focus:border-[#8A1B2D]"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={!directPhotoUrl.trim()}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#681320] text-[#FFF0A8] hover:bg-[#8A1B2D] text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      Update Ceremony Image
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Photos Gallery */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-cinzel text-base font-bold text-[#4A0E17]">
                  Current Live Ceremony Photos
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Object.entries(wedding?.photos || {}).map(([key, url]) => (
                    <div key={key} className="border border-[#D4AF37]/40 rounded-2xl overflow-hidden bg-[#FAF6F0] p-2.5 space-y-2 shadow-sm">
                      <div className="aspect-[3/4] sm:aspect-[4/5] rounded-xl overflow-hidden bg-[#2C070D] relative group border border-[#D4AF37]/30">
                        <img src={url} alt={key} className="w-full h-full object-cover object-[center_top] group-hover:scale-105 transition duration-500" />
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[11px] font-bold gap-1"
                        >
                          <span>Full View</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase text-[#8A1B2D] truncate">
                          {key}
                        </span>
                        <button
                          onClick={() => {
                            setPhotoKey(key);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-[10px] text-gray-500 hover:text-[#8A1B2D] underline cursor-pointer"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WEDDING DETAILS */}
          {activeTab === 'details' && (
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-cinzel text-base font-bold text-[#4A0E17]">
                  Edit Wedding & Venue Configuration
                </h3>
                <p className="text-xs text-gray-500">
                  Changes made here are permanently stored in the backend and updated on the main invitation.
                </p>
              </div>

              <form onSubmit={handleSaveDetails} className="space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Bride's Name
                    </label>
                    <input
                      type="text"
                      value={editDetails.brideName}
                      onChange={(e) => setEditDetails({ ...editDetails, brideName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Groom's Name
                    </label>
                    <input
                      type="text"
                      value={editDetails.groomName}
                      onChange={(e) => setEditDetails({ ...editDetails, groomName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Wedding Date & Time (ISO format)
                  </label>
                  <input
                    type="datetime-local"
                    value={editDetails.weddingDate ? editDetails.weddingDate.substring(0, 16) : ''}
                    onChange={(e) => setEditDetails({ ...editDetails, weddingDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={editDetails.venueName}
                    onChange={(e) => setEditDetails({ ...editDetails, venueName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Full Venue Address
                  </label>
                  <textarea
                    rows={2}
                    value={editDetails.venueAddress}
                    onChange={(e) => setEditDetails({ ...editDetails, venueAddress: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Google Maps Link
                  </label>
                  <input
                    type="url"
                    value={editDetails.googleMapsUrl}
                    onChange={(e) => setEditDetails({ ...editDetails, googleMapsUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Sacred Sanskrit Shloka
                  </label>
                  <input
                    type="text"
                    value={editDetails.shloka}
                    onChange={(e) => setEditDetails({ ...editDetails, shloka: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Invitation Tagline
                  </label>
                  <input
                    type="text"
                    value={editDetails.tagline}
                    onChange={(e) => setEditDetails({ ...editDetails, tagline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-xs outline-none bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="shimmer-btn text-[#4A0E17] font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-full cursor-pointer shadow-md inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Wedding Details to Backend</span>
                </button>
              </form>

              {/* Backup & Restore Panel */}
              <div className="pt-6 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#8A1B2D]" />
                  <h4 className="font-cinzel text-sm font-bold text-gray-800">
                    Configuration Backup & Restore
                  </h4>
                </div>
                <p className="text-xs text-gray-500">
                  Save a complete offline JSON backup of your wedding invitation settings, music selection, and ceremony details to your device.
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="px-5 py-2.5 rounded-xl bg-[#681320] text-[#FFF0A8] hover:bg-[#8A1B2D] text-xs font-bold transition shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Backup (.json)</span>
                  </button>

                  <label className="px-5 py-2.5 rounded-xl bg-white border border-gray-300 hover:border-[#8A1B2D] text-gray-700 text-xs font-bold transition shadow-sm cursor-pointer inline-flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-[#8A1B2D]" />
                    <span>Restore from Backup (.json)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestoreBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SERVER STORAGE FILES INVENTORY */}
          {activeTab === 'storage' && (
            <div className="space-y-6">
              
              {/* Top Banner & Control Bar */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#681320] text-[#D4AF37] flex items-center justify-center shadow-sm">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <h3 className="font-cinzel text-lg font-bold text-[#4A0E17]">
                        Backend Storage Files Inventory
                      </h3>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Server Disk Connected
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Physical media stored on the application server in <code className="text-[#8A1B2D] font-mono bg-amber-50 px-1 py-0.5 rounded">/uploads/music/</code> and <code className="text-[#8A1B2D] font-mono bg-amber-50 px-1 py-0.5 rounded">/uploads/photos/</code>.
                    </p>
                  </div>

                  {/* Actions: Refresh & Seed */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => fetchMediaFiles(false)}
                      disabled={isLoadingMedia}
                      className="px-4 py-2 rounded-xl bg-white border border-gray-300 hover:border-[#8A1B2D] text-gray-700 hover:text-[#8A1B2D] text-xs font-bold transition shadow-sm cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                      title="Re-scan server directory on disk"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMedia ? 'animate-spin text-[#8A1B2D]' : ''}`} />
                      <span>{isLoadingMedia ? 'Scanning Disk...' : 'Refresh Inventory'}</span>
                    </button>

                    <button
                      onClick={handleSeedMedia}
                      disabled={isSeedingMedia}
                      className="px-4 py-2 rounded-xl bg-[#681320] text-[#FFF0A8] hover:bg-[#8A1B2D] text-xs font-bold transition shadow-sm cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                      title="Populate starter wedding music and ceremony photos on disk"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{isSeedingMedia ? 'Seeding Media...' : 'Seed Default Media'}</span>
                    </button>
                  </div>
                </div>

                {/* Storage Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/40 space-y-1">
                    <div className="flex items-center justify-between text-gray-500 text-[11px] font-semibold uppercase">
                      <span>Total Server Files</span>
                      <FolderOpen className="w-3.5 h-3.5 text-[#8A1B2D]" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 font-cinzel">
                      {serverMedia.music.length + serverMedia.photos.length}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {serverMedia.music.length} Audio • {serverMedia.photos.length} Photos
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/40 space-y-1">
                    <div className="flex items-center justify-between text-gray-500 text-[11px] font-semibold uppercase">
                      <span>Music Storage</span>
                      <Music className="w-3.5 h-3.5 text-[#8A1B2D]" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 font-cinzel">
                      {(serverMedia.music.reduce((sum, m) => sum + (m.size || 0), 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      {serverMedia.music.length} tracks available
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/40 space-y-1">
                    <div className="flex items-center justify-between text-gray-500 text-[11px] font-semibold uppercase">
                      <span>Photos Storage</span>
                      <ImageIcon className="w-3.5 h-3.5 text-[#8A1B2D]" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 font-cinzel">
                      {(serverMedia.photos.reduce((sum, p) => sum + (p.size || 0), 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {serverMedia.photos.length} image files
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF6F0] border border-[#D4AF37]/40 space-y-1">
                    <div className="flex items-center justify-between text-gray-500 text-[11px] font-semibold uppercase">
                      <span>Inventory Status</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-bold text-emerald-700 truncate">
                      Synced & Live
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {lastRefreshedTime ? `Refreshed ${lastRefreshedTime}` : 'Up to date'}
                    </p>
                  </div>
                </div>
              </div>

              {/* QUICK UPLOAD PANELS DIRECTLY ON INVENTORY TAB */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quick Upload Audio */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <Music className="w-4 h-4 text-[#8A1B2D]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                      Quick Upload Audio to Server Disk
                    </h4>
                  </div>
                  <form onSubmit={handleQuickUploadMusic} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Track title (optional)"
                      value={quickMusicTitle}
                      onChange={(e) => setQuickMusicTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white focus:border-[#8A1B2D]"
                    />
                    <input
                      type="file"
                      accept="audio/*,.mp3,.wav,.ogg,.m4a"
                      onChange={(e) => setQuickMusicFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-semibold file:bg-[#681320] file:text-[#FAF6F0] cursor-pointer bg-[#FAF6F0] p-1.5 rounded-xl"
                    />
                    <button
                      type="submit"
                      disabled={isQuickUploadingMusic || !quickMusicFile}
                      className="w-full py-2 px-4 rounded-xl bg-[#681320] text-[#FFF0A8] hover:bg-[#8A1B2D] text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isQuickUploadingMusic ? 'Saving Audio to Disk...' : 'Upload Audio to Inventory'}</span>
                    </button>
                  </form>
                </div>

                {/* Quick Upload Photo */}
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <ImageIcon className="w-4 h-4 text-[#8A1B2D]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800">
                      Quick Upload Photo to Server Disk
                    </h4>
                  </div>
                  <form onSubmit={handleQuickUploadPhoto} className="space-y-3">
                    <select
                      value={quickPhotoKey}
                      onChange={(e) => setQuickPhotoKey(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs outline-none bg-white focus:border-[#8A1B2D]"
                    >
                      <option value="hero">Assign to Hero Couple Banner</option>
                      <option value="bride">Assign to Bride Portrait</option>
                      <option value="groom">Assign to Groom Portrait</option>
                      <option value="haldi">Assign to Haldi Ceremony</option>
                      <option value="sangeet">Assign to Sangeet Ceremony</option>
                      <option value="binayak">Assign to Ghee Binayak</option>
                      <option value="mayra">Assign to Mayra / Bhaat</option>
                      <option value="varmala">Assign to Varmala & Pheras</option>
                    </select>
                    <input
                      type="file"
                      accept="image/*,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => setQuickPhotoFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-semibold file:bg-[#681320] file:text-[#FAF6F0] cursor-pointer bg-[#FAF6F0] p-1.5 rounded-xl"
                    />
                    <button
                      type="submit"
                      disabled={isQuickUploadingPhoto || !quickPhotoFile}
                      className="w-full py-2 px-4 rounded-xl bg-[#681320] text-[#FFF0A8] hover:bg-[#8A1B2D] text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isQuickUploadingPhoto ? 'Saving Photo to Disk...' : 'Upload Photo to Inventory'}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* SECTION A: MUSIC FILES INVENTORY */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-[#8A1B2D] flex items-center justify-center font-bold">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-bold text-gray-900">
                        Music Files in /uploads/music/ ({serverMedia.music.length})
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Select any uploaded track to immediately play as the wedding soundtrack for all guests.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Target: /uploads/music/
                  </span>
                </div>

                {serverMedia.music.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-[#D4AF37] bg-[#FAF6F0] text-center space-y-3">
                    <Music className="w-10 h-10 text-[#8A1B2D]/40 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-gray-800">No audio files detected in /uploads/music/</p>
                      <p className="text-[11px] text-gray-500 max-w-md mx-auto mt-1">
                        You can upload an MP3/WAV file above or click the button below to seed high-fidelity auspicious wedding instrumentals.
                      </p>
                    </div>
                    <button
                      onClick={handleSeedMedia}
                      disabled={isSeedingMedia}
                      className="px-5 py-2 rounded-full shimmer-btn text-[#4A0E17] font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Seed Royal Wedding Instrumentals</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {serverMedia.music.map((m) => {
                      const isActive = wedding?.activeMusicUrl === m.url;
                      const cleanTitle = m.filename
                        .replace(/^music_\d+_/, '')
                        .replace(/\.[^/.]+$/, '')
                        .replace(/_/g, ' ');

                      return (
                        <div
                          key={m.filename}
                          className={`p-4 rounded-xl border transition flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                            isActive
                              ? 'bg-amber-50/60 border-2 border-[#D4AF37] shadow-sm'
                              : 'bg-[#FAF6F0]/50 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                                {cleanTitle}
                              </h5>
                              {isActive ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  LIVE ON INVITATION
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-medium border border-gray-200">
                                  In Storage Library
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-gray-500 font-mono flex-wrap">
                              <span className="truncate max-w-xs">{m.filename}</span>
                              <span>•</span>
                              <span>{(m.size / 1024 / 1024).toFixed(2)} MB</span>
                              {m.createdAt && (
                                <>
                                  <span>•</span>
                                  <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Audio Player and Actions */}
                          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
                            <audio src={m.url} controls className="h-8 w-44 sm:w-56" />

                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(m.url);
                                showToast('File URL copied to clipboard! 📋');
                              }}
                              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition cursor-pointer"
                              title="Copy relative file URL"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {!isActive ? (
                              <button
                                onClick={() => handleSelectActiveMusic(m.url, cleanTitle)}
                                className="px-4 py-2 rounded-xl bg-[#681320] text-[#FFF0A8] hover:bg-[#8A1B2D] text-xs font-bold transition shadow-sm cursor-pointer whitespace-nowrap"
                              >
                                Set as Active
                              </button>
                            ) : (
                              <button
                                disabled
                                className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 cursor-default whitespace-nowrap"
                              >
                                Active ✓
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteMedia('music', m.filename)}
                              className="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                              title="Delete from server storage"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION B: PHOTOS INVENTORY */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-100 text-[#8A1B2D] flex items-center justify-center font-bold">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs uppercase tracking-wider font-bold text-gray-900">
                        Photo Files in /uploads/photos/ ({serverMedia.photos.length})
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Ceremony pictures stored on disk. Assign any photo to wedding cards (Hero, Bride, Groom, Haldi, Sangeet).
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Target: /uploads/photos/
                  </span>
                </div>

                {serverMedia.photos.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-[#D4AF37] bg-[#FAF6F0] text-center space-y-3">
                    <ImageIcon className="w-10 h-10 text-[#8A1B2D]/40 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-gray-800">No photos detected in /uploads/photos/</p>
                      <p className="text-[11px] text-gray-500 max-w-md mx-auto mt-1">
                        Upload wedding photos above or click below to populate starter ceremony photography onto the server disk.
                      </p>
                    </div>
                    <button
                      onClick={handleSeedMedia}
                      disabled={isSeedingMedia}
                      className="px-5 py-2 rounded-full shimmer-btn text-[#4A0E17] font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Seed Sample Ceremony Photos</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {serverMedia.photos.map((p) => {
                      // Find which ceremony card uses this photo
                      const matchingKeys = Object.entries(wedding?.photos || {})
                        .filter(([_, url]) => url === p.url)
                        .map(([k]) => k);

                      return (
                        <div
                          key={p.filename}
                          className="p-3 bg-[#FAF6F0] rounded-xl border border-gray-200 hover:border-[#D4AF37] transition flex flex-col justify-between space-y-3 shadow-xs"
                        >
                          <div className="space-y-2">
                            {/* Image Thumbnail with Overlay - Portrait aspect with Top Face Anchoring */}
                            <div className="aspect-[3/4] sm:aspect-[4/5] rounded-xl overflow-hidden bg-[#2C070D] relative group border border-[#D4AF37]/30 p-1">
                              <img
                                src={p.url}
                                alt={p.filename}
                                className="w-full h-full object-cover object-[center_top] rounded-lg group-hover:scale-105 transition duration-500"
                                loading="lazy"
                              />
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1"
                              >
                                <span>Open Full Image</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>

                            {/* Usage Badges */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {matchingKeys.length > 0 ? (
                                matchingKeys.map((key) => (
                                  <span
                                    key={key}
                                    className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase border border-emerald-300"
                                  >
                                    Used as: {key}
                                  </span>
                                ))
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium">
                                  Unassigned File
                                </span>
                              )}
                            </div>

                            {/* Filename and size info */}
                            <div>
                              <p className="font-semibold text-xs text-gray-900 truncate" title={p.filename}>
                                {p.filename}
                              </p>
                              <p className="text-[10px] text-gray-500 font-mono">
                                {(p.size / 1024 / 1024).toFixed(2)} MB
                                {p.createdAt && ` • ${new Date(p.createdAt).toLocaleDateString()}`}
                              </p>
                            </div>
                          </div>

                          {/* Quick Assign Dropdown & Delete Action */}
                          <div className="pt-2 border-t border-gray-200/70 space-y-2">
                            <div className="flex items-center gap-1.5">
                              <select
                                id={`assign-${p.filename}`}
                                defaultValue="hero"
                                className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-300 text-[11px] bg-white text-gray-700 outline-none focus:border-[#8A1B2D]"
                              >
                                <option value="hero">Hero Couple</option>
                                <option value="bride">Bride Portrait</option>
                                <option value="groom">Groom Portrait</option>
                                <option value="haldi">Haldi Ceremony</option>
                                <option value="sangeet">Sangeet Ceremony</option>
                                <option value="binayak">Ghee Binayak</option>
                                <option value="mayra">Mayra / Bhaat</option>
                                <option value="varmala">Varmala & Pheras</option>
                              </select>
                              <button
                                onClick={() => {
                                  const selectEl = document.getElementById(`assign-${p.filename}`) as HTMLSelectElement;
                                  if (selectEl) {
                                    handleAssignPhotoToCeremony(p.url, selectEl.value);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg bg-[#681320] text-[#FFF0A8] hover:bg-[#8A1B2D] text-[11px] font-bold transition shadow-xs cursor-pointer whitespace-nowrap"
                              >
                                Apply
                              </button>
                            </div>

                            <div className="flex items-center justify-between text-[11px] pt-1">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(p.url);
                                  showToast('Photo URL copied! 📋');
                                }}
                                className="text-gray-500 hover:text-gray-800 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>Copy Link</span>
                              </button>

                              <button
                                onClick={() => handleDeleteMedia('photos', p.filename)}
                                className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer inline-flex items-center gap-1 text-[11px]"
                                title="Delete photo file from server"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
};

