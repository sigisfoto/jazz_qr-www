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

    // 3. Validate that 'id' is an integer in the range 1–19
    if (isNaN(id) || id < 1 || id > 19) {
        showFatalError("Eksponatas nerastas. Patikrinkite QR kodą.");
        return;
    }

    const currentExhibit = exhibits.find(ex => ex.id === id);

    // 4. Setup media
    exhibitImage.src = currentExhibit.image;
    exhibitImage.alt = currentExhibit.alt;
    
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

    // 5. Toggle play/pause
    playPauseBtn.addEventListener('click', () => {
        if (playPauseBtn.disabled) return;

        if (isPlaying) {
            audio.pause();
        } else {
            // Require explicit user interaction to initiate playback
            audio.play().catch(e => {
                console.error("Playback failed:", e);
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
    });

    // Update UI on pause
    audio.addEventListener('pause', () => {
        isPlaying = false;
        iconPause.classList.add('hidden');
        iconPlay.classList.remove('hidden');
        playPauseBtn.setAttribute('aria-label', 'Paleisti audio');
    });

    // 6. Bind the 'ended' event
    audio.addEventListener('ended', () => {
        audio.currentTime = 0;
        isPlaying = false;
        iconPause.classList.add('hidden');
        iconPlay.classList.remove('hidden');
        playPauseBtn.setAttribute('aria-label', 'Paleisti audio');
    });
});
