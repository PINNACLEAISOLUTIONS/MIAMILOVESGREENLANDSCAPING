/**
 * Video Quality Enhancer
 * This script applies real-time enhancements to video elements
 */
document.addEventListener('DOMContentLoaded', function () {
    // Find the hero video
    const heroVideo = document.getElementById('main-video');

    if (heroVideo && !heroVideo.hasAttribute('data-skip-enhancement')) {
        // Wait for the video to load metadata
        heroVideo.addEventListener('loadedmetadata', function () {
            console.log('Video loaded, applying enhancements...');
            enhanceVideo(heroVideo);
        });
    } else if (heroVideo) {
        console.log('Video enhancement skipped due to data-skip-enhancement attribute');
        // Make sure video is visible and plays
        heroVideo.style.display = 'block';
        heroVideo.play().catch(err => {
            console.error('Error playing video:', err);
        });
    }
});

/**
 * Enhances video quality using canvas processing
 * @param {HTMLVideoElement} videoElement - The video element to enhance
 */
function enhanceVideo(videoElement) {
    // Create canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Style the canvas to match the video
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.objectFit = 'cover';
    canvas.style.zIndex = '-1';

    // Insert canvas before the video
    videoElement.parentNode.insertBefore(canvas, videoElement);

    // Hide the original video
    videoElement.style.display = 'none';

    // Process video frames
    function processFrame() {
        // Draw the current frame to the canvas
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Get image data for processing
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply enhancements
        for (let i = 0; i < data.length; i += 4) {
            // Increase brightness and contrast
            data[i] = Math.min(255, data[i] * 1.15);     // Red
            data[i + 1] = Math.min(255, data[i + 1] * 1.2);  // Green
            data[i + 2] = Math.min(255, data[i + 2] * 1.1);  // Blue

            // Sharpen by increasing contrast between adjacent pixels
            if (i % (canvas.width * 4) > 4 && i % (canvas.width * 4) < canvas.width * 4 - 4) {
                const prevPixel = data[i - 4];
                const nextPixel = data[i + 4];
                if (Math.abs(data[i] - prevPixel) > 10 || Math.abs(data[i] - nextPixel) > 10) {
                    data[i] = Math.min(255, data[i] * 1.1);
                }
            }
        }

        // Put the processed image data back
        ctx.putImageData(imageData, 0, 0);

        // Request the next frame
        if (!videoElement.paused && !videoElement.ended) {
            requestAnimationFrame(processFrame);
        }
    }

    // Start processing when video plays
    videoElement.addEventListener('play', function () {
        processFrame();
    });

    // Make sure video plays
    if (videoElement.paused) {
        videoElement.play().catch(err => {
            console.error('Error playing video:', err);
            // If autoplay fails, show the original video
            videoElement.style.display = '';
            canvas.remove();
        });
    }
}