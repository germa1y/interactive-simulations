// Run this in DevTools console to refresh tooltips
if (typeof MusicController !== 'undefined' && MusicController.refreshTooltip) { 
  MusicController.refreshTooltip(); 
  console.log('Music Controller tooltip refreshed.');
}

// Also refresh slider tooltips if available
if (typeof SliderTooltip !== 'undefined' && SliderTooltip.refreshTooltip) {
  SliderTooltip.refreshTooltip();
  console.log('Slider and toggle tooltips refreshed.');
}

// Add this to the swipe detection code
function handleSwipe() {
  // Existing swipe handling code...
  
  // Add explicit AudioContext resume on iOS
  if (typeof AudioManager !== 'undefined') {
    // First force the AudioContext to resume
    AudioManager.resumeAudioContext();
    
    // Add a small delay before trying to play audio to ensure context is resumed
    setTimeout(() => {
      // Try again to resume context right before playing
      AudioManager.resumeAudioContext();
      
      // Now try to play the audio
      if (typeof DemoAudio !== 'undefined') {
        DemoAudio.playSlides().catch(err => {
          console.error('Failed to play slides after swipe:', err);
          // Try again with a fallback method
          AudioManager.playNextInPlaylist();
        });
      }
    }, 300); // Short delay to ensure context is fully resumed
  }
} 