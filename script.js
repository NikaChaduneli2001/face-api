// DOM elements
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const statusText = document.getElementById('status');
const emotionText = document.getElementById('emotion');
const angerBar = document.getElementById('anger-bar');
const angerValue = document.getElementById('anger-value');
const angerSound = document.getElementById('anger-sound');
const enableSoundBtn = document.getElementById('enable-sound');
const soundStatus = document.getElementById('sound-status');

// Canvas context for drawing
const ctx = overlay.getContext('2d');

// Detection options
const minConfidence = 0.5;
const ANGER_THRESHOLD = 0.5; // Threshold to consider someone as angry

// State tracking
let wasAngryBefore = false;
let angerSoundTimeout = null;
let soundEnabled = false;

// Check if face-api is available
function checkFaceApiLoaded() {
    return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
            if (window.faceapi) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
    });
}

// Initialize sound controls
function initSoundControls() {
    enableSoundBtn.addEventListener('click', () => {
        // Play a silent sound first to initialize audio context
        angerSound.volume = 1;
         // Update UI
         soundEnabled = !soundEnabled;
         if (soundEnabled) {
            enableSoundBtn.classList.add('enabled');
            enableSoundBtn.textContent = 'Disable Sound';
            soundStatus.textContent = 'Sound: Enabled';
        } else {
            enableSoundBtn.classList.remove('enabled');
            enableSoundBtn.textContent = 'Enable Sound';
            soundStatus.textContent = 'Sound: Disabled';
        }
    });
}

// Play the anger sound with cooldown to prevent constant triggering
function playAngerSound() {
    // Only play if sound is enabled and not recently played
    if (soundEnabled && !angerSoundTimeout) {
        // Create a new instance to ensure it plays
        angerSound.currentTime = 0;
        angerSound.play().catch(err => console.error("Error playing sound:", err));
        
        // Set cooldown (3 seconds)
        angerSoundTimeout = setTimeout(() => {
            angerSoundTimeout = null;
        }, 3000);
    }
}

// Load models and start video
async function init() {
    try {
        statusText.innerText = 'Waiting for face-api to load...';
        
        // Initialize sound controls
        initSoundControls();
        
        // Ensure face-api is loaded
        await checkFaceApiLoaded();
        
        statusText.innerText = 'Loading face-api models...';
        
        // Set model path
        const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
        
        // Load models from CDN
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        
        statusText.innerText = 'Models loaded. Starting video...';
        
        // Start webcam
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 720, height: 560 }
        });
        video.srcObject = stream;
        
        // Wait for video to be ready
        video.addEventListener('play', () => {
            statusText.innerText = 'Ready! Analyzing emotions...';
            // Start detection loop
            setInterval(detectEmotions, 100);
        });
    } catch (error) {
        console.error('Error:', error);
        statusText.innerText = `Error: ${error.message}`;
    }
}

// Detect faces and emotions
async function detectEmotions() {
    // Detect faces with expressions
    const detections = await faceapi.detectAllFaces(
        video, 
        new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: minConfidence })
    ).withFaceExpressions();
    
    // Clear previous drawings
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    
    // If faces detected
    if (detections && detections.length > 0) {
        // Get the first face detected (closest/largest)
        const face = detections[0];
        const expressions = face.expressions;
        
        // Get anger level
        const angerLevel = expressions.angry;
        
        // Convert to percentage
        const angerPercentage = Math.round(angerLevel * 100);
        
        // Update UI elements
        angerBar.style.width = `${angerPercentage}%`;
        angerValue.innerText = `${angerPercentage}%`;
        
        // Determine dominant emotion
        let dominantEmotion = '';
        let highestScore = 0;
        
        Object.entries(expressions).forEach(([emotion, score]) => {
            if (score > highestScore) {
                highestScore = score;
                dominantEmotion = emotion;
            }
        });
        
        // Display dominant emotion
        emotionText.innerText = dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1);
        
        // Check if user is angry
        const isAngry = angerLevel > ANGER_THRESHOLD;
        
        // Play sound when anger is first detected
        if (isAngry && !wasAngryBefore) {
            playAngerSound();
        }
        
        // Update state
        wasAngryBefore = isAngry;
        
        // Change color based on anger level
        if (isAngry) {
            emotionText.style.color = '#e74c3c'; // Red for angry
            document.body.style.backgroundColor = '#ffebee'; // Light red background
        } else {
            emotionText.style.color = '#2ecc71'; // Green for not angry
            document.body.style.backgroundColor = '#f5f5f5'; // Default background
        }
        
        // Draw face box
        const box = face.detection.box;
        ctx.strokeStyle = isAngry ? '#e74c3c' : '#2ecc71';
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        // Display anger level above the box (with mirrored text)
        ctx.save();
        ctx.scale(-1, 1); // Mirror the text
        ctx.fillStyle = isAngry ? '#e74c3c' : '#2ecc71';
        ctx.font = '16px Arial';
        ctx.fillText(
            `Anger: ${angerPercentage}%`, 
            -box.x - box.width, // Adjust for mirroring
            box.y > 20 ? box.y - 10 : box.y + box.height + 20
        );
        ctx.restore();
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', init); 