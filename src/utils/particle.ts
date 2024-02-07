type Vector = {
    x: number,
    y: number
};

export function launchParticle(element: HTMLElement, from: Vector, velocity: Vector, lifetime: number) {
    const particle = {
        x: from.x,
        y: from.y,
        startTime: performance.now()
    };
    
    element.style.left = `${particle.x}px`;
    element.style.top = `${particle.y}px`;
    element.style.position = "absolute";
    element.style.zIndex = "999";
    document.body.appendChild(element);

    const updateParticle = (timestamp: DOMHighResTimeStamp) => {
        element.style.left = `${particle.x}px`;
        element.style.top = `${particle.y}px`;
        
        if((timestamp - particle.startTime) <= lifetime) {
            requestAnimationFrame(time => {
                particle.x += velocity.x;
                particle.y += velocity.y;
                
                updateParticle(time);
            });
        }
        else {
            element.remove();
        }
    };
    
    requestAnimationFrame(updateParticle);
}