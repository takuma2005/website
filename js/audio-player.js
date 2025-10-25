// ================================
// Custom Audio Player Functionality
// ================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ================================
    // Audio Player Variables
    // ================================
    const audioPlayer = document.getElementById('mainAudioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('duration');
    const volumeBtn = document.getElementById('volumeBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    const nowPlayingTitle = document.getElementById('nowPlayingTitle');
    const sampleItems = document.querySelectorAll('.sample-item');
    const canvas = document.getElementById('waveform');
    
    if (!audioPlayer) return; // Exit if audio player doesn't exist

    // Set initial volume to 20%
    audioPlayer.volume = 0.2;
    audioPlayer.muted = false;

    let isPlaying = false;
    let currentSample = null;
    let audioContext = null;
    let analyser = null;
    let source = null;
    let animationId = null;
    
    // ================================
    // Initialize Audio Context
    // ================================
    function initAudioContext() {
        // Disabled AudioContext to fix audio playback issues
        // The visualizer is optional and audio playback is the priority
        return;

        /*
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
        }
        */
    }
    
    // ================================
    // Waveform Visualization
    // ================================
    function drawWaveform() {
        if (!canvas || !analyser) return;
        
        const ctx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        function draw() {
            animationId = requestAnimationFrame(draw);
            
            analyser.getByteFrequencyData(dataArray);
            
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;
            
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
                
                // Create gradient for bars
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
                gradient.addColorStop(0, '#F3A838');
                gradient.addColorStop(1, '#e09520');
                
                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
                
                x += barWidth;
            }
        }
        
        draw();
    }
    
    function stopWaveform() {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        // Clear canvas
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#f5f5f5';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    // ================================
    // Format Time
    // ================================
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // ================================
    // Update Progress Bar
    // ================================
    function updateProgress() {
        if (audioPlayer && audioPlayer.duration) {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressFill.style.width = `${progress}%`;
            currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        }
    }
    
    // ================================
    // Play/Pause Functionality
    // ================================
    function togglePlayPause() {
        if (!audioPlayer.src) {
            // If no audio is loaded, play the first sample
            const firstSample = sampleItems[0];
            if (firstSample) {
                loadAndPlaySample(firstSample);
            }
            return;
        }
        
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    }
    
    function playAudio() {
        if (audioPlayer.src) {
            // Simple audio playback without AudioContext
            console.log('Playing audio with volume:', audioPlayer.volume, 'muted:', audioPlayer.muted);

            audioPlayer.play().then(() => {
                console.log('Audio started playing successfully');
                isPlaying = true;
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }).catch(e => {
                console.error('Play error:', e);
                alert('音声の再生に失敗しました。ブラウザの設定を確認してください。');
            });
        }
    }
    
    function pauseAudio() {
        audioPlayer.pause();
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        
        // Stop waveform animation
        stopWaveform();
    }
    
    // ================================
    // Load and Play Sample
    // ================================
    function loadAndPlaySample(sampleItem) {
        // Update active state
        sampleItems.forEach(item => {
            item.classList.remove('active');
            const btn = item.querySelector('.sample-play-btn');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-play"></i>';
            }
        });
        
        sampleItem.classList.add('active');
        const sampleBtn = sampleItem.querySelector('.sample-play-btn');
        if (sampleBtn) {
            sampleBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        // Get sample information
        const sampleTitle = sampleItem.querySelector('.sample-title').textContent;
        const sampleSrc = sampleItem.dataset.src || 'assets/audio/sample.mp3'; // Fallback URL
        
        // Update now playing
        nowPlayingTitle.textContent = sampleTitle;
        
        // Load audio
        audioPlayer.src = sampleSrc;
        audioPlayer.volume = 0.2; // Set volume to 20%
        audioPlayer.muted = false; // Ensure not muted
        audioPlayer.load();

        // Play when ready
        audioPlayer.addEventListener('loadeddata', function() {
            playAudio();
            durationDisplay.textContent = formatTime(audioPlayer.duration);
        }, { once: true });

        currentSample = sampleItem;
    }
    
    // ================================
    // Sample Item Click Handlers
    // ================================
    sampleItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Prevent triggering if clicking the play button directly
            if (e.target.closest('.sample-play-btn')) {
                e.preventDefault();
            }
            
            if (this.classList.contains('active') && isPlaying) {
                pauseAudio();
                this.querySelector('.sample-play-btn').innerHTML = '<i class="fas fa-play"></i>';
            } else {
                loadAndPlaySample(this);
            }
        });
        
        const playBtn = item.querySelector('.sample-play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const parent = this.closest('.sample-item');
                
                if (parent.classList.contains('active') && isPlaying) {
                    pauseAudio();
                    this.innerHTML = '<i class="fas fa-play"></i>';
                } else {
                    loadAndPlaySample(parent);
                }
            });
        }
    });
    
    // ================================
    // Progress Bar Click
    // ================================
    if (progressBar) {
        progressBar.addEventListener('click', function(e) {
            if (audioPlayer.duration) {
                const rect = this.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                const newTime = (clickX / width) * audioPlayer.duration;
                audioPlayer.currentTime = newTime;
                updateProgress();
            }
        });
    }
    
    // ================================
    // Volume Control
    // ================================
    if (volumeSlider) {
        // Set initial volume
        audioPlayer.volume = volumeSlider.value / 100;
        
        volumeSlider.addEventListener('input', function() {
            const volume = this.value / 100;
            audioPlayer.volume = volume;
            updateVolumeIcon(volume);
        });
    }
    
    if (volumeBtn) {
        volumeBtn.addEventListener('click', function() {
            if (audioPlayer.muted) {
                audioPlayer.muted = false;
                volumeSlider.value = audioPlayer.volume * 100;
                updateVolumeIcon(audioPlayer.volume);
            } else {
                audioPlayer.muted = true;
                updateVolumeIcon(0);
            }
        });
    }
    
    function updateVolumeIcon(volume) {
        if (!volumeBtn) return;
        
        let icon = 'fa-volume-up';
        if (volume === 0 || audioPlayer.muted) {
            icon = 'fa-volume-mute';
        } else if (volume < 0.5) {
            icon = 'fa-volume-down';
        }
        
        volumeBtn.innerHTML = `<i class="fas ${icon}"></i>`;
    }
    
    // ================================
    // Play/Pause Button Click
    // ================================
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }
    
    // ================================
    // Audio Player Event Listeners
    // ================================
    if (audioPlayer) {
        // Update progress during playback
        audioPlayer.addEventListener('timeupdate', updateProgress);
        
        // Update duration when metadata loads
        audioPlayer.addEventListener('loadedmetadata', function() {
            durationDisplay.textContent = formatTime(audioPlayer.duration);
        });
        
        // Handle audio end
        audioPlayer.addEventListener('ended', function() {
            isPlaying = false;
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            progressFill.style.width = '0%';
            currentTimeDisplay.textContent = '0:00';
            
            // Stop waveform
            stopWaveform();
            
            // Reset active sample button
            if (currentSample) {
                const btn = currentSample.querySelector('.sample-play-btn');
                if (btn) {
                    btn.innerHTML = '<i class="fas fa-play"></i>';
                }
            }
            
            // Auto-play next sample (optional)
            const activeSample = document.querySelector('.sample-item.active');
            if (activeSample) {
                const nextSample = activeSample.nextElementSibling;
                if (nextSample && nextSample.classList.contains('sample-item')) {
                    setTimeout(() => {
                        loadAndPlaySample(nextSample);
                    }, 1000);
                }
            }
        });
        
        // Handle errors
        audioPlayer.addEventListener('error', function(e) {
            console.error('Audio playback error:', e);
            nowPlayingTitle.textContent = 'エラー: オーディオを再生できません';
            isPlaying = false;
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            stopWaveform();
        });
    }
    
    // ================================
    // Keyboard Controls
    // ================================
    document.addEventListener('keydown', function(e) {
        if (!audioPlayer) return;
        
        // Spacebar: Play/Pause
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            togglePlayPause();
        }
        
        // Arrow Left: Rewind 5 seconds
        if (e.code === 'ArrowLeft') {
            audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5);
            updateProgress();
        }
        
        // Arrow Right: Forward 5 seconds
        if (e.code === 'ArrowRight') {
            audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5);
            updateProgress();
        }
        
        // Arrow Up: Volume up
        if (e.code === 'ArrowUp') {
            e.preventDefault();
            const newVolume = Math.min(1, audioPlayer.volume + 0.1);
            audioPlayer.volume = newVolume;
            volumeSlider.value = newVolume * 100;
            updateVolumeIcon(newVolume);
        }
        
        // Arrow Down: Volume down
        if (e.code === 'ArrowDown') {
            e.preventDefault();
            const newVolume = Math.max(0, audioPlayer.volume - 0.1);
            audioPlayer.volume = newVolume;
            volumeSlider.value = newVolume * 100;
            updateVolumeIcon(newVolume);
        }
        
        // M: Mute/Unmute
        if (e.code === 'KeyM') {
            audioPlayer.muted = !audioPlayer.muted;
            updateVolumeIcon(audioPlayer.muted ? 0 : audioPlayer.volume);
        }
    });
    
    // ================================
    // Mobile Touch Support
    // ================================
    let touchStartX = 0;
    let touchStartTime = 0;
    
    if (progressBar) {
        progressBar.addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
            touchStartTime = audioPlayer.currentTime;
        });
        
        progressBar.addEventListener('touchmove', function(e) {
            if (audioPlayer.duration) {
                const touchX = e.touches[0].clientX;
                const deltaX = touchX - touchStartX;
                const rect = this.getBoundingClientRect();
                const width = rect.width;
                const deltaTime = (deltaX / width) * audioPlayer.duration;
                
                audioPlayer.currentTime = Math.max(0, Math.min(audioPlayer.duration, touchStartTime + deltaTime));
                updateProgress();
            }
        });
    }
    
    // ================================
    // Clean up on page unload
    // ================================
    window.addEventListener('beforeunload', function() {
        if (audioPlayer && !audioPlayer.paused) {
            audioPlayer.pause();
        }
        if (audioContext) {
            audioContext.close();
        }
    });
});