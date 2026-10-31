/* Admin Security & Backend Controls */
const ADMIN_PIN = "1234";

function openInvitation() {
    const modal = document.getElementById('envelopeModal');
    const mainContent = document.getElementById('mainContent');
    
    if (modal && mainContent) {
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.style.display = 'none';
            mainContent.classList.remove('hidden');
            setTimeout(() => {
                mainContent.classList.remove('opacity-0');
            }, 50);
        }, 700);
    }

    // Auto play background music if user consents
    const audio = document.getElementById('weddingBgAudio');
    if (audio) {
        audio.play().catch(e => console.log("Audio autoplay prevented by browser:", e));
    }
    
    // Start falling flower petals
    initPetals();
}

let isPlaying = false;
function toggleAudio() {
    const audio = document.getElementById('weddingBgAudio');
    const icon = document.getElementById('audioIcon');
    if (!audio) return;

    if (audio.paused) {
        audio.play().then(() => {
            isPlaying = true;
            if (icon) icon.className = "fas fa-music text-lg animate-pulse text-gold";
            showToast("Playing Wedding Music 🎵");
        }).catch(() => {
            showToast("Click again to play music");
        });
    } else {
        audio.pause();
        isPlaying = false;
        if (icon) icon.className = "fas fa-volume-mute text-lg text-cream";
        showToast("Music Paused");
    }
}

/* Lightbox Viewer */
function openLightbox(src, caption) {
    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('lightboxImg');
    const cap = document.getElementById('lightboxCaption');
    
    if (img) img.src = src;
    if (cap) cap.innerText = caption || '';
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.remove('opacity-0'), 10);
    }
}

function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

/* Event Details Modal Data */
const eventData = {
    sangeet: {
        title: "Sangeet Ceremony",
        time: "November 20th, 8:00 PM Onwards",
        venue: "Lotus Inn Banquet Hall, Rahatgaon",
        desc: "Get ready for an evening full of musical performances, dance battles, delicious food, and joyous celebrations as the families hit the dance floor!",
        attire: "Glamorous Indian Traditional / Indo-Western"
    },
    binayak: {
        title: "Ghee Binayak Ceremony",
        time: "November 21st, 8:00 AM",
        venue: "Lotus Inn Puja Mandap, Rahatgaon",
        desc: "A holy Ganpati Sthapana and Ghee Binayak Puja to seek divine blessings from Lord Ganesha for auspicious beginnings and a peaceful wedding union.",
        attire: "Traditional Festive Wear"
    },
    haldi: {
        title: "Haldi Ceremony",
        time: "November 21st, 10:30 AM",
        venue: "Lotus Inn Lawns, Rahatgaon",
        desc: "Join us in applying holy turmeric paste to the couple amidst marigold flowers, festive songs, dhol beats, and lots of fun!",
        attire: "Shades of Yellow / Ethnic Wear"
    },
    mayra: {
        title: "Mayra / Bhaat Ceremony",
        time: "November 21st, 3:00 PM",
        venue: "Lotus Inn Courtyard, Rahatgaon",
        desc: "A heartfelt ceremony honoring maternal relatives as they welcome guests with blessings, traditional gifts, and love.",
        attire: "Traditional Royal Attire"
    },
    varmala: {
        title: "Varmala & Phera Ceremony",
        time: "November 21st, 7:30 PM Onwards",
        venue: "Grand Mandap at Lotus Inn, Rahatgaon",
        desc: "The pinnacle wedding moment! The exchange of floral garlands under the regal flower canopy, followed by Seven Sacred Pheras around the holy fire.",
        attire: "Grand Ethnic / Royal Traditional"
    }
};

function openEventModal(key) {
    const data = eventData[key];
    if (!data) return;

    const modal = document.getElementById('eventModal');
    const content = document.getElementById('eventModalContent');

    if (content) {
        content.innerHTML = `
            <div class="text-center pb-2 border-b border-gold/30">
                <span class="text-xs font-bold text-marigold uppercase tracking-wider">Event Details</span>
                <h3 class="font-heading text-2xl text-crimson-dark my-1">${data.title}</h3>
            </div>
            <div class="space-y-3 text-sm text-gray-700">
                <p><strong class="text-crimson"><i class="far fa-clock mr-2"></i>Date & Time:</strong> ${data.time}</p>
                <p><strong class="text-crimson"><i class="fas fa-map-marker-alt mr-2"></i>Venue:</strong> ${data.venue}</p>
                <p><strong class="text-crimson"><i class="fas fa-tshirt mr-2"></i>Suggested Dress Code:</strong> ${data.attire}</p>
                <p class="text-gray-600 italic bg-gold/10 p-3 rounded-xl border border-gold/30">${data.desc}</p>
            </div>
        `;
    }

    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.remove('opacity-0'), 10);
    }
}

function closeEventModal() {
    const modal = document.getElementById('eventModal');
    if (modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

/* Filter Events by Date */
function filterEvents(day, evt) {
    const cards = document.querySelectorAll('.event-card');
    const buttons = document.querySelectorAll('.event-filter-btn');

    buttons.forEach(btn => {
        btn.className = "event-filter-btn bg-white text-crimson border border-gold/40 px-5 py-2 rounded-full font-subheading text-sm hover:bg-crimson hover:text-gold transition";
    });

    if (evt && evt.target) {
        evt.target.className = "event-filter-btn active bg-crimson text-gold border border-gold px-5 py-2 rounded-full font-subheading text-sm transition shadow-md";
    }

    cards.forEach(card => {
        if (day === 'all' || card.dataset.day === day) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

/* Copy Venue Address */
function copyVenueAddress() {
    const addressText = "Lotus Inn, Ring Rd, near Govind Prabhu Temple, Rahatgaon, Amravati, Maharashtra 444603";
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = addressText;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    showToast("Address copied to clipboard!");
}

/* Toast Notification System */
function showToast(msg) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    if (!toast || !toastMsg) return;

    toastMsg.innerText = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

/* Countdown Timer Logic */
const weddingDate = new Date("November 21, 2026 19:30:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    const daysEl = document.getElementById("timer-days");
    const hoursEl = document.getElementById("timer-hours");
    const minsEl = document.getElementById("timer-minutes");
    const secsEl = document.getElementById("timer-seconds");

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    if (distance < 0) {
        daysEl.innerText = "00";
        hoursEl.innerText = "00";
        minsEl.innerText = "00";
        secsEl.innerText = "00";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.innerText = days < 10 ? "0" + days : days;
    hoursEl.innerText = hours < 10 ? "0" + hours : hours;
    minsEl.innerText = minutes < 10 ? "0" + minutes : minutes;
    secsEl.innerText = seconds < 10 ? "0" + seconds : seconds;
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* Canvas Falling Rose Petals Effect */
function initPetals() {
    const canvas = document.getElementById('petal-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const petals = [];
    const petalColors = ['#e63946', '#ffb703', '#d4af37', '#e01e37'];

    for (let i = 0; i < 35; i++) {
        petals.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 8 + 6,
            speedY: Math.random() * 1.5 + 0.8,
            speedX: Math.random() * 1 - 0.5,
            color: petalColors[Math.floor(Math.random() * petalColors.length)],
            angle: Math.random() * 360,
            spin: Math.random() * 2 - 1
        });
    }

    function drawPetals() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        petals.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.angle * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            p.y += p.speedY;
            p.x += p.speedX;
            p.angle += p.spin;

            if (p.y > canvas.height) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }
        });

        requestAnimationFrame(drawPetals);
    }

    drawPetals();
}

/* Admin Security & Backend Controls */
function openAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.remove('opacity-0'), 10);
    }
}

function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

function authenticateAdmin() {
    const input = document.getElementById('adminPassInput');
    const pin = input ? input.value : "";
    if (pin === ADMIN_PIN) {
        document.getElementById('adminAuthGate')?.classList.add('hidden');
        document.getElementById('adminContent')?.classList.remove('hidden');
        loadAdminFormValues();
        showToast("Backend unlocked successfully");
    } else {
        showToast("Invalid Admin Security PIN!");
    }
}

function loadAdminFormValues() {
    const savedAudio = localStorage.getItem('wedding_bg_audio');
    const audioInput = document.getElementById('adminAudioUrl');
    if (savedAudio && !savedAudio.startsWith('data:audio') && audioInput) {
        audioInput.value = savedAudio;
    }
}

// Enhanced Audio & Image persistence handler for Netlify deployments
function uploadAdminAudio(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            localStorage.setItem('wedding_bg_audio', evt.target.result);
            updateAudioSource(evt.target.result);
            showToast("New wedding audio loaded & saved!");
        };
        reader.readAsDataURL(file);
    }
}

function uploadAdminPhoto(key, e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            localStorage.setItem('wedding_photo_' + key, evt.target.result);
            applySavedPhotos();
            showToast(`Updated ${key} photo!`);
        };
        reader.readAsDataURL(file);
    }
}

function saveAdminSettings() {
    const audioUrl = document.getElementById('adminAudioUrl')?.value;
    if (audioUrl) {
        localStorage.setItem('wedding_bg_audio', audioUrl);
        updateAudioSource(audioUrl);
    }
    showToast("Backend configuration saved!");
    closeAdminModal();
}

function resetAdminDefaults() {
    localStorage.clear();
    location.reload();
}

function updateAudioSource(src) {
    const audio = document.getElementById('weddingBgAudio');
    const source = document.getElementById('audioSource');
    if (source && audio) {
        source.src = src;
        audio.load();
    }
}

function applySavedPhotos() {
    const keys = ['hero', 'sangeet', 'binayak', 'haldi', 'mayra', 'varmala'];
    keys.forEach(k => {
        const savedImg = localStorage.getItem('wedding_photo_' + k);
        if (savedImg) {
            const imgEl = document.getElementById('img_' + k);
            if (imgEl) imgEl.src = savedImg;
        }
    });

    const savedAudio = localStorage.getItem('wedding_bg_audio');
    if (savedAudio) updateAudioSource(savedAudio);
}

// Apply saved photos on page load
window.addEventListener('DOMContentLoaded', applySavedPhotos);

// Secret URL Hash Trigger (e.g. yourwebsite.com/#admin)
if (window.location.hash === '#admin') {
    openAdminModal();
}

// Bind all functions to global window object to prevent HTML inline onclick ReferenceErrors
window.openInvitation = openInvitation;
window.toggleAudio = toggleAudio;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.openEventModal = openEventModal;
window.closeEventModal = closeEventModal;
window.filterEvents = filterEvents;
window.copyVenueAddress = copyVenueAddress;
window.showToast = showToast;
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.authenticateAdmin = authenticateAdmin;
window.saveAdminSettings = saveAdminSettings;
window.resetAdminDefaults = resetAdminDefaults;
window.uploadAdminAudio = uploadAdminAudio;
window.uploadAdminPhoto = uploadAdminPhoto;