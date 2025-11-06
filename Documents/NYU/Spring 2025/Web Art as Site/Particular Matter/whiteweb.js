const canvas = document.getElementById('whiteWebCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Web configuration
const config = {
    center: { x: 0, y: 0 },
    rings: 25,
    spokes: 24,
    maxRadius: 0,
    ripples: [],
    vibrations: [],
    zoom: {
        level: 1,
        target: 1,
        speed: 0.15,
        min: 0.2,
        max: 3
    },
    transition: {
        active: false,
        progress: 0,
        speed: 0.05
    }
};

class StringVibration {
    constructor(ringIndex, spokeIndex, amplitude) {
        this.ringIndex = ringIndex;
        this.spokeIndex = spokeIndex;
        this.amplitude = amplitude;
        this.frequency = 0.2;
        this.time = 0;
        this.decay = 0.97;
        this.life = 1;
    }

    update() {
        this.time += this.frequency;
        this.amplitude *= this.decay;
        this.life *= 0.99;
        return this.life > 0.01;
    }
}

// Initialize web center and size
function initWeb() {
    config.center.x = canvas.width / 2;
    config.center.y = canvas.height / 2;
    config.maxRadius = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2)) / 1.5;
}
initWeb();

// Ripple effect class
class Ripple {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = config.maxRadius * 3;
        this.speed = 1;
        this.opacity = 3;
        this.lineWidth = 2;
    }

    update() {
        this.radius += this.speed;
        this.opacity = 1 - (this.radius / this.maxRadius);
        return this.radius <= this.maxRadius;
    }

    draw() {
        ctx.strokeStyle = `rgba(0, 0, 0, ${this.opacity * 0.5})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Draw the spider web
function drawWeb() {
    // Apply zoom transformation
    ctx.save();
    ctx.translate(config.center.x, config.center.y);
    ctx.scale(config.zoom.level, config.zoom.level);
    ctx.translate(-config.center.x, -config.center.y);

    // Adjust line width based on zoom
    const baseLineWidth = 0.5 / config.zoom.level;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = baseLineWidth;

    // Draw rings
    for (let i = 1; i <= config.rings; i++) {
        const progress = i / config.rings;
        const radius = config.maxRadius * Math.pow(progress, 0.8);
        
        ctx.beginPath();
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.01) {
            let r = radius;
            
            // Apply vibrations to this ring segment
            config.vibrations.forEach(vib => {
                if (vib.ringIndex === i) {
                    const angleIndex = Math.floor(angle / (Math.PI * 2) * config.spokes);
                    if (angleIndex === vib.spokeIndex) {
                        r += Math.sin(vib.time) * vib.amplitude * vib.life;
                    }
                }
            });
            
            const x = config.center.x + Math.cos(angle) * r;
            const y = config.center.y + Math.sin(angle) * r;
            
            if (angle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
    }

    // Draw spokes
    for (let i = 0; i < config.spokes; i++) {
        const angle = (Math.PI * 2 * i) / config.spokes;
        ctx.beginPath();
        ctx.moveTo(config.center.x, config.center.y);
        
        // Apply vibrations to spokes
        let spokeDistortion = 0;
        config.vibrations.forEach(vib => {
            if (vib.spokeIndex === i) {
                spokeDistortion += Math.sin(vib.time) * vib.amplitude * vib.life;
            }
        });
        
        const angleOffset = spokeDistortion * 0.001;
        const endX = config.center.x + Math.cos(angle + angleOffset) * config.maxRadius;
        const endY = config.center.y + Math.sin(angle + angleOffset) * config.maxRadius;
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }

    ctx.restore();
}

// Handle click events
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create ripple at exact click point
    config.ripples.push(new Ripple(x, y));
    
    // Calculate distance and angle from center to click point
    const dx = x - config.center.x;
    const dy = y - config.center.y;
    const clickDistance = Math.sqrt(dx * dx + dy * dy);
    const clickAngle = Math.atan2(dy, dx);
    
    // Convert to positive angle (0 to 2π)
    const positiveAngle = clickAngle < 0 ? clickAngle + 2 * Math.PI : clickAngle;
    
    // Calculate exact ring and spoke indices
    const ringIndex = Math.floor((clickDistance / config.maxRadius) * config.rings);
    const spokeIndex = Math.floor((positiveAngle / (2 * Math.PI)) * config.spokes);
    
    if (ringIndex >= 0 && ringIndex < config.rings) {
        // Create vibration at click point with increased amplitude
        const baseAmplitude = 8;
        config.vibrations.push(new StringVibration(ringIndex, spokeIndex, baseAmplitude));
        
        // Add vibrations to neighboring strings with tighter spread
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const ring = Math.max(0, Math.min(config.rings - 1, ringIndex + i));
                const spoke = (spokeIndex + j + config.spokes) % config.spokes;
                const distance = Math.sqrt(i * i + j * j);
                const amplitude = baseAmplitude / (distance + 1);
                config.vibrations.push(new StringVibration(ring, spoke, amplitude));
            }
        }
    }
});

// Draw the transition effect
function drawTransition() {
    if (config.transition.active) {
        ctx.fillStyle = `rgba(0, 0, 0, ${config.transition.progress})`;
        ctx.beginPath();
        const radius = (config.transition.progress * canvas.width);
        ctx.arc(config.center.x, config.center.y, radius, 0, Math.PI * 2);
        ctx.fill();

        config.transition.progress += config.transition.speed;

        if (config.transition.progress >= 1) {
            window.location.href = 'space.html';
        }
    }
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Smooth zoom transition
    config.zoom.level += (config.zoom.target - config.zoom.level) * config.zoom.speed;
    
    // Draw the base web
    drawWeb();
    
    // Update and draw ripples
    config.ripples = config.ripples.filter(ripple => {
        ripple.draw();
        return ripple.update();
    });
    
    // Update vibrations
    config.vibrations = config.vibrations.filter(vib => vib.update());
    
    // Draw transition effect
    drawTransition();
    
    requestAnimationFrame(animate);
}

// Handle window resize
window.addEventListener('resize', () => {
    resizeCanvas();
    initWeb();
});

// Handle scroll for zoom
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY > 0) { // Scrolling down = zoom in
        config.zoom.target = Math.min(config.zoom.max, config.zoom.target + 0.15);
        
        // Check if we've reached maximum zoom
        if (config.zoom.target >= config.zoom.max * 0.8 && !config.transition.active) {
            config.transition.active = true;
        }
    } else { // Scrolling up = zoom out
        config.zoom.target = Math.max(config.zoom.min, config.zoom.target - 0.15);
        
        // Check if we've reached minimum zoom
        if (config.zoom.target <= config.zoom.min + (config.zoom.max - config.zoom.min) * 0.15 && !config.transition.active) {
            sessionStorage.setItem('returning', 'true');
            window.location.href = 'index.html';
        }
    }
}, { passive: false });

// Start animation
animate(); 