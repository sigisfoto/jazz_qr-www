document.addEventListener('DOMContentLoaded', () => {
    const errorMessage = document.getElementById('error-message');
    const mediaContainer = document.getElementById('media-container');
    const exhibitImage = document.getElementById('exhibit-image');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const iconPlay = document.getElementById('icon-play');
    const iconPause = document.getElementById('icon-pause');
    const audioErrorMessage = document.getElementById('audio-error-message');

    // 1. Declare 'exhibits' data array (1 to 19) pagal specifikaciją
    const exhibits = [
        { id: 1, image: "images/1.webp", audio: "audio/1.mp3", alt: "Baby Trio - Vangelis Kotzabassis (2008)" },
        { id: 2, image: "images/2.webp", audio: "audio/2.mp3", alt: "Yuri Honing Acoustic Quartet - Mats Eilertsen (2009)" },
        { id: 3, image: "images/3.webp", audio: "audio/3.mp3", alt: "Jaribu Shahid (2008)" },
        { id: 4, image: "images/4.webp", audio: "audio/4.mp3", alt: "Jef Neve - Piet Verbist (2009)" },
        { id: 5, image: "images/5.webp", audio: "audio/5.mp3", alt: "Joe Williamson (2011)" },
        { id: 6, image: "images/6.webp", audio: "audio/6.mp3", alt: "Labutis (2009)" },
        { id: 7, image: "images/7.webp", audio: "audio/7.mp3", alt: "Labutis 2 (2009)" },
        { id: 8, image: "images/8.webp", audio: "audio/8.mp3", alt: "Muneer B. Fennell (2010)" },
        { id: 9, image: "images/9.webp", audio: "audio/9.mp3", alt: "Norbert Stein (2009)" },
        { id: 10, image: "images/10.webp", audio: "audio/10.mp3", alt: "Sebastian Gramss (2011)" },
        { id: 11, image: "images/11.webp", audio: "audio/11.mp3", alt: "Ąžuoliniai berželiai" },
        { id: 12, image: "images/12.webp", audio: "audio/12.mp3", alt: "Charles Gayle (2008)" },
        { id: 13, image: "images/13.webp", audio: "audio/13.mp3", alt: "Charles Gayle Trio (2008)" },
        { id: 14, image: "images/14.webp", audio: "audio/14.mp3", alt: "Chih-Ling Chen (2010)" },
        { id: 15, image: "images/15.webp", audio: "audio/15.mp3", alt: "Filipe Raposo (2010)" },
        { id: 16, image: "images/16.webp", audio: "audio/16.mp3", alt: "Hilliard Greene (2008)" },
        { id: 17, image: "images/17.webp", audio: "audio/17.mp3", alt: "Baltic jazz trio - Toivo Untas (2008)" },
        { id: 18, image: "images/18.webp", audio: "audio/18.mp3", alt: "Baltic jazz trio - Toivo Untas 3 (2008)" },
        { id: 19, image: "images/19.webp", audio: "audio/19.mp3", alt: "Lafayette Gilchrist (2008)" }
    ];

    // Pagrindinė klaida (kai neteisingas QR kodo ID arba nerasta nuotrauka)
    const showFatalError = (message) => {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        mediaContainer.classList.add('hidden');
    };

    // Tik garso klaida (eksponato nuotrauka lieka matoma ekrane!)
    const showAudioError = (message) => {
        if (audioErrorMessage) {
            audioErrorMessage.textContent = message;
            audioErrorMessage.classList.remove('hidden');
        }
        playPauseBtn.disabled = true;
        playPauseBtn.setAttribute('aria-disabled', 'true');
    };

    // 2. Parse the URL query parameter 'id'
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    const id = parseInt(idParam, 10);

    // 3. Validate that 'id' is a valid positive integer
    if (isNaN(id) || id < 1) {
        showFatalError("Eksponatas nerastas. Patikrinkite QR kodą.");
        return;
    }

    // Randame eksponatą masyve arba dinamiškai sukuriame pagal ID (nereikia perprogramuoti didinant skaičių!)
    const currentExhibit = exhibits.find(ex => ex.id === id) || {
        id: id,
        image: `images/${id}.webp`,
        audio: `audio/${id}.mp3`,
        alt: `Muzikanto portretas ${id}`
    };

    // 4. Setup media
    exhibitImage.src = currentExhibit.image;
    exhibitImage.alt = currentExhibit.alt;
    const pageTitle = `${currentExhibit.id}. ${currentExhibit.alt}`;
    const basePath = window.location.pathname.endsWith('/') ? window.location.pathname : window.location.pathname + '/';
    const pagePath = `${basePath}foto-${currentExhibit.id}`;
    document.title = `${pageTitle} | Vilnius Jazz`;

    // Google Analytics (GA4) peržiūros įvykiai su konkrečiu muzikantu ir keliu
    if (typeof gtag === 'function') {
        gtag('event', 'page_view', {
            page_title: pageTitle,
            page_location: window.location.href,
            page_path: pagePath
        });

        gtag('event', 'exhibit_view', {
            exhibit_id: currentExhibit.id,
            exhibit_name: currentExhibit.alt,
            page_title: pageTitle,
            page_path: pagePath
        });
    }
    
    // Check if image loads properly
    exhibitImage.onerror = () => {
        showFatalError("Nepavyko užkrauti eksponato nuotraukos.");
    };

    // Show media container if validation passed
    mediaContainer.classList.remove('hidden');

    const audio = new Audio(currentExhibit.audio);
    
    // Handle audio load error - NUOTRAUKA NEBEPASLEPIAMA!
    audio.onerror = () => {
        showAudioError("Garso įrašas šiam eksponatui nepasiekiamas.");
    };

    let isPlaying = false;

    // ==========================================
    // 5. Fullscreen valdymas ir "X" mygtukas
    // ==========================================
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const iconFsEnter = document.getElementById('icon-fs-enter');
    const iconFsExit = document.getElementById('icon-fs-exit');

    // Nustatome, ar įrenginys palaiko tikrą Fullscreen API (iPhone Safari nepalaiko)
    const isIPhone = /iPhone|iPod/i.test(navigator.userAgent);
    const supportsFullscreen = !isIPhone && !!(
        document.fullscreenEnabled || 
        document.documentElement.requestFullscreen || 
        document.documentElement.webkitRequestFullscreen || 
        document.documentElement.mozRequestFullScreen || 
        document.documentElement.msRequestFullscreen
    );

    // Jei įrenginys nepalaiko (pvz. iPhone), mygtuką visiškai paslepiame, kad neklaidintų parodos lankytojų
    if (!supportsFullscreen && fullscreenBtn) {
        fullscreenBtn.classList.add('hidden');
    }

    const isFullscreen = () => {
        return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    };

    const updateFullscreenUI = () => {
        if (!supportsFullscreen) return;
        if (isFullscreen()) {
            iconFsEnter.classList.add('hidden');
            iconFsExit.classList.remove('hidden');
            fullscreenBtn.setAttribute('aria-label', 'Išeiti iš viso ekrano');
        } else {
            iconFsExit.classList.add('hidden');
            iconFsEnter.classList.remove('hidden');
            fullscreenBtn.setAttribute('aria-label', 'Visas ekranas');
        }
    };

    const enterFullscreen = () => {
        const docEl = document.documentElement;
        const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;

        if (req) {
            try {
                const res = req.call(docEl);
                if (res && res.then) {
                    res.then(() => {
                        updateFullscreenUI();
                    }).catch(() => {});
                } else {
                    setTimeout(updateFullscreenUI, 100);
                }
            } catch (e) {}
        }
        
        // Postūmis Safari naršyklei, kad sutrauktų URL juostą
        setTimeout(() => {
            window.scrollTo(0, 1);
        }, 100);
    };

    const exitFullscreen = () => {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exit) {
            try {
                const res = exit.call(document);
                if (res && res.then) {
                    res.then(() => {
                        updateFullscreenUI();
                    }).catch(() => {});
                } else {
                    setTimeout(updateFullscreenUI, 100);
                }
            } catch (e) {}
        }
    };

    fullscreenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isFullscreen()) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    });

    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
        document.addEventListener(evt, updateFullscreenUI);
    });

    // Orientacijos keitimo palaikymas Safari naršyklei (ypač gulsčiam režimui)
    const handleOrientationChange = () => {
        setTimeout(() => {
            window.scrollTo(0, 1);
        }, 200);
    };
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    // Automatiškai bandome įjungti fullscreen ir wake lock po pirmo vartotojo paspaudimo bet kur ekrane
    let hasAttemptedAutoFullscreen = false;
    const handleFirstUserGesture = (e) => {
        // Paprašome ekrano neužmigdymo
        requestWakeLock();

        if (!hasAttemptedAutoFullscreen) {
            if (e.target.closest('#fullscreen-btn')) return; // Jei spaudė tiesiai ant valdymo mygtuko
            hasAttemptedAutoFullscreen = true;
            if (!isFullscreen()) {
                enterFullscreen();
            }
        }
    };

    document.body.addEventListener('click', handleFirstUserGesture);
    document.body.addEventListener('touchend', handleFirstUserGesture, { passive: true });

    // ==========================================
    // 6. Screen Wake Lock API (kad telefonas neužgestų)
    // ==========================================
    let wakeLock = null;

    const requestWakeLock = async () => {
        if ('wakeLock' in navigator) {
            try {
                if (wakeLock === null) {
                    wakeLock = await navigator.wakeLock.request('screen');
                    wakeLock.addEventListener('release', () => {
                        wakeLock = null;
                    });
                }
            } catch (err) {
                console.log('Wake Lock info:', err);
            }
        }
    };

    const releaseWakeLock = async () => {
        if (wakeLock !== null) {
            try {
                await wakeLock.release();
                wakeLock = null;
            } catch (err) {
                // ignore
            }
        }
    };

    // Kai vartotojas sugrįžta į naršyklės skirtuką, atnaujiname Wake Lock
    document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible') {
            await requestWakeLock();
        } else {
            await releaseWakeLock();
        }
    });

    // ==========================================
    // 7. Toggle play/pause ir audio valdymas
    // ==========================================
    playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (playPauseBtn.disabled) return;

        // Taip pat užtikriname fullscreen ir wakelock
        if (!isFullscreen()) {
            enterFullscreen();
        }
        requestWakeLock();

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play().catch(err => {
                console.error("Playback failed:", err);
                showAudioError("Nepavyko paleisti audio. Patikrinkite naršyklės nustatymus.");
            });
        }
    });

    // Update UI on play
    audio.addEventListener('play', () => {
        isPlaying = true;
        iconPlay.classList.add('hidden');
        iconPause.classList.remove('hidden');
        playPauseBtn.setAttribute('aria-label', 'Sustabdyti audio');
        requestWakeLock();

        // Google Analytics grojimo įvykis
        if (typeof gtag === 'function') {
            gtag('event', 'audio_play', {
                exhibit_id: currentExhibit.id,
                exhibit_name: currentExhibit.alt
            });
        }
    });

    // Update UI on pause
    audio.addEventListener('pause', () => {
        isPlaying = false;
        iconPause.classList.add('hidden');
        iconPlay.classList.remove('hidden');
        playPauseBtn.setAttribute('aria-label', 'Paleisti audio');
    });

    // 8. Bind the 'ended' event
    audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        isPlaying = false;
        iconPause.classList.add('hidden');
        iconPlay.classList.remove('hidden');
        playPauseBtn.setAttribute('aria-label', 'Paleisti audio');

        // Google Analytics perklausos pabaigos įvykis
        if (typeof gtag === 'function') {
            gtag('event', 'audio_completed', {
                exhibit_id: currentExhibit.id,
                exhibit_name: currentExhibit.alt
            });
        }
    });
});
