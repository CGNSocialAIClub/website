import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from '../../i18n/LocaleContext';

const CONFIG = {
    gravity: 2200,
    jumpVelocity: 760,
    doubleJumpVelocity: 520,
    doubleJumpMinDelayMs: 150,
    autoJumpGroundContactMs: 40,
    worldSpeed: 300,
    playerSize: 44,
    groundHeight: 80,
    startPlayerX: 50,

    fixedStepMs: 1000 / 120,
    maxFrameMs: 40,

    obstacleSpawnX: 1200,
    firstObstacleSpawnX: 700,
    buildingSpawnX: 1200,
    firstBuildingSpawnX: 920,

    levelOverlayMs: 1400,

    scoreRate: 10,

    dotTileWidth: 560,
    dotTileHeight: 80,
    dotCount: 90,
};

const TOTAL_LEVELS = 10;
const BASE_BLOCKS_PER_LEVEL = 10;
const BLOCKS_ADDED_PER_LEVEL = 3;

const BLOCK_TYPES = {
    ONE_HIGH: { width: 26, height: 40, y: 0, floating: false, tall: false },
    TWO_HIGH: { width: 28, height: 78, y: 0, floating: false, tall: true },
    FLOATING: { width: 30, height: 46, y: 118, floating: true, tall: false },
};

// Small deterministic recipe: each level is built from block type + position pairs.
const MAP_PATTERN = [
    { type: 'ONE_HIGH', position: 0 },
    { type: 'ONE_HIGH', position: 1 },
    { type: 'TWO_HIGH', position: 0 },
    { type: 'ONE_HIGH', position: 2 },
    { type: 'FLOATING', position: 0 },
    { type: 'ONE_HIGH', position: 1 },
    { type: 'TWO_HIGH', position: 1 },
    { type: 'FLOATING', position: 2 },
];

function getBlocksForLevel(level) {
    return BASE_BLOCKS_PER_LEVEL + (level - 1) * BLOCKS_ADDED_PER_LEVEL;
}

function createLevelMap(level) {
    const blockCount = getBlocksForLevel(level);
    const blocks = [];

    for (let i = 0; i < blockCount; i++) {
        const recipe = MAP_PATTERN[(i + level) % MAP_PATTERN.length];
        const levelPressure = Math.min(7, Math.floor(level / 2));
        const gapMs = Math.max(520, 1120 - recipe.position * 120 - levelPressure * 45 + (i % 3) * 60);

        blocks.push({
            type: recipe.type,
            position: recipe.position,
            gapMs,
        });
    }

    return blocks;
}

function createMapLevels() {
    const levels = [];
    for (let level = 1; level <= TOTAL_LEVELS; level++) {
        levels.push(createLevelMap(level));
    }
    return levels;
}

const MAP_LEVELS = createMapLevels();
const RUNNER_NOTIFICATION_STORAGE_KEY = 'runner-game-contact-notified';
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xanzpnye';

function createGroundDotPatternDataUri(isDarkMode) {
    const baseColor = isDarkMode ? '255,255,255' : '10,45,87';
    let circles = '';

    const addWrappedCircle = (x, y, radius, alpha) => {
        const xOffsets = [0];
        const yOffsets = [0];

        if (x - radius < 0) xOffsets.push(CONFIG.dotTileWidth);
        if (x + radius > CONFIG.dotTileWidth) xOffsets.push(-CONFIG.dotTileWidth);
        if (y - radius < 0) yOffsets.push(CONFIG.dotTileHeight);
        if (y + radius > CONFIG.dotTileHeight) yOffsets.push(-CONFIG.dotTileHeight);

        for (const xo of xOffsets) {
            for (const yo of yOffsets) {
                circles += `<circle cx="${(x + xo).toFixed(2)}" cy="${(y + yo).toFixed(2)}" r="${radius.toFixed(2)}" fill="rgba(${baseColor},${alpha.toFixed(2)})" />`;
            }
        }
    };

    for (let i = 0; i < CONFIG.dotCount; i++) {
        const x = Math.random() * CONFIG.dotTileWidth;
        const y = Math.random() * CONFIG.dotTileHeight;
        const radius = 1 + Math.random() * 0.7;
        const alpha = isDarkMode ? (0.2 + Math.random() * 0.28) : (0.24 + Math.random() * 0.34);
        addWrappedCircle(x, y, radius, alpha);
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CONFIG.dotTileWidth}" height="${CONFIG.dotTileHeight}" viewBox="0 0 ${CONFIG.dotTileWidth} ${CONFIG.dotTileHeight}">${circles}</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function notifyRunnerGameStarted() {
    if (typeof window === 'undefined') return;
    if (window.sessionStorage.getItem(RUNNER_NOTIFICATION_STORAGE_KEY) === 'true') return;

    const payload = {
        form_name: 'runner_game_notification',
        _subject: 'Website Runner Game Played',
        name: 'Website Runner Game',
        email: 'contact@tum-socialaiclub.de',
        background: 'Website',
        subject: 'Runner game started',
        message: `The endless runner game was started on the website.\nURL: ${window.location.href}\nTime: ${new Date().toISOString()}`,
        _gotcha: ''
    };

    window.sessionStorage.setItem(RUNNER_NOTIFICATION_STORAGE_KEY, 'true');

    try {
        if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(payload)], {
                type: 'application/json'
            });
            navigator.sendBeacon(FORMSPREE_ENDPOINT, blob);
            return;
        }
    } catch {
        // Fall through to fetch if sendBeacon is unavailable or fails.
    }

    void fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(payload),
        keepalive: true
    }).catch(() => {});
}

function padScore(value) {
    return String(value).padStart(5, '0');
}

function createInitialGameState() {
    return {
        player: {
            y: 0,
            prevY: 0,
            vy: 0,
            jumping: false,
            doubleJumpUsed: false,
            jumpStartedAtMs: 0,
            rotation: 0,
            prevRotation: 0,
            baseRotation: 0,
            rotationJumpVelocity: 0,
        },

        jumpHeld: false,

        scoreRaw: 0,
        scoreDisplay: 0,
        passedBlocks: 0,

        level: 1,
        levelState: 'none',
        levelOverlayUntilMs: 0,
        levelResumeAtMs: 0,
        nextLevelAfterClear: false,

        elapsedMs: 0,
        nextAutoJumpAtMs: 0,
        spawnPaused: false,
        nextObstacleSpawnAtMs: 250,
        nextBuildingSpawnAtMs: 100,
        mapBlockIndex: 0,
        mapCycle: 0,

        groundOffset: 0,
        prevGroundOffset: 0,

        obstacles: [],
        buildings: [],
    };
}

function getSpeedMultiplier(level) {
    return 1 + (level - 1) * 0.1;
}

function scheduleNextObstacleSpawn(state) {
    const levelMap = MAP_LEVELS[state.level - 1] || [];
    if (state.mapBlockIndex >= levelMap.length) {
        state.nextObstacleSpawnAtMs = Number.POSITIVE_INFINITY;
        return;
    }

    const speedMultiplier = getSpeedMultiplier(state.level);
    const block = levelMap[state.mapBlockIndex];
    const scaledGapMs = block.gapMs / (0.92 + (speedMultiplier - 1) * 1.4);

    state.nextObstacleSpawnAtMs = state.elapsedMs + scaledGapMs;
}

function scheduleNextBuildingSpawn(state) {
    const isFirst = state.buildings.length === 0;
    const delayMs = isFirst ? 120 : 600 + Math.random() * 400;
    state.nextBuildingSpawnAtMs = state.elapsedMs + delayMs;
}

function spawnBuilding(state) {
    const isFirst = state.buildings.length === 0;
    const width = 60 + Math.random() * 80;
    const height = 40 + Math.random() * 100;
    const x = isFirst ? CONFIG.firstBuildingSpawnX : CONFIG.buildingSpawnX;

    state.buildings.push({
        id: `b_${state.elapsedMs}_${Math.random()}`,
        x,
        prevX: x,
        width,
        height,
    });

    scheduleNextBuildingSpawn(state);
}

function spawnObstacleCluster(state) {
    const levelMap = MAP_LEVELS[state.level - 1] || [];
    if (state.mapBlockIndex >= levelMap.length) {
        if (state.level < MAP_LEVELS.length) {
            state.nextLevelAfterClear = true;
            state.nextObstacleSpawnAtMs = Number.POSITIVE_INFINITY;
        } else {
            state.mapBlockIndex = 0;
            state.mapCycle += 1;
            scheduleNextObstacleSpawn(state);
        }
        return;
    }

    const recipe = levelMap[state.mapBlockIndex];
    const blockType = BLOCK_TYPES[recipe.type] || BLOCK_TYPES.ONE_HIGH;
    const isFirstSpawn = state.level === 1 && state.mapBlockIndex === 0 && state.passedBlocks === 0;
    const spawnX = isFirstSpawn ? CONFIG.firstObstacleSpawnX : CONFIG.obstacleSpawnX;

    const floatingY = blockType.floating ? blockType.y + recipe.position * 10 : blockType.y;

    state.obstacles.push({
        id: `o_${state.level}_${state.mapCycle}_${state.mapBlockIndex}`,
        x: spawnX,
        prevX: spawnX,
        y: floatingY,
        width: blockType.width,
        height: blockType.height,
        floating: blockType.floating,
        tall: blockType.tall,
    });

    state.mapBlockIndex += 1;
    if (state.mapBlockIndex >= levelMap.length) {
        if (state.level < MAP_LEVELS.length) {
            state.nextLevelAfterClear = true;
        } else {
            state.mapBlockIndex = 0;
            state.mapCycle += 1;
        }
    }

    scheduleNextObstacleSpawn(state);
}

function checkCollision(player, obstacle) {
    const playerRect = {
        left: CONFIG.startPlayerX + 2,
        right: CONFIG.startPlayerX + CONFIG.playerSize - 2,
        bottom: player.y,
        top: player.y + CONFIG.playerSize - 2,
    };

    const obsLeft = obstacle.x;
    const obsRight = obstacle.x + obstacle.width;
    const obsBottom = obstacle.y;
    const obsTop = obstacle.y + obstacle.height;

    return (
        playerRect.right > obsLeft &&
        playerRect.left < obsRight &&
        playerRect.top > obsBottom &&
        playerRect.bottom < obsTop
    );
}

export default function RunnerGame() {
    const { t } = useLocale();

    const [gameState, setGameState] = useState('START');
    const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('runnerHighScore') || '0', 10));
    const [uiLevel, setUiLevel] = useState(1);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

    const groundPatternDataUri = useMemo(() => createGroundDotPatternDataUri(isDarkMode), [isDarkMode]);

    const gameDataRef = useRef(createInitialGameState());
    const rafRef = useRef(null);
    const lastFrameTimeRef = useRef(0);
    const accumulatorRef = useRef(0);

    const playerRef = useRef(null);
    const scoreRef = useRef(null);
    const groundPatternRef = useRef(null);
    const obstaclesLayerRef = useRef(null);
    const buildingsLayerRef = useRef(null);

    const obstacleNodesRef = useRef(new Map());
    const buildingNodesRef = useRef(new Map());

    const isDarkModeRef = useRef(isDarkMode);

    useEffect(() => {
        isDarkModeRef.current = isDarkMode;
    }, [isDarkMode]);

    useEffect(() => {
        const updateThemeState = () => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        };

        updateThemeState();

        const observer = new MutationObserver(() => {
            updateThemeState();
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => observer.disconnect();
    }, []);

    const syncDomCollections = useCallback(() => {
        const state = gameDataRef.current;

        const obstacleLayer = obstaclesLayerRef.current;
        const buildingLayer = buildingsLayerRef.current;
        if (!obstacleLayer || !buildingLayer) return;

        const obstacleIds = new Set(state.obstacles.map(item => item.id));
        const buildingIds = new Set(state.buildings.map(item => item.id));

        for (const [id, node] of obstacleNodesRef.current.entries()) {
            if (!obstacleIds.has(id)) {
                node.remove();
                obstacleNodesRef.current.delete(id);
            }
        }

        for (const [id, node] of buildingNodesRef.current.entries()) {
            if (!buildingIds.has(id)) {
                node.remove();
                buildingNodesRef.current.delete(id);
            }
        }

        for (const obstacle of state.obstacles) {
            if (!obstacleNodesRef.current.has(obstacle.id)) {
                const el = document.createElement('div');
                el.className = 'absolute rounded-md z-10';
                el.style.left = '0';
                el.style.willChange = 'transform';

                if (!obstacle.floating) {
                    el.style.borderTopLeftRadius = '0.375rem';
                    el.style.borderTopRightRadius = '0.375rem';
                    el.style.borderBottomLeftRadius = '0';
                    el.style.borderBottomRightRadius = '0';
                }

                const deco = document.createElement('div');
                deco.className = 'w-full h-1 bg-white/20 mt-1 opacity-50';
                el.appendChild(deco);

                obstacleLayer.appendChild(el);
                obstacleNodesRef.current.set(obstacle.id, el);
            }
        }

        for (const building of state.buildings) {
            if (!buildingNodesRef.current.has(building.id)) {
                const el = document.createElement('div');
                el.className = 'absolute bottom-0 opacity-[0.05] dark:opacity-[0.08]';
                el.style.backgroundColor = 'var(--text-primary)';
                el.style.bottom = `${CONFIG.groundHeight}px`;
                el.style.willChange = 'transform';

                for (let i = 0; i < 3; i++) {
                    const win = document.createElement('div');
                    win.className = 'w-1 h-1 bg-white/40 mt-2 mx-auto rounded-full';
                    el.appendChild(win);
                }

                buildingLayer.appendChild(el);
                buildingNodesRef.current.set(building.id, el);
            }
        }
    }, []);

    const renderWorld = useCallback((alpha = 1) => {
        const state = gameDataRef.current;
        const player = state.player;

        if (playerRef.current) {
            const renderY = player.prevY + (player.y - player.prevY) * alpha;
            const renderRotation = player.prevRotation + (player.rotation - player.prevRotation) * alpha;
            playerRef.current.style.transform = `translate3d(0, ${-renderY}px, 0) rotate(${renderRotation}deg)`;
        }

        if (scoreRef.current) {
            const nextScore = Math.floor(state.scoreRaw / CONFIG.scoreRate);
            if (nextScore !== state.scoreDisplay) {
                state.scoreDisplay = nextScore;
                scoreRef.current.textContent = padScore(nextScore);
            }
        }

        if (groundPatternRef.current) {
            const groundDelta = state.groundOffset - state.prevGroundOffset;
            const renderGroundOffset = state.prevGroundOffset + groundDelta * alpha;
            const loopedOffset = ((-renderGroundOffset % CONFIG.dotTileWidth) + CONFIG.dotTileWidth) % CONFIG.dotTileWidth;

            groundPatternRef.current.style.transform = `translate3d(${-loopedOffset}px, 0, 0)`;
        }

        syncDomCollections();

        for (const obstacle of state.obstacles) {
            const node = obstacleNodesRef.current.get(obstacle.id);
            if (!node) continue;

            node.style.width = `${obstacle.width}px`;
            node.style.height = `${obstacle.height}px`;
            node.style.bottom = `${CONFIG.groundHeight + obstacle.y}px`;

            const tallBlockColor = isDarkModeRef.current ? 'var(--text-accent)' : 'var(--text-secondary)';
            node.style.backgroundColor = obstacle.floating
                ? 'var(--text-secondary)'
                : obstacle.tall
                    ? tallBlockColor
                    : 'var(--text-primary)';
            node.style.opacity = '0.9';
            const renderX = obstacle.prevX + (obstacle.x - obstacle.prevX) * alpha;
            node.style.transform = `translate3d(${renderX}px, 0, 0)`;
        }

        for (const building of state.buildings) {
            const node = buildingNodesRef.current.get(building.id);
            if (!node) continue;

            node.style.width = `${building.width}px`;
            node.style.height = `${building.height}px`;
            const renderX = building.prevX + (building.x - building.prevX) * alpha;
            node.style.transform = `translate3d(${renderX}px, 0, 0)`;
        }
    }, [syncDomCollections]);

    const resetGame = useCallback(() => {
        gameDataRef.current = createInitialGameState();
        setUiLevel(1);
        setShowLevelUp(false);

        for (const [, node] of obstacleNodesRef.current.entries()) node.remove();
        for (const [, node] of buildingNodesRef.current.entries()) node.remove();
        obstacleNodesRef.current.clear();
        buildingNodesRef.current.clear();

        accumulatorRef.current = 0;
        lastFrameTimeRef.current = 0;

        if (scoreRef.current) scoreRef.current.textContent = '00000';
    }, []);

    const startGame = useCallback(() => {
        resetGame();
        scheduleNextObstacleSpawn(gameDataRef.current);
        scheduleNextBuildingSpawn(gameDataRef.current);
        notifyRunnerGameStarted();
        setGameState('PLAYING');
    }, [resetGame]);

    const endGame = useCallback(() => {
        const state = gameDataRef.current;
        const score = Math.floor(state.scoreRaw / CONFIG.scoreRate);

        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('runnerHighScore', String(score));
        }

        setGameState('GAMEOVER');
    }, [highScore]);

    const handleJumpPress = useCallback(() => {
        const state = gameDataRef.current;
        const player = state.player;

        state.jumpHeld = true;

        if (gameState !== 'PLAYING') {
            startGame();
            return;
        }

        if (!player.jumping) {
            player.vy = CONFIG.jumpVelocity;
            player.jumping = true;
            player.doubleJumpUsed = false;
            player.jumpStartedAtMs = state.elapsedMs;
            player.baseRotation = player.rotation;
            player.rotationJumpVelocity = CONFIG.jumpVelocity;
            state.nextAutoJumpAtMs = 0;
        } else if (
            !player.doubleJumpUsed &&
            state.elapsedMs - player.jumpStartedAtMs >= CONFIG.doubleJumpMinDelayMs
        ) {
            player.vy = CONFIG.doubleJumpVelocity;
            player.doubleJumpUsed = true;
            player.baseRotation = player.rotation;
            player.rotationJumpVelocity = CONFIG.doubleJumpVelocity;
        }
    }, [gameState, startGame]);

    const handleJumpRelease = useCallback(() => {
        gameDataRef.current.jumpHeld = false;
        gameDataRef.current.nextAutoJumpAtMs = 0;
    }, []);

    const updateSimulation = useCallback((dtMs) => {
        const state = gameDataRef.current;
        const dt = dtMs / 1000;
        const player = state.player;

        player.prevY = player.y;
        player.prevRotation = player.rotation;
        state.prevGroundOffset = state.groundOffset;

        for (const obstacle of state.obstacles) {
            obstacle.prevX = obstacle.x;
        }

        for (const building of state.buildings) {
            building.prevX = building.x;
        }

        state.elapsedMs += dtMs;
        state.scoreRaw += dtMs / 10;

        const speedMultiplier = getSpeedMultiplier(state.level);
        const speed = CONFIG.worldSpeed * speedMultiplier;

        state.groundOffset -= speed * dt;
        if (state.groundOffset <= -CONFIG.dotTileWidth) {
            state.groundOffset += CONFIG.dotTileWidth;
            state.prevGroundOffset += CONFIG.dotTileWidth;
        }

        if (player.jumping) {
            player.vy -= CONFIG.gravity * dt;
            player.y += player.vy * dt;

            if (player.y <= 0) {
                player.y = 0;
                player.vy = 0;
                player.jumping = false;
                player.doubleJumpUsed = false;

                if (state.jumpHeld) {
                    state.nextAutoJumpAtMs = state.elapsedMs + CONFIG.autoJumpGroundContactMs;
                }
            }
        }

        if (
            !player.jumping &&
            state.jumpHeld &&
            state.nextAutoJumpAtMs > 0 &&
            state.elapsedMs >= state.nextAutoJumpAtMs
        ) {
            player.vy = CONFIG.jumpVelocity;
            player.jumping = true;
            player.jumpStartedAtMs = state.elapsedMs;
            player.baseRotation = player.rotation;
            player.rotationJumpVelocity = CONFIG.jumpVelocity;
            state.nextAutoJumpAtMs = 0;
        }

        if (player.jumping) {
            const rotationJumpVelocity = player.rotationJumpVelocity || CONFIG.jumpVelocity;
            const linearProgress = clamp((rotationJumpVelocity - player.vy) / (2 * rotationJumpVelocity), 0, 1);
            const easeProgress = 1 - Math.pow(1 - linearProgress, 3);
            player.rotation = player.baseRotation + easeProgress * 90;
        } else {
            player.rotation = Math.round(player.rotation / 90) * 90;
        }

        const bgSpeed = speed * 0.25;

        if (state.elapsedMs >= state.nextBuildingSpawnAtMs) {
            spawnBuilding(state);
        }

        for (let i = state.buildings.length - 1; i >= 0; i--) {
            state.buildings[i].x -= bgSpeed * dt;
            if (state.buildings[i].x < -220) {
                state.buildings.splice(i, 1);
            }
        }

        const spawnBlocked =
            state.levelState !== 'none' ||
            state.elapsedMs < state.levelResumeAtMs ||
            state.spawnPaused;

        if (!spawnBlocked && state.elapsedMs >= state.nextObstacleSpawnAtMs) {
            spawnObstacleCluster(state);
        }

        for (let i = state.obstacles.length - 1; i >= 0; i--) {
            const obs = state.obstacles[i];
            obs.x -= speed * dt;

            if (obs.x < -120) {
                state.passedBlocks += 1;
                state.obstacles.splice(i, 1);
                continue;
            }

            if (checkCollision(player, obs)) {
                endGame();
                return;
            }
        }

        if (state.nextLevelAfterClear && state.obstacles.length === 0) {
            state.nextLevelAfterClear = false;

            if (state.level < MAP_LEVELS.length) {
                state.level += 1;
                state.mapBlockIndex = 0;
                state.mapCycle = 0;
                setUiLevel(state.level);
            }

            state.levelState = 'show_overlay';
            state.levelOverlayUntilMs = state.elapsedMs + CONFIG.levelOverlayMs;
            state.levelResumeAtMs = state.levelOverlayUntilMs;
            setShowLevelUp(true);
        }

        if (state.levelState === 'show_overlay' && state.elapsedMs >= state.levelOverlayUntilMs) {
            state.levelState = 'none';
            setShowLevelUp(false);
            scheduleNextObstacleSpawn(state);
        }
    }, [endGame]);

    const gameLoop = useCallback((timestamp) => {
        if (gameState !== 'PLAYING') return;

        if (!lastFrameTimeRef.current) {
            lastFrameTimeRef.current = timestamp;
            rafRef.current = requestAnimationFrame(gameLoop);
            return;
        }

        const frameMs = Math.min(timestamp - lastFrameTimeRef.current, CONFIG.maxFrameMs);
        lastFrameTimeRef.current = timestamp;
        accumulatorRef.current += frameMs;

        while (accumulatorRef.current >= CONFIG.fixedStepMs) {
            updateSimulation(CONFIG.fixedStepMs);
            accumulatorRef.current -= CONFIG.fixedStepMs;

            if (gameState !== 'PLAYING' && rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                return;
            }
        }

        const alpha = accumulatorRef.current / CONFIG.fixedStepMs;
        renderWorld(alpha);
        rafRef.current = requestAnimationFrame(gameLoop);
    }, [gameState, renderWorld, updateSimulation]);

    useEffect(() => {
        if (gameState === 'PLAYING') {
            rafRef.current = requestAnimationFrame(gameLoop);
        } else if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [gameState, gameLoop]);

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                if (e.repeat) return;
                handleJumpPress();
            }
        };

        const onKeyUp = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                handleJumpRelease();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, [handleJumpPress, handleJumpRelease]);

    useEffect(() => {
        renderWorld();
    }, [renderWorld, highScore, uiLevel, showLevelUp, isDarkMode]);

    return (
        <div className="w-full mx-auto origin-top">
            <div
                className="relative w-full h-[500px] sm:h-[400px] bg-[var(--bg-surface)] dark:bg-[var(--bg-surface-subtle)] rounded-3xl border border-[var(--border-default)] overflow-hidden cursor-pointer select-none group touch-manipulation"
                style={{ contain: 'layout paint size', transform: 'translateZ(0)' }}
                onPointerDown={(e) => {
                    e.preventDefault();
                    handleJumpPress();
                }}
                onPointerUp={handleJumpRelease}
                onPointerCancel={handleJumpRelease}
                onPointerLeave={handleJumpRelease}
            >
                <div className="absolute top-6 right-8 flex gap-6 z-20 transition-opacity duration-300" style={{ opacity: showLevelUp ? 0.3 : 1 }}>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-bold">Best</span>
                        <span className="text-xl font-mono font-bold text-[var(--text-secondary)] opacity-50">
                            {padScore(highScore)}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-bold">Score</span>
                        <span ref={scoreRef} className="text-xl font-mono font-bold text-[var(--text-primary)]">
                            00000
                        </span>
                    </div>
                </div>

                <div className="absolute top-6 left-8 flex flex-col items-start z-20">
                    <span className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-bold">Level</span>
                    <span
                        className="text-xl font-mono font-bold text-[var(--text-primary)] transition-all duration-500 transform"
                        style={{ scale: showLevelUp ? '1.2' : '1' }}
                    >
                        {uiLevel}
                    </span>
                </div>

                <div ref={buildingsLayerRef} className="absolute inset-0 z-0 pointer-events-none" />

                <div
                    className="absolute bottom-0 w-full bg-[var(--bg-surface-subtle)] border-t border-[var(--border-default)] z-20 overflow-hidden"
                    style={{ height: `${CONFIG.groundHeight}px` }}
                >
                    <div
                        ref={groundPatternRef}
                        className="absolute inset-y-0 left-0 pointer-events-none"
                        style={{
                            width: '300%',
                            backgroundImage: `url("${groundPatternDataUri}")`,
                            backgroundRepeat: 'repeat-x',
                            backgroundSize: `${CONFIG.dotTileWidth}px ${CONFIG.dotTileHeight}px`,
                            willChange: 'transform',
                        }}
                    />
                </div>

                <div
                    ref={playerRef}
                    className="absolute z-10"
                    style={{
                        left: `${CONFIG.startPlayerX}px`,
                        bottom: `${CONFIG.groundHeight}px`,
                        width: `${CONFIG.playerSize}px`,
                        height: `${CONFIG.playerSize}px`,
                        willChange: 'transform',
                    }}
                >
                    <img
                        src={
                            isDarkMode
                                ? '/assets/logos/LOGO-v5-SOCIAL-AI_ICON-No-Background-White-Text.svg'
                                : '/assets/logos/LOGO-v5-SOCIAL-AI_ICON-No-Background-Darkblue-Text.svg'
                        }
                        alt="Player"
                        className="w-full h-full object-contain"
                        draggable={false}
                    />
                </div>

                <div ref={obstaclesLayerRef} className="absolute inset-0 z-10 pointer-events-none" />

                <div
                    className={`absolute inset-0 z-40 flex flex-col items-center justify-center bg-[var(--bg-surface)]/60 pointer-events-none transition-all duration-700 ${showLevelUp ? 'opacity-100 scale-100' : 'opacity-0 scale-90 translate-y-4'}`}
                >
                    <div className="text-4xl font-bold text-[var(--text-accent)] uppercase tracking-[0.5em] animate-pulse">
                        Level {uiLevel}
                    </div>
                    <div className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mt-2 text-center">
                        Increasing...
                    </div>
                </div>

                {gameState === 'START' && (
                    <div className="absolute inset-0 z-35 flex flex-col items-center justify-center px-4 transition-all group-hover:bg-[var(--bg-surface)]/10">
                        <div className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-2 uppercase tracking-widest italic text-center">
                            {'ontouchstart' in window ? (t.game.startMobile || 'Tap to Start') : t.game.start}
                        </div>
                    </div>
                )}

                {gameState === 'GAMEOVER' && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-4 bg-[var(--bg-surface)]/80 transition-all animate-in fade-in zoom-in duration-300">
                        <div
                            className="text-4xl sm:text-5xl mb-4 uppercase tracking-[0.2em] drop-shadow-lg text-red-500 text-center"
                            style={{
                                fontFamily: 'var(--font-family-heading)',
                                fontWeight: 800,
                            }}
                        >
                            {t.game.gameOver}
                        </div>
                        <div className="text-base sm:text-lg text-[var(--text-primary)] font-medium opacity-80 text-center">
                            {t.game.retry}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
