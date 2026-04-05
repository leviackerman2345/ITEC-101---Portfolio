
// Scroll Stack Project Section
function initScrollStack() {
    const cards = document.querySelectorAll('.scroll-stack-card');
    const stackContainer = document.querySelector('.scroll-stack-container');
    const endElement = document.querySelector('.scroll-stack-end');
    
    if (!cards.length || !stackContainer) return;

    const itemStackDistance = 40; // Distance between stacked cards
    const stackPositionPercent = 0.25; // 25% from top
    const scaleEndPositionPercent = 0.10; // 10% from top
    const blurAmount = 4; // px

    // Cache initial positions
    let cardPositions = [];
    let containerTop = 0;

    function updatePositions() {
        const rect = stackContainer.getBoundingClientRect();
        const scrollTop = window.scrollY;
        containerTop = rect.top + scrollTop;
        
        cardPositions = Array.from(cards).map(card => {
            return card.offsetTop + containerTop;
        });
    }

    // Initial calculation
    updatePositions();
    window.addEventListener('resize', updatePositions);

    function onScroll() {
        const scrollTop = window.scrollY;
        const containerHeight = window.innerHeight;
        
        const stackPositionPx = containerHeight * stackPositionPercent;
        const scaleEndPositionPx = containerHeight * scaleEndPositionPercent;
        
        // End element position
        const endElementTop = endElement ? (endElement.getBoundingClientRect().top + scrollTop) : (containerTop + stackContainer.offsetHeight);
        // We want the pinning to stop when the bottom of the stack container is reached
        // or when the "end" element is reached.
        const pinEnd = endElementTop - containerHeight * 0.8; 

        cards.forEach((card, i) => {
            const cardTop = cardPositions[i];
            
            // When does the card start pinning?
            // When it reaches stackPositionPx from top of viewport.
            // scrollTop + stackPositionPx = cardTop
            // So triggerStart = cardTop - stackPositionPx
            // But we also offset each card by itemStackDistance
            const triggerStart = cardTop - stackPositionPx - (itemStackDistance * i);
            const triggerEnd = cardTop - scaleEndPositionPx;
            
            // Calculate progress for scaling
            let scaleProgress = 0;
            if (scrollTop > triggerStart) {
                if (scrollTop < triggerEnd) {
                    scaleProgress = (scrollTop - triggerStart) / (triggerEnd - triggerStart);
                } else {
                    scaleProgress = 1;
                }
            }
            
            // Scale logic: Cards at the bottom of the stack (earlier index) should be smaller
            // as new cards come on top.
            // React logic: targetScale = baseScale + i * itemScale
            // This means later cards are BIGGER?
            // Let's look at the React code again:
            // const targetScale = baseScale + i * itemScale;
            // const scale = 1 - scaleProgress * (1 - targetScale);
            // If i=0 (first card), targetScale = 0.85. scale goes 1 -> 0.85.
            // If i=last, targetScale = 1. scale goes 1 -> 1.
            // Yes, the cards BEHIND (earlier index) get smaller.
            
            const baseScale = 0.9;
            const itemScale = 0.02;
            const targetScale = baseScale + (i * itemScale);
            const scale = 1 - scaleProgress * (1 - targetScale);
            
            // Blur logic
            let blur = 0;
            // Find which card is currently "active" (at the stack position)
            let topCardIndex = -1;
            for(let j=0; j<cards.length; j++) {
                const jCardTop = cardPositions[j];
                const jTriggerStart = jCardTop - stackPositionPx - (itemStackDistance * j);
                if (scrollTop >= jTriggerStart) {
                    topCardIndex = j;
                }
            }
            
            if (i < topCardIndex) {
                const depth = topCardIndex - i;
                blur = depth * blurAmount;
            }

            // TranslateY (Pinning)
            let translateY = 0;
            const isPinned = scrollTop >= triggerStart && scrollTop <= pinEnd;
            
            if (isPinned) {
                // Pin it at stackPosition + offset
                // visualTop = scrollTop + stackPositionPx + (itemStackDistance * i)
                // transformY = visualTop - cardTop
                // = scrollTop + stackPositionPx + (itemStackDistance * i) - cardTop
                translateY = scrollTop - cardTop + stackPositionPx + (itemStackDistance * i);
            } else if (scrollTop > pinEnd) {
                // Stay at the bottom of the pinned area
                translateY = pinEnd - cardTop + stackPositionPx + (itemStackDistance * i);
            }

            // Apply styles
            card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
            card.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
            card.style.opacity = 1;
            
            // Z-index management: later cards should be on top
            card.style.zIndex = i + 1;
        });
    }

    window.addEventListener('scroll', onScroll);
    // Initial call
    onScroll();
}

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollStack);
} else {
    initScrollStack();
}
