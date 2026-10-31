import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { WeddingConfig } from '../types/wedding';

interface EnvelopeModalProps {
  wedding: WeddingConfig;
  isOpen: boolean;
  onOpenComplete: () => void;
}

export const EnvelopeModal: React.FC<EnvelopeModalProps> = ({
  wedding,
  isOpen,
  onOpenComplete,
}) => {
  const [envelopeStage, setEnvelopeStage] = useState<'sealed' | 'opening' | 'extracted'>('sealed');
  const [isFadingOut, setIsFadingOut] = useState(false);

  if (!isOpen) return null;

  const handleSealClick = () => {
    if (envelopeStage !== 'sealed') return;

    // Step 1: Break seal & flip open top flap
    setEnvelopeStage('opening');

    // Step 2: Slide letter out
    setTimeout(() => {
      setEnvelopeStage('extracted');
    }, 600);
  };

  const handleEnterWedding = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onOpenComplete();
      setIsFadingOut(false);
      setEnvelopeStage('sealed');
    }, 700);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#20050A]/85 backdrop-blur-md transition-opacity duration-700 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative w-full max-w-lg flex flex-col items-center">
        
        {/* Top Hint */}
        <div className="mb-4 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#FFE082] font-semibold flex items-center justify-center gap-1.5 drop-shadow">
            <Sparkles className="w-3.5 h-3.5 text-[#FFE082]" />
            Auspicious Wedding Invitation
            <Sparkles className="w-3.5 h-3.5 text-[#FFE082]" />
          </p>
          <p className="text-xs text-[#FFF0A8] font-medium mt-0.5 drop-shadow">
            {envelopeStage === 'sealed'
              ? 'Click the royal wax seal to open'
              : 'Click the card to enter celebrations'}
          </p>
        </div>

        {/* 3D Envelope Container */}
        <div className="relative w-full aspect-[4/3] max-w-[460px] perspective-1000">
          
          {/* THE INNER INVITATION CARD (SLIDES OUT UPWARD) */}
          <div
            onClick={envelopeStage === 'extracted' ? handleEnterWedding : undefined}
            className={`absolute inset-x-4 top-2 bottom-6 bg-[#FFFDF9] rounded-xl border-2 border-[#D4AF37] shadow-2xl p-6 flex flex-col justify-between text-center transition-all duration-700 ease-out z-10 ${
              envelopeStage === 'extracted'
                ? '-translate-y-28 sm:-translate-y-36 shadow-2xl scale-[1.03] z-30 cursor-pointer'
                : 'translate-y-0 z-10'
            }`}
          >
            {/* Top Ornamental Frame */}
            <div className="border border-[#D4AF37]/40 p-4 h-full flex flex-col justify-between rounded-lg relative bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#F5EBE1]">
              {/* Corner Ornaments */}
              <span className="absolute top-1 left-1.5 text-xs text-[#D4AF37]">✦</span>
              <span className="absolute top-1 right-1.5 text-xs text-[#D4AF37]">✦</span>
              <span className="absolute bottom-1 left-1.5 text-xs text-[#D4AF37]">✦</span>
              <span className="absolute bottom-1 right-1.5 text-xs text-[#D4AF37]">✦</span>

              <div>
                {/* Traditional Ganesh Motif */}
                <div className="inline-block px-3 py-1 bg-[#681320] text-[#D4AF37] rounded-full border border-[#D4AF37] text-lg font-bold shadow-sm mb-1.5">
                  ॐ
                </div>
                <p className="text-[10px] tracking-widest text-[#8A1B2D] uppercase font-bold">
                  || श्री गणेशाय नमः ||
                </p>
                <p className="text-xs text-gray-700 italic font-luxury mt-1 font-semibold">
                  {wedding.tagline || 'Together with their families, cordially invite you to celebrate the wedding of'}
                </p>
              </div>

              {/* Couple Names */}
              <div className="py-2 my-1 border-y border-[#D4AF37]/30">
                <h2 className="font-cinzel text-xl sm:text-2xl text-[#681320] font-bold tracking-wide">
                  {wedding.brideName} <span className="font-script text-2xl sm:text-3xl text-[#D4AF37] mx-1">&</span> {wedding.groomName}
                </h2>
                <p className="text-[11px] uppercase tracking-wider text-[#997D28] font-bold mt-1">
                  Saturday, November 21, 2026, 7.30 PM onwards
                </p>
              </div>

              {/* Venue Brief */}
              <div>
                <p className="text-xs text-gray-800 font-bold">
                  {wedding.venueName}
                </p>
                <p className="text-[10px] text-gray-600 max-w-xs mx-auto truncate">
                  {wedding.venueAddress}
                </p>

                {envelopeStage === 'extracted' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnterWedding();
                    }}
                    className="mt-3 shimmer-btn text-[#4A0E17] font-bold text-xs uppercase tracking-wider px-6 py-2 rounded-full cursor-pointer transition transform hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5 mx-auto shadow-lg"
                  >
                    <span>Enter Celebration</span>
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* THE ENVELOPE BASE POUCH */}
          <div className="absolute inset-0 bg-[#550F1A] rounded-2xl border-4 border-[#D4AF37] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden z-20">
            {/* Background Texture & Mandala Watermark */}
            <div className="absolute inset-0 bg-mandala-crimson opacity-40"></div>
            
            {/* Golden Corner Accents */}
            <div className="absolute top-3 left-3 text-[#D4AF37] text-lg font-serif">❖</div>
            <div className="absolute top-3 right-3 text-[#D4AF37] text-lg font-serif">❖</div>
            <div className="absolute bottom-3 left-3 text-[#D4AF37] text-lg font-serif">❖</div>
            <div className="absolute bottom-3 right-3 text-[#D4AF37] text-lg font-serif">❖</div>

            {/* Front Envelope Pocket Triangular Folds */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  linear-gradient(to top right, #430B14 50%, transparent 50%),
                  linear-gradient(to top left, #430B14 50%, transparent 50%)
                `,
                backgroundSize: '50% 100%',
                backgroundPosition: 'left bottom, right bottom',
                backgroundRepeat: 'no-repeat',
                opacity: 0.9,
              }}
            />

            {/* Bottom Pocket Overlay */}
            <div
              className="absolute bottom-0 inset-x-0 h-1/2 pointer-events-none border-t border-[#D4AF37]/30"
              style={{
                clipPath: 'polygon(0% 100%, 50% 25%, 100% 100%)',
                background: 'linear-gradient(180deg, #681320 0%, #3B0911 100%)',
              }}
            />

            {/* Envelope Center Cover Text (visible when sealed) */}
            {envelopeStage === 'sealed' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-20">
                <div className="w-12 h-12 rounded-full border-2 border-[#D4AF37] bg-[#3B0911] flex items-center justify-center text-[#D4AF37] text-2xl font-bold shadow-inner mb-2">
                  ॐ
                </div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] font-semibold">
                  Auspicious Wedding Union
                </p>
                <h1 className="font-cinzel text-xl sm:text-2xl gold-foil font-bold my-1">
                  {wedding.brideName} & {wedding.groomName}
                </h1>
                <p className="text-[11px] text-[#F3E5AB]/80 tracking-wide font-luxury">
                  Save the Date: November 21, 2026
                </p>
              </div>
            )}
          </div>

          {/* THE TOP TRIANGULAR FLAP (3D FLIPS UPWARD ON OPEN) */}
          <div
            className={`absolute top-0 inset-x-0 h-1/2 origin-top transition-transform duration-700 ease-in-out z-25 pointer-events-none ${
              envelopeStage !== 'sealed' ? '-rotate-x-180 opacity-60' : 'rotate-x-0'
            }`}
            style={{
              clipPath: 'polygon(0% 0%, 100% 0%, 50% 100%)',
              background: 'linear-gradient(180deg, #7A1727 0%, #4D0C16 100%)',
              borderBottom: '2px solid #D4AF37',
              boxShadow: '0 6px 15px rgba(0,0,0,0.4)',
            }}
          />

          {/* THE WAX SEAL BUTTON IN CENTER */}
          {envelopeStage === 'sealed' && (
            <button
              onClick={handleSealClick}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-16 h-16 rounded-full wax-seal border-2 border-[#FFE082]/60 flex flex-col items-center justify-center text-white cursor-pointer group shadow-2xl transition-all duration-300"
              title="Click the Royal Wax Seal to Open Wedding Invitation"
              aria-label="Click to Open Wedding Invitation"
            >
              <div className="w-12 h-12 rounded-full border border-red-300/40 flex flex-col items-center justify-center">
                <span className="font-serif text-sm font-bold tracking-tight text-[#FFF0A8] group-hover:scale-110 transition-transform">
                  A&H
                </span>
                <Heart className="w-2.5 h-2.5 text-rose-300 fill-rose-300 mt-0.5" />
              </div>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
