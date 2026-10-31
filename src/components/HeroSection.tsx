import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Heart, Clock, Maximize2, X, Sparkles } from 'lucide-react';
import { WeddingConfig } from '../types/wedding';

interface HeroSectionProps {
  wedding: WeddingConfig;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ wedding }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    const targetDate = new Date(wedding.weddingDate || '2026-11-21T19:30:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [wedding.weddingDate]);

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 pt-16 pb-16 overflow-hidden bg-gradient-to-b from-[#F5EBE1] via-[#FAF6F0] to-[#FAF6F0]">
      
      {/* Background Decorative Mandala Pattern */}
      <div className="absolute inset-0 bg-cream-parchment opacity-70 -z-10" />

      {/* Auspicious Ganpati Badge */}
      <div className="mb-4 inline-flex items-center gap-2 px-5 py-1.5 rounded-full border border-[#D4AF37]/50 bg-white shadow-sm">
        <span className="text-[#8A1B2D] font-bold text-lg">ॐ</span>
        <span className="text-xs uppercase tracking-[0.25em] text-[#8A1B2D] font-bold">
          Shree Ganeshaya Namah
        </span>
      </div>

      {/* Sacred Sanskrit Shloka */}
      <div className="max-w-2xl mx-auto mb-6 px-4">
        <div className="bg-white/80 border border-[#D4AF37]/40 px-6 py-3 rounded-2xl shadow-sm backdrop-blur-sm">
          <p className="text-xs sm:text-sm text-[#8A1B2D] font-bold font-luxury italic leading-relaxed tracking-wide">
            "{wedding.shloka}"
          </p>
        </div>
      </div>

      {/* Main Couple Announcement */}
      <div className="max-w-4xl mx-auto text-center mb-6 px-4">
        <p className="text-xs uppercase tracking-[0.25em] text-[#8A1B2D] font-bold">
          Together With Their Families
        </p>

        <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl text-[#4A0E17] font-bold mt-1 tracking-wide">
          {wedding.brideName} <span className="font-script text-3xl sm:text-4xl md:text-5xl text-[#D4AF37] mx-1">&</span> {wedding.groomName}
        </h1>

        <div className="w-24 h-0.5 bg-[#D4AF37] mx-auto my-3" />

        <p className="text-xs sm:text-sm text-gray-600 font-luxury max-w-xl mx-auto leading-relaxed">
          Invite you to share in the divine joy as we unite our hearts and embark on a lifelong journey of love and harmony.
        </p>
      </div>

      {/* Couple Hero Photo Frame - Royal Matting with Correct Face Aspect Ratio & Anchoring */}
      {wedding.photos?.hero && (
        <div className="my-6 relative group max-w-xs sm:max-w-sm w-full px-2">
          {/* Subtle Outer Golden Glow */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-[#D4AF37]/60 via-[#FFF0A8] to-[#AA7C11]/60 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-500" />
          
          {/* Outer Royal Gold Frame with Museum Matting */}
          <div className="relative p-2 sm:p-2.5 bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#EFE7D8] rounded-3xl border-2 border-[#D4AF37] shadow-2xl">
            {/* Inner Image Container: Uses Vertical Portrait Aspect Ratio with Top Face Anchoring */}
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="relative w-full aspect-[4/5] sm:aspect-[3/4] max-h-[460px] rounded-2xl overflow-hidden border border-[#D4AF37]/50 bg-[#2C070D] cursor-pointer group"
              title="Click to view full uncropped photo"
            >
              <img
                src={wedding.photos.hero}
                alt={`${wedding.brideName} and ${wedding.groomName}`}
                className="w-full h-full object-cover object-[center_top] transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Subtle Bottom Vignette (Leaves top faces completely clear & bright) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition duration-300" />
              
              {/* Bottom Badge with Couple Title & Full View Hint */}
              <div className="absolute bottom-0 inset-x-0 p-3.5 flex items-center justify-between">
                <span className="text-xs text-[#FFF0A8] font-cinzel tracking-widest uppercase flex items-center gap-1.5 font-bold drop-shadow">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  The Wedding Union
                </span>
                <span className="text-[10px] bg-black/50 backdrop-blur-xs text-[#FFF0A8] px-2 py-0.5 rounded-full border border-[#D4AF37]/50 flex items-center gap-1">
                  <Maximize2 className="w-3 h-3 text-[#D4AF37]" />
                  <span>Full View</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal for Uncropped Couple Photo */}
      {isLightboxOpen && wedding.photos?.hero && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full max-h-[90vh] bg-[#FFFDF9] rounded-2xl border-2 border-[#D4AF37] p-3 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <span className="font-cinzel text-sm font-bold text-[#4A0E17] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                {wedding.brideName} & {wedding.groomName}
              </span>
              <button
                onClick={() => setIsLightboxOpen(false)}
                className="p-1 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 cursor-pointer"
                aria-label="Close photo preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-2 flex items-center justify-center bg-black/5 rounded-xl">
              <img
                src={wedding.photos.hero}
                alt={`${wedding.brideName} and ${wedding.groomName}`}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Wedding Date (With Time) & Venue Card */}
      <div className="my-6 max-w-2xl w-full mx-auto px-4">
        <div className="bg-white border-2 border-[#D4AF37]/50 rounded-2xl p-6 sm:p-7 shadow-md grid grid-cols-1 sm:grid-cols-2 gap-6 items-center text-center">
          
          {/* Wedding Date Column */}
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[#8A1B2D] font-bold">
              <Calendar className="w-4 h-4 text-[#8A1B2D]" />
              <span>Wedding Date</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-[#4A0E17]">
              Saturday, November 21, 2026
            </p>
            <p className="text-xs font-semibold text-[#8A1B2D]">
              7.30 PM onwards
            </p>
          </div>

          {/* Auspicious Venue Column */}
          <div className="flex flex-col items-center justify-center space-y-1.5 sm:border-l sm:border-[#D4AF37]/40 sm:pl-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#D4AF37]/20">
            <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[#8A1B2D] font-bold">
              <MapPin className="w-4 h-4 text-[#8A1B2D]" />
              <span>Auspicious Venue</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-[#4A0E17]">
              {wedding.venueName}
            </p>
            <p className="text-xs text-gray-600">
              Rahatgaon, Amravati
            </p>
          </div>

        </div>
      </div>

      {/* Countdown Timer */}
      <div className="my-6 max-w-xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-[#8A1B2D] font-bold mb-3 flex items-center justify-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#8A1B2D]" />
          Auspicious Muhurat Countdown
        </p>

        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-md mx-auto">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#D4AF37]/50 rounded-xl p-2.5 sm:p-3 shadow-md flex flex-col items-center justify-center"
            >
              <span className="font-cinzel text-xl sm:text-3xl font-bold text-[#4A0E17]">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-1">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
