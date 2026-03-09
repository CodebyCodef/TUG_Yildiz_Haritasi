document.addEventListener("DOMContentLoaded", () => {
    // -------------------------------------------------------------------------
    // 1. Starfield Background Engine
    // -------------------------------------------------------------------------
    const canvas = document.getElementById("starfield");
    const ctx = canvas.getContext("2d");

    let canvasWidth, canvasHeight;
    const backgroundStars = [];
    const NUM_STARS = 2500; // Increased starfield density for a larger space feel

    function resizeCanvas() {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        generateStars();
    }

    window.addEventListener("resize", resizeCanvas);

    function generateStars() {
        backgroundStars.length = 0;
        for (let i = 0; i < NUM_STARS; i++) {
            backgroundStars.push({
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                radius: Math.random() * 1.5,
                alpha: Math.random(),
                twinkleSpeed: (Math.random() * 0.015) + 0.005,
                twinkleDir: Math.random() > 0.5 ? 1 : -1
            });
        }
    }

    function animateStars() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        backgroundStars.forEach(star => {
            star.alpha += star.twinkleSpeed * star.twinkleDir;
            if (star.alpha >= 1) {
                star.alpha = 1;
                star.twinkleDir = -1;
            } else if (star.alpha <= 0.05) {
                star.alpha = 0.05;
                star.twinkleDir = 1;
            }

            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();
        });

        requestAnimationFrame(animateStars);
    }

    resizeCanvas();
    animateStars();

    // -------------------------------------------------------------------------
    // 2. Drag & Pan Logic for the Universe (8000x8000 Bounds)
    // -------------------------------------------------------------------------
    const container = document.getElementById("universe-container");
    let isDragging = false;
    let clickStartX = 0, clickStartY = 0;

    // Start roughly in the middle of our 8000x8000 map
    let currentX = -3000;
    let currentY = -2000;
    let startX = 0, startY = 0;

    const MAP_WIDTH = 8000;
    const MAP_HEIGHT = 8000;

    function clampBounds() {
        const limitX = window.innerWidth - MAP_WIDTH;
        const limitY = window.innerHeight - MAP_HEIGHT;
        currentX = Math.min(0, Math.max(currentX, limitX));
        currentY = Math.min(0, Math.max(currentY, limitY));
    }

    clampBounds();
    container.style.transform = `translate(${currentX}px, ${currentY}px)`;

    container.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;

        clickStartX = e.clientX;
        clickStartY = e.clientY;
        container.style.transition = "none"; // Instant drag, no lag
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        e.preventDefault();

        currentX = e.clientX - startX;
        currentY = e.clientY - startY;

        clampBounds();
        container.style.transform = `translate(${currentX}px, ${currentY}px)`;
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });
    window.addEventListener("mouseleave", () => {
        isDragging = false;
    });

    // -------------------------------------------------------------------------
    // 3. Render Constellations
    // -------------------------------------------------------------------------
    const svgLayer = document.getElementById("constellation-svg");
    const nodesLayer = document.getElementById("star-nodes-container");
    const svgNS = "http://www.w3.org/2000/svg";

    const drawnLines = [];

    if (typeof constellationsData !== 'undefined') {
        constellationsData.forEach(constellation => {
            const group = document.createElementNS(svgNS, "g");
            group.classList.add("constellation-group");
            group.dataset.id = constellation.id;

            const starMap = {};
            const nodeLines = [];

            // Draw Stars
            constellation.stars.forEach(star => {
                starMap[star.id] = star;

                const domStar = document.createElement("div");
                domStar.className = "star-node";
                domStar.style.left = `${star.x}px`;
                domStar.style.top = `${star.y}px`;
                domStar.setAttribute("data-label", star.label);

                domStar.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const dist = Math.abs(e.clientX - clickStartX) + Math.abs(e.clientY - clickStartY);
                    if (dist > 5) return; // Ignore drag end 
                    openInfoCard(constellation);
                });

                nodesLayer.appendChild(domStar);
            });

            // Draw Lines
            constellation.connections.forEach(conn => {
                const startStar = starMap[conn[0]];
                const endStar = starMap[conn[1]];

                if (startStar && endStar) {
                    const line = document.createElementNS(svgNS, "line");
                    line.setAttribute("x1", startStar.x);
                    line.setAttribute("y1", startStar.y);
                    line.setAttribute("x2", endStar.x);
                    line.setAttribute("y2", endStar.y);
                    line.classList.add("constellation-line");

                    line.addEventListener("click", (e) => {
                        e.stopPropagation();
                        const dist = Math.abs(e.clientX - clickStartX) + Math.abs(e.clientY - clickStartY);
                        if (dist > 5) return;
                        openInfoCard(constellation);
                    });

                    group.appendChild(line);
                    nodeLines.push(line);
                }
            });

            group.addEventListener("click", (e) => {
                e.stopPropagation();
                const dist = Math.abs(e.clientX - clickStartX) + Math.abs(e.clientY - clickStartY);
                if (dist > 5) return;
                openInfoCard(constellation);
            });

            drawnLines.push({ id: constellation.id, lines: nodeLines });
            svgLayer.appendChild(group);
        });
    }

    // Click background to close
    container.addEventListener("click", (e) => {
        const dist = Math.abs(e.clientX - clickStartX) + Math.abs(e.clientY - clickStartY);
        if (dist > 5) return;
        closeInfoCard();
    });

    // -------------------------------------------------------------------------
    // 4. Detailed Info Card & Preview Logic
    // -------------------------------------------------------------------------
    const infoCard = document.getElementById("info-card");
    const closeBtn = document.getElementById("close-btn");
    const titleEl = document.getElementById("constellation-name");
    const descEl = document.getElementById("constellation-info");
    const previewContainer = document.getElementById("constellation-preview");

    let activeConstellation = null;

    closeBtn.addEventListener("click", closeInfoCard);

    function openInfoCard(constellation) {
        if (activeConstellation === constellation.id) return;
        activeConstellation = constellation.id;

        // Toggle Highlights
        drawnLines.forEach(item => {
            item.lines.forEach(line => {
                if (item.id === constellation.id) {
                    line.classList.add("active");
                } else {
                    line.classList.remove("active");
                }
            });
        });

        titleEl.textContent = constellation.name;
        descEl.textContent = constellation.description;

        const brightestEl = document.getElementById("meta-brightest");
        const areaEl = document.getElementById("meta-area");
        const familyEl = document.getElementById("meta-family");

        if (brightestEl) brightestEl.textContent = constellation.brightestStar || "Bilinmiyor";
        if (areaEl) areaEl.textContent = constellation.area || "Bilinmiyor";
        if (familyEl) familyEl.textContent = constellation.family || "Bilinmiyor";

        generatePreview(constellation);
        infoCard.classList.remove("hidden");
    }

    function closeInfoCard() {
        if (!activeConstellation) return;
        activeConstellation = null;
        infoCard.classList.add("hidden");

        drawnLines.forEach(item => {
            item.lines.forEach(line => {
                line.classList.remove("active");
            });
        });
    }

    function generatePreview(constellation) {
        previewContainer.innerHTML = "";

        // Calculate aspect ratios
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        constellation.stars.forEach(star => {
            if (star.x < minX) minX = star.x;
            if (star.y < minY) minY = star.y;
            if (star.x > maxX) maxX = star.x;
            if (star.y > maxY) maxY = star.y;
        });

        const paddingX = 80;
        const paddingY = 60;
        const vbWidth = (maxX - minX) + paddingX * 2;
        const vbHeight = (maxY - minY) + paddingY * 2;

        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", `${minX - paddingX} ${minY - paddingY} ${vbWidth} ${vbHeight}`);

        const previewLineWidth = Math.max(vbWidth / 120, 2.5);
        const previewNodeRadius = Math.max(vbWidth / 100, 4);


        constellation.connections.forEach(conn => {
            const startStar = constellation.stars.find(s => s.id === conn[0]);
            const endStar = constellation.stars.find(s => s.id === conn[1]);

            if (startStar && endStar) {
                const line = document.createElementNS(svgNS, "line");
                line.setAttribute("x1", startStar.x);
                line.setAttribute("y1", startStar.y);
                line.setAttribute("x2", endStar.x);
                line.setAttribute("y2", endStar.y);
                line.setAttribute("stroke", "rgba(14, 165, 233, 0.85)");
                line.setAttribute("stroke-width", Math.max(previewLineWidth * 0.4, 1));
                line.setAttribute("stroke-linecap", "round");
                svg.appendChild(line);
            }
        });

        constellation.stars.forEach(star => {
            const circle = document.createElementNS(svgNS, "circle");
            circle.setAttribute("cx", star.x);
            circle.setAttribute("cy", star.y);
            circle.setAttribute("r", previewNodeRadius);
            circle.setAttribute("fill", "#ffffff");
            circle.setAttribute("stroke", "rgba(255,255,255,0.4)");
            circle.setAttribute("stroke-width", previewNodeRadius * 0.5);
            svg.appendChild(circle);
        });

        previewContainer.appendChild(svg);
    }

    // -------------------------------------------------------------------------
    // 5. Search & Fly-To Logic 
    // -------------------------------------------------------------------------
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");

    if (searchInput && searchResults && typeof constellationsData !== 'undefined') {
        searchInput.addEventListener("input", (e) => {
            const val = e.target.value.toLowerCase().trim();
            searchResults.innerHTML = "";

            if (!val) {
                searchResults.classList.add("hidden");
                return;
            }

            const matches = constellationsData.filter(c => c.name.toLowerCase().includes(val));

            if (matches.length > 0) {
                searchResults.classList.remove("hidden");
                matches.slice(0, 10).forEach(m => {
                    const li = document.createElement("li");
                    li.textContent = m.name;
                    li.addEventListener("click", () => {
                        searchInput.value = "";
                        searchResults.classList.add("hidden");
                        flyToConstellation(m);
                    });
                    searchResults.appendChild(li);
                });
            } else {
                searchResults.classList.add("hidden");
            }
        });

        document.addEventListener("click", (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.classList.add("hidden");
            }
        });
    }

    function flyToConstellation(constellation) {
        if (!constellation.stars || constellation.stars.length === 0) return;

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        constellation.stars.forEach(star => {
            if (star.x < minX) minX = star.x;
            if (star.y < minY) minY = star.y;
            if (star.x > maxX) maxX = star.x;
            if (star.y > maxY) maxY = star.y;
        });

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        let targetX = (window.innerWidth / 2) - centerX;
        let targetY = (window.innerHeight / 2) - centerY;

        if (window.innerWidth > 768) {
            targetX += 200;
        }

        const limitX = window.innerWidth - MAP_WIDTH;
        const limitY = window.innerHeight - MAP_HEIGHT;
        targetX = Math.min(0, Math.max(targetX, limitX));
        targetY = Math.min(0, Math.max(targetY, limitY));

        currentX = targetX;
        currentY = targetY;

        container.style.transition = "transform 1.2s cubic-bezier(0.22, 1, 0.36, 1)";
        container.style.transform = `translate(${currentX}px, ${currentY}px)`;

        setTimeout(() => {
            container.style.transition = "none";
            openInfoCard(constellation);
        }, 1250);
    }
});
