/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { WeddingConfig } from './types/wedding';
import { EnvelopeModal } from './components/EnvelopeModal';
import { HeroSection } from './components/HeroSection';
import { EventsTimeline } from './components/EventsTimeline';
import { VenueSection } from './components/VenueSection';
import { AudioPlayer } from './components/AudioPlayer';
import { FallingPetals } from './components/FallingPetals';
import { AdminApp } from './AdminApp';

const DEFAULT_WEDDING: WeddingConfig = {
  groomName: 'Hrishikesh',
  brideName: 'Anuja',
  weddingDate: '2026-11-21T19:30:00',
  venueName: 'Lotus Inn Banquet Hall & Lawns',
  venueAddress: 'Lotus Inn, Ring Rd, near Govind Prabhu Temple, Rahatgaon, Amravati, Maharashtra 444603',
  googleMapsUrl: 'https://maps.google.com/?q=Lotus+Inn+Rahatgaon+Amravati+Maharashtra',
  tagline: 'Together with their families, cordially invite you to celebrate the wedding union of',
  shloka: 'मंगलम् भगवान विष्णुः मंगलम् गरुड़ध्वजः। मंगलम् पुण्डरीकाक्षः मङ्गलाय तनो हरिः॥',
  activeMusicUrl: '/uploads/music/music_1793446606579_Tera_Ban_Jaunga_Instrumental_Cover.wav',
  activeMusicTitle: 'Tera Ban Jaunga (Instrumental Cover)',
  photos: {
    hero: '/uploads/photos/photo_1793452726220_1000318278.jpg',
    bride: '/uploads/photos/photo_1793440002000_bride_portrait.jpg',
    groom: '/uploads/photos/photo_1793440003000_groom_portrait.jpg',
    haldi: '/uploads/photos/photo_1793453124491_haldi_image.jpeg',
    sangeet: '/uploads/photos/photo_1793453039777_dance.png',
    binayak: '/uploads/photos/photo_1793453003408_ghee.jpg',
    mayra: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    varmala: '/uploads/photos/photo_1793452969145_phera.jpg',
  },
  events: [
    {
      id: 'sangeet',
      title: 'Sangeet Ceremony & Musical Night',
      date: 'November 20, 2026',
      time: '8:00 PM Onwards',
      day: 'day1',
      venue: 'Lotus Inn Banquet Hall, Rahatgaon',
      attire: 'Glamorous Indian Traditional / Indo-Western',
      desc: 'Get ready for an evening full of musical performances, dance battles, delicious food, and joyous celebrations as the families hit the dance floor!',
    },
    {
      id: 'binayak',
      title: 'Ghee Binayak Ceremony',
      date: 'November 21, 2026',
      time: '8:00 AM',
      day: 'day2',
      venue: 'Lotus Inn Puja Mandap, Rahatgaon',
      attire: 'Traditional Festive Ethnic',
      desc: 'A holy Ganpati Sthapana and Ghee Binayak Puja to seek divine blessings from Lord Ganesha for auspicious beginnings and a peaceful union.',
    },
    {
      id: 'haldi',
      title: 'Haldi Ceremony & Flower Shower',
      date: 'November 21, 2026',
      time: '10:30 AM',
      day: 'day2',
      venue: 'Lotus Inn Lawns, Rahatgaon',
      attire: 'Shades of Yellow / Mustard Festive Wear',
      desc: 'Join us in applying holy turmeric paste to the couple amidst marigold flowers, festive songs, dhol beats, and sunny celebrations!',
    },
    {
      id: 'mayra',
      title: 'Mayra / Bhaat Ceremony',
      date: 'November 21, 2026',
      time: '3:00 PM',
      day: 'day2',
      venue: 'Lotus Inn Courtyard, Rahatgaon',
      attire: 'Traditional Royal Attire',
      desc: 'A heartfelt ceremony honoring maternal relatives as they welcome guests with blessings, traditional gifts, and love.',
    },
    {
      id: 'varmala',
      title: 'Varmala & Sacred Seven Pheras',
      date: 'November 21, 2026',
      time: '7:30 PM Onwards',
      day: 'day2',
      venue: 'Grand Mandap at Lotus Inn, Rahatgaon',
      attire: 'Grand Ethnic / Royal Traditional',
      desc: 'The pinnacle wedding moment! Exchange of floral garlands under the floral canopy, followed by Seven Sacred Pheras around the holy fire.',
    },
  ],
};

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        return '/admin';
      }
    }
    return '/';
  });

  const [wedding, setWedding] = useState<WeddingConfig>(DEFAULT_WEDDING);
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(true);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync route on popstate and hash change
  useEffect(() => {
    const handleLocationChange = () => {
      if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
        setCurrentPath('/admin');
      } else {
        setCurrentPath('/');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret Shortcut: Ctrl+Shift+A or Alt+A or Cmd+Shift+A
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || 
          (e.metaKey && e.shiftKey && e.key.toLowerCase() === 'a') || 
          (e.altKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        window.history.pushState({}, '', '/admin');
        setCurrentPath('/admin');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch wedding configuration from backend with localStorage fallback
  useEffect(() => {
    try {
      const cached = localStorage.getItem('wedding_config_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.activeMusicUrl) {
          setWedding((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {}

    fetch('/api/wedding')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.wedding) {
          setWedding(data.wedding);
          try {
            localStorage.setItem('wedding_config_cache', JSON.stringify(data.wedding));
          } catch (e) {}
        }
      })
      .catch((err) => {
        console.error('Failed to load wedding config from backend:', err);
      });
  }, [currentPath]);

  // If on /admin, render the standalone Admin Application
  if (currentPath === '/admin') {
    return (
      <AdminApp
        onNavigateHome={() => {
          window.history.pushState({}, '', '/');
          setCurrentPath('/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const handleEnvelopeComplete = () => {
    setIsEnvelopeOpen(false);
    setAutoPlayAudio(true);
    showToast('Welcome to the Royal Wedding of Anuja & Hrishikesh! 🌺');
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2C1810] relative font-sans">
      
      {/* Falling Flower Petals Canvas - Continuous Royal Celebration */}
      <FallingPetals enabled={true} />

      {/* Invisible Background Audio Player (No frontend icon or widget) */}
      <AudioPlayer
        musicUrl={wedding.activeMusicUrl}
        autoPlayTrigger={autoPlayAudio}
      />

      {/* Interactive 3D Envelope Modal */}
      <EnvelopeModal
        wedding={wedding}
        isOpen={isEnvelopeOpen}
        onOpenComplete={handleEnvelopeComplete}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#4A0E17] text-[#FFF0A8] border border-[#D4AF37] px-6 py-2.5 rounded-full shadow-2xl text-xs font-semibold tracking-wide flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Website Header Navigation Bar */}
      <nav className="sticky top-0 z-30 bg-[#FAF6F0]/95 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-sm px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Logo / Monogram */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            onDoubleClick={() => {
              window.history.pushState({}, '', '/admin');
              setCurrentPath('/admin');
            }}
            className="flex items-center gap-2 cursor-pointer group"
            title={`${wedding.brideName} & ${wedding.groomName}`}
          >
            <div className="w-8 h-8 rounded-full bg-[#681320] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold text-xs shadow-inner">
              ॐ
            </div>
            <span className="font-cinzel text-sm sm:text-base font-bold text-[#681320] group-hover:text-[#8A1B2D] transition-colors">
              {wedding.brideName} & {wedding.groomName}
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-gray-700">
            <button
              onClick={() => scrollToSection('events')}
              className="hover:text-[#8A1B2D] transition-colors cursor-pointer"
            >
              Ceremonies
            </button>
            <button
              onClick={() => scrollToSection('venue')}
              className="hover:text-[#8A1B2D] transition-colors cursor-pointer"
            >
              Venue
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-[#681320] hover:text-[#8A1B2D] cursor-pointer"
            aria-label="Toggle mobile navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 border-t border-gray-200 mt-2 flex flex-col space-y-2 text-center text-xs font-semibold uppercase tracking-wider">
            <button
              onClick={() => scrollToSection('events')}
              className="py-2 hover:bg-gray-100 rounded-lg text-gray-800"
            >
              Ceremonies
            </button>
            <button
              onClick={() => scrollToSection('venue')}
              className="py-2 hover:bg-gray-100 rounded-lg text-gray-800"
            >
              Venue & Directions
            </button>
          </div>
        )}
      </nav>

      {/* Main Wedding Content Flow */}
      <main>
        {/* 1. Hero Section */}
        <HeroSection wedding={wedding} />

        {/* 2. Events & Itinerary */}
        <EventsTimeline wedding={wedding} onToast={showToast} />

        {/* 3. Venue & Directions */}
        <VenueSection wedding={wedding} onToast={showToast} />
      </main>

      {/* Royal Wedding Footer - Clean Guest Presentation */}
      <footer className="bg-[#3B0911] text-[#FAF6F0] py-12 px-4 border-t-2 border-[#D4AF37] relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-mandala-crimson opacity-20 pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] bg-[#550F1A] text-[#D4AF37] flex items-center justify-center text-xl font-bold mx-auto shadow-md">
            ॐ
          </div>

          <h3 className="font-cinzel text-xl sm:text-2xl gold-foil font-bold">
            {wedding.brideName} & {wedding.groomName}
          </h3>

          <p className="text-xs text-[#F3E5AB]/80 font-luxury italic leading-relaxed">
            "Two souls with but a single thought, two hearts that beat as one."
          </p>

          <p className="text-[11px] text-[#FFE082] tracking-wider uppercase font-semibold pt-2">
            Saturday, November 21, 2026, 7.30 PM onwards • Lotus Inn, Rahatgaon, Amravati
          </p>

          <div className="pt-4 border-t border-[#D4AF37]/20 flex items-center justify-center text-xs text-[#FAF6F0]/70 font-medium tracking-wide">
            <p>With Warm Regards & Best Compliments from Both Families</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
