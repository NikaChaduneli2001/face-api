# Emotion Detection Web App

A web application that uses your webcam to detect facial expressions and analyze anger levels.

## Features

- Real-time webcam access
- Face detection
- Emotion analysis (particularly focused on detecting anger)
- Visual feedback (face box, emotion text, anger meter)
- Background color changes based on anger level

## Technologies Used

- HTML, CSS, JavaScript
- [face-api.js](https://github.com/justadudewhohacks/face-api.js) - JavaScript API for face detection and recognition

## How to Use

1. Clone or download this repository
2. Because of browser security restrictions, you need to run this on a local server
   
   You can use any of these methods:
   - Python simple server: `python -m http.server` (Python 3) or `python -m SimpleHTTPServer` (Python 2)
   - Use Live Server extension if you're using Visual Studio Code
   - Any other local development server (Node.js, etc.)

3. Open the app in your browser (usually at http://localhost:8000 or similar)
4. Allow webcam access when prompted
5. Wait for the models to load (this may take a few seconds)
6. The app will start detecting faces and emotions automatically

## Important Notes

- The application needs camera access to work
- For best results, ensure good lighting conditions
- The anger threshold is set to 0.5 (50%) by default, you can adjust this in the script.js file

## Privacy

This app processes all data locally in your browser. No images or detection results are sent to any server.

## Limitations

- Face detection accuracy depends on lighting conditions and camera quality
- The emotion detection is based on visual cues and may not always accurately reflect actual emotions
- Performance may vary depending on your device's capabilities 