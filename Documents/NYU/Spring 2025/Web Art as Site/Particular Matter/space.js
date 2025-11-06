const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Configuration
const totalImages = 15;
let clickCount = 0;
const images = [];
let zoomLevel = 1;
const ZOOM_SPEED = 0.1;
const MIN_ZOOM = 0.2;

// Log initial state - check if this appears
console.log("Script initialized. Click count:", clickCount);

// Create image
function createImage(index) {
    // Create image element
    const img = document.createElement('img');
    img.src = `Assets/${index}.jpg`;
    img.classList.add('collage-image');

    // Random positioning with padding from screen edges
    const padding = 100;
    const x = Math.random() * (window.innerWidth - padding * 2) + padding;
    const y = Math.random() * (window.innerHeight - padding * 2) + padding;
    const rotation = Math.random() * 50 - 25;
    const scale = 0.8 + Math.random() * 0.4;

    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    img.style.transform = `rotate(${rotation}deg) scale(${scale})`;

    document.body.appendChild(img);
    images.push(img);

    setTimeout(() => {
        img.classList.add('visible');
    }, 15);

    console.log(`Created image ${index} of ${totalImages}`);
}

// Handle zoom out transition
function handleZoomOut() {
    if (zoomLevel <= MIN_ZOOM) {
        document.querySelector('.animated-container').classList.add('zoom-out');
        // Remove all images before transitioning
        images.forEach(img => {
            img.style.transition = 'opacity 0.5s ease-out';
            img.style.opacity = '0';
        });
        setTimeout(() => {
            window.location.href = 'whiteweb.html';
        }, 900);
    }
}

// Use a named function so we can verify it's being added properly
function handleClick(e) {
    console.log("Click detected at", e.clientX, e.clientY);
    
    clickCount++;
    console.log(`Click number: ${clickCount} / Total: ${totalImages}`);
    
    if (clickCount < totalImages) {
        createImage(clickCount);
    }
    
    if (clickCount === totalImages) {
        console.log('All images displayed, redirecting to slow.html now');
        
        try {
            // Try multiple redirection methods
            window.location.href = 'slow.html';
            
            // Fallback methods
            setTimeout(() => {
                console.log("Trying fallback redirect");
                window.location = 'slow.html';
            }, 500);
        } catch (err) {
            console.error("Error during redirect:", err);
            window.location.href = 'slow.html'; // Try one more time
        }
    }
}

// // Remove previous event listeners to avoid duplicate clicks
document.removeEventListener('click', handleClick);
document.body.removeEventListener('click', handleClick);
canvas.removeEventListener('click', handleClick);

// Get the animated-container element and attach the click handler
const animatedContainer = document.querySelector('.animated-container');
if (animatedContainer) {
    animatedContainer.addEventListener('click', handleClick);
    console.log("Click handler attached to animated-container");
} else {
    console.error("Could not find animated-container element!");
    // Fallback to document if container not found
    document.addEventListener('click', handleClick);
    console.log("Fallback: Click handler attached to document");
}

// Handle scroll for zoom
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    
    if (e.deltaY < 0) { // Scrolling up = zoom out
        zoomLevel -= ZOOM_SPEED;
        handleZoomOut();
    }
}, { passive: false });
