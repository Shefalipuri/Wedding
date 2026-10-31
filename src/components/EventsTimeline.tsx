import React, { useState } from 'react';
import { Clock, MapPin, Sparkles, Shirt, Calendar, Music, Sun, Flame, HeartHandshake, Info, Maximize2, X } from 'lucide-react';
import { WeddingConfig, WeddingEvent } from '../types/wedding';

interface EventsTimelineProps {
  wedding: WeddingConfig;
  onToast: (msg: string) => void;
}

export const EventsTimeline: React.FC<EventsTimelineProps> = ({ wedding, onToast }) => {
  const [filterDay, setFilterDay] = useState<'all' | 'day1' | 'day2'>('all');
  const [activeModalEvent, setActiveModalEvent] = useState<WeddingEvent | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  const events = wedding.events || [];
  const filteredEvents = events.filter((evt) => {
    if (filterDay === 'all') return true;
    return evt.day === filterDay;
  });

  const getEventIcon = (id: string) => {
    switch (id) {
      case 'sangeet':
        return <Music className="w-5 h-5 text-[#E0533C]" />;
      case 'binayak':
        return <Sparkles className="w-5 h-5 text-[#D4AF37]" />;
      case 'haldi':
        return <Sun className="w-5 h-5 text-[#E6A100]" />;
      case 'mayra':
        return <HeartHandshake className="w-5 h-5 text-[#C73859]" />;
      case 'varmala':
        return <Flame className="w-5 h-5 text-[#8A1B2D]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#D4AF37]" />;
    }
  };

  const getEventImage = (id: string) => {
    if (wedding.photos && wedding.photos[id]) {
      return wedding.photos[id];
    }
    return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
  };

  const addEventToCalendar = (evt: WeddingEvent) => {
    const title = encodeURIComponent(`${evt.title} - Anuja & Hrishikesh Wedding`);
    const details = encodeURIComponent(`${evt.desc}\nAttire: ${evt.attire}\nVenue: ${evt.venue}`);
    const location = encodeURIComponent(evt.venue);
    // Rough ISO date estimation for quick add
    const isDay1 = evt.day === 'day1';
    const dates = isDay1
      ? '20261120T143000Z/20261120T183000Z'
      : '20261121T050000Z/20261121T160000Z';
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    onToast(`Added ${evt.title} to Google Calendar`);
  };

  return (
    <section id="events" className="py-20 px-4 max-w-6xl mx-auto">
      {/* Section Heading */}
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.25em] text-[#8A1B2D] font-bold">
          Auspicious Celebrations
        </p>
        <h2 className="font-cinzel text-3xl sm:text-4xl text-[#4A0E17] font-bold mt-1">
          Wedding Itinerary & Functions
        </h2>
        <div className="w-24 h-0.5 bg-[#D4AF37] mx-auto my-3" />
        <p className="text-xs sm:text-sm text-gray-600 font-luxury max-w-xl mx-auto">
          We invite you to grace each ceremonial occasion with your heartfelt blessings and delightful presence.
        </p>

        {/* Filter Buttons */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[
            { id: 'all', label: 'All Functions' },
            { id: 'day1', label: 'Day 1 • Nov 20' },
            { id: 'day2', label: 'Day 2 • Nov 21' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterDay(btn.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                filterDay === btn.id
                  ? 'bg-[#681320] text-[#FAF6F0] shadow-md border border-[#D4AF37]'
                  : 'bg-white text-gray-700 hover:bg-[#FAF6F0] border border-gray-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="group bg-white rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            {/* Event Photo Header - Vertical Portrait Framing with Top Face Anchoring */}
            <div className="relative p-2 bg-[#FAF6F0] border-b border-[#D4AF37]/30">
              <div
                onClick={() => setLightboxImage({ url: getEventImage(evt.id), title: evt.title, subtitle: `${evt.date} • ${evt.time}` })}
                className="relative h-64 sm:h-72 w-full overflow-hidden rounded-xl bg-[#2A060C] cursor-pointer group/photo"
                title="Click to view full uncropped ceremony photo"
              >
                <img
                  src={getEventImage(evt.id)}
                  alt={evt.title}
                  className="w-full h-full object-cover object-[center_top] transition-transform duration-700 group-hover/photo:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Full View Button on top-right */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImage({ url: getEventImage(evt.id), title: evt.title, subtitle: `${evt.date} • ${evt.time}` });
                  }}
                  className="absolute top-2.5 right-2.5 z-10 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xs text-[#FFF0A8] text-[10px] font-medium border border-[#D4AF37]/50 flex items-center gap-1 transition-opacity opacity-80 group-hover/photo:opacity-100 cursor-pointer shadow-sm"
                  title="Expand full photo"
                >
                  <Maximize2 className="w-3 h-3 text-[#D4AF37]" />
                  <span>Full View</span>
                </button>

                {/* Bottom title & icon vignette - gently anchored at bottom only */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-white/95 backdrop-blur-sm shadow border border-[#D4AF37]/40 shrink-0">
                      {getEventIcon(evt.id)}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#FFE082] font-semibold drop-shadow">
                        {evt.date}
                      </span>
                      <h3 className="font-cinzel text-white text-base sm:text-lg font-bold leading-tight drop-shadow">
                        {evt.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details Body */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-[#8A1B2D] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Timing: </span>
                    <span>{evt.time}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#8A1B2D] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Venue: </span>
                    <span className="line-clamp-1">{evt.venue}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Shirt className="w-4 h-4 text-[#8A1B2D] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-900">Dress Code: </span>
                    <span className="text-[#8A1B2D] font-medium">{evt.attire}</span>
                  </div>
                </div>

                <p className="text-gray-600 italic pt-1 line-clamp-2">
                  "{evt.desc}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveModalEvent(evt)}
                  className="text-xs text-[#8A1B2D] hover:text-[#520D18] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <button
                  onClick={() => addEventToCalendar(evt)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-[#8A1B2D] hover:bg-[#FAF6F0] transition-colors cursor-pointer"
                  title="Add to Google Calendar"
                  aria-label="Add to Google Calendar"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Event Details Modal */}
      {activeModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#FFFDF9] rounded-2xl max-w-lg w-full overflow-hidden border-2 border-[#D4AF37] shadow-2xl">
            {/* Modal Image - Preserves faces with top anchoring and full-view lightbox support */}
            <div className="relative h-64 sm:h-72 bg-[#2A060C] overflow-hidden group">
              <img
                src={getEventImage(activeModalEvent.id)}
                alt={activeModalEvent.title}
                className="w-full h-full object-cover object-[center_top]"
              />
              <button
                onClick={() => setLightboxImage({ url: getEventImage(activeModalEvent.id), title: activeModalEvent.title, subtitle: `${activeModalEvent.date} • ${activeModalEvent.time}` })}
                className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xs text-[#FFF0A8] text-xs font-medium border border-[#D4AF37]/50 flex items-center gap-1.5 cursor-pointer"
                title="Open uncropped photo"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Full Uncropped Photo</span>
              </button>
              <button
                onClick={() => setActiveModalEvent(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 to-transparent flex items-end p-4">
                <h3 className="font-cinzel text-xl text-white font-bold drop-shadow">
                  {activeModalEvent.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs sm:text-sm text-gray-800">
              <div className="space-y-2 bg-[#FAF6F0] p-4 rounded-xl border border-[#D4AF37]/30">
                <p>
                  <strong className="text-[#8A1B2D]">Date & Time:</strong> {activeModalEvent.date} • {activeModalEvent.time}
                </p>
                <p>
                  <strong className="text-[#8A1B2D]">Location:</strong> {activeModalEvent.venue}
                </p>
                <p>
                  <strong className="text-[#8A1B2D]">Dress Code:</strong> {activeModalEvent.attire}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">About this ceremony</p>
                <p className="text-gray-700 leading-relaxed font-luxury text-sm sm:text-base">
                  {activeModalEvent.desc}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => addEventToCalendar(activeModalEvent)}
                  className="shimmer-btn text-[#4A0E17] font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-full flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Save to Calendar</span>
                </button>
                <button
                  onClick={() => setActiveModalEvent(null)}
                  className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ceremony Photo Lightbox Modal - 100% Uncropped View */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full max-h-[92vh] bg-[#FFFDF9] rounded-2xl border-2 border-[#D4AF37] p-3 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div className="space-y-0.5">
                <span className="font-cinzel text-sm font-bold text-[#4A0E17] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {lightboxImage.title}
                </span>
                {lightboxImage.subtitle && (
                  <p className="text-[11px] text-gray-500">{lightboxImage.subtitle}</p>
                )}
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-full text-gray-500 hover:text-black hover:bg-gray-100 cursor-pointer"
                aria-label="Close photo preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-2 flex items-center justify-center bg-black/10 rounded-xl my-2">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
