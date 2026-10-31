import React from 'react';
import { MapPin, Copy, Navigation, Check, Car, Landmark } from 'lucide-react';
import { WeddingConfig } from '../types/wedding';

interface VenueSectionProps {
  wedding: WeddingConfig;
  onToast: (msg: string) => void;
}

export const VenueSection: React.FC<VenueSectionProps> = ({ wedding, onToast }) => {
  const [copied, setCopied] = React.useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(wedding.venueAddress);
    setCopied(true);
    onToast('Venue address copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const openMaps = () => {
    const url = wedding.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(wedding.venueAddress)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="venue" className="py-20 px-4 max-w-4xl mx-auto">
      {/* Section Heading */}
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.25em] text-[#8A1B2D] font-bold">
          The Auspicious Destination
        </p>
        <h2 className="font-cinzel text-3xl sm:text-4xl text-[#4A0E17] font-bold mt-1">
          Venue & Directions
        </h2>
        <div className="w-24 h-0.5 bg-[#D4AF37] mx-auto my-3" />
        <p className="text-xs sm:text-sm text-gray-600 font-luxury max-w-xl mx-auto">
          Join us in the regal celebration amidst blooming gardens, grand ballrooms, and divine blessings.
        </p>
      </div>

      {/* Elegant Centered Venue Card */}
      <div className="bg-white rounded-3xl border-2 border-[#D4AF37]/50 shadow-xl overflow-hidden p-8 sm:p-10 space-y-8">
        
        {/* Destination Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF6F0] border border-[#D4AF37]/50 text-[#8A1B2D] text-xs font-bold shadow-sm">
            <MapPin className="w-4 h-4 text-[#8A1B2D]" />
            <span>Wedding Destination & Ceremonial Grounds</span>
          </div>

          <h3 className="font-cinzel text-2xl sm:text-4xl text-[#4A0E17] font-bold tracking-wide">
            {wedding.venueName}
          </h3>

          <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-luxury max-w-2xl mx-auto">
            {wedding.venueAddress}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={openMaps}
              className="shimmer-btn text-[#4A0E17] font-bold text-xs sm:text-sm uppercase tracking-wider px-7 py-3 rounded-full flex items-center gap-2 cursor-pointer shadow-md hover:scale-105 active:scale-95 transition"
            >
              <Navigation className="w-4 h-4" />
              <span>Open in Google Maps</span>
            </button>

            <button
              onClick={copyAddress}
              className="px-6 py-3 rounded-full border-2 border-gray-300 hover:border-[#8A1B2D] text-gray-700 hover:text-[#8A1B2D] text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer bg-white shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Address Copied!' : 'Copy Venue Address'}</span>
            </button>
          </div>
        </div>

        {/* Travel & Guest Amenities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-100 text-xs sm:text-sm text-gray-700">
          <div className="flex items-start gap-3 bg-[#FAF6F0] p-4 rounded-2xl border border-[#D4AF37]/30">
            <Landmark className="w-5 h-5 text-[#8A1B2D] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900 text-sm">Prominent Landmark</p>
              <p className="text-gray-600 mt-0.5">Near Govind Prabhu Temple & Ring Road Junction, Rahatgaon, Amravati</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-[#FAF6F0] p-4 rounded-2xl border border-[#D4AF37]/30">
            <Car className="w-5 h-5 text-[#8A1B2D] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-gray-900 text-sm">Valet & Guest Parking</p>
              <p className="text-gray-600 mt-0.5">Complimentary valet parking and chauffeured drop points available for all guests</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
