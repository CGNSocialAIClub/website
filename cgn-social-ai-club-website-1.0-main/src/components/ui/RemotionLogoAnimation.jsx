import React from 'react';
import { Player } from '@remotion/player';
import { useCurrentFrame, useVideoConfig, spring, interpolate, Easing } from 'remotion';

// The abstract geometric crescent body shared by all figures
const CrescentBody = ({ color, className }) => (
    <path 
        className={className} 
        stroke={color || "currentColor"} 
        fill="none" 
        strokeWidth="89" 
        strokeLinecap="round" 
        d="M25.5056 232.628C152.288 232.628 256.354 128.033 256.354 0.723877" 
    />
);

const LogoComposition = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // ----------------------------------------------------
    // PHASE 1: Approach (Frame 0 to 45)
    // ----------------------------------------------------
    
    // Translation X: Fly in from far sides
    const approachXLeft = interpolate(frame, [0, 40, 45], [-300, 20, 0], {
        easing: Easing.out(Easing.back(1.5)), 
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp'
    });
    
    // Bounce Y: Rhythmic sine-wave walk
    // Math.sin(frame / speed) * height
    const walkBounce = interpolate(frame, [0, 40], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) 
                       * Math.sin(frame * 0.4) * 30;

    // Anticipation Rotation: Lean back just before hit, snap forward
    const approachRotateLeft = interpolate(frame, [35, 42, 45], [0, -15, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const approachRotateRight = interpolate(frame, [35, 42, 45], [0, 15, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // ----------------------------------------------------
    // PHASE 2: High-Five Impact (Frame 45)
    // ----------------------------------------------------
    
    // Sparks shoot out at frame 45
    const sparkOpacity = interpolate(frame, [45, 47, 52], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const sparkScale = spring({ frame: frame - 45, fps, config: { damping: 10, mass: 0.5 } });

    // Recoil after impact
    const recoilX = spring({ frame: frame - 45, fps, config: { damping: 12, mass: 1, stiffness: 100 } });
    const postImpactOffset = interpolate(recoilX, [0, 0.5, 1], [0, -30, 0]);

    // ----------------------------------------------------
    // PHASE 3: Morph & Duplication (Frame 55 to 80)
    // ----------------------------------------------------
    
    // The original two slide UP
    const slideUpLeftY = interpolate(frame, [55, 80], [0, -80], { easing: Easing.inOut(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const slideUpRightY = interpolate(frame, [55, 80], [0, -80], { easing: Easing.inOut(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    
    const slideUpLeftX = interpolate(frame, [55, 80], [0, -80], { easing: Easing.inOut(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const slideUpRightX = interpolate(frame, [55, 80], [0, 80], { easing: Easing.inOut(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Rotation into final ring position
    // Top-left stays 0, top-right stays 0 (because we mirrored it using scaleX)
    
    // The new duplicate two slide IN from bottom
    const newPiecesOpacity = interpolate(frame, [60, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    
    const slideDownLeftY = interpolate(frame, [60, 85], [100, 80], { easing: Easing.out(Easing.back(1.2)), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const slideDownLeftX = interpolate(frame, [60, 85], [-50, -80], { easing: Easing.out(Easing.back(1.2)), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    
    const slideDownRightY = interpolate(frame, [60, 85], [100, 80], { easing: Easing.out(Easing.back(1.2)), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const slideDownRightX = interpolate(frame, [60, 85], [50, 80], { easing: Easing.out(Easing.back(1.2)), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });


    // --- COMBINING TRANSFORMATIONS ---
    // Top Left (Original Dark Blue)
    const tlX = approachXLeft + postImpactOffset + slideUpLeftX;
    const tlY = walkBounce + slideUpLeftY;
    const tlRot = approachRotateLeft;

    // Top Right (Original Cyan Star)
    const trX = -approachXLeft - postImpactOffset + slideUpRightX; // mirrored logic
    const trY = walkBounce + slideUpRightY;
    const trRot = approachRotateRight;


    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* 600x600 container centered */}
            <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                
                {/* Center point of action is roughly 400, 400 */}
                <g transform="translate(400, 400)">

                    {/* TOP LEFT (Original Figure: Dark Blue Round Head) */}
                    <g transform={`translate(${tlX}, ${tlY}) rotate(${tlRot})`}>
                        {/* We offset internally so the head sits naturally above the crescent */}
                        <g transform="translate(-130, -50)">
                            <CrescentBody className="text-oxford-blue dark:text-white" />
                            <circle cx="89.47" cy="64.91" r="64" className="text-oxford-blue dark:text-white" fill="currentColor" />
                        </g>
                    </g>

                    {/* TOP RIGHT (Original Figure: Cyan Star Head) */}
                    {/* Scale(-1, 1) perfectly horizontally mirrors the left shape to create the right shape */}
                    <g transform={`translate(${trX}, ${trY}) rotate(${trRot}) scale(-1, 1)`}>
                        <g transform="translate(-130, -50)">
                            <CrescentBody color="#4BFFC0" />
                            {/* Star Head (Scaled slightly to match the head size proportions) */}
                            <path 
                                fill="#4BFFC0" 
                                transform="translate(89.47, 64.91) scale(1.1)"
                                d="M0 -65 C 20 -20, 20 -20, 65 0 C 20 20, 20 20, 0 65 C -20 20, -20 20, -65 0 C -20 -20, -20 -20, 0 -65 Z" 
                            />
                        </g>
                    </g>

                    {/* BOTTOM LEFT (Duplicate: Light Blue Round Head, rotated to connect) */}
                    <g style={{ opacity: newPiecesOpacity }} transform={`translate(${slideDownLeftX}, ${slideDownLeftY}) scale(1, -1)`}>
                        <g transform="translate(-130, -50)">
                            <CrescentBody color="#4A98FF" />
                            <circle cx="89.47" cy="64.91" r="64" fill="#4A98FF" />
                        </g>
                    </g>

                    {/* BOTTOM RIGHT (Duplicate: Dark Blue Round Head, rotated to connect) */}
                    <g style={{ opacity: newPiecesOpacity }} transform={`translate(${slideDownRightX}, ${slideDownRightY}) scale(-1, -1)`}>
                        <g transform="translate(-130, -50)">
                            <CrescentBody className="text-oxford-blue dark:text-white" />
                            <circle cx="89.47" cy="64.91" r="64" className="text-oxford-blue dark:text-white" fill="currentColor" />
                        </g>
                    </g>

                    {/* IMPACT SPARKS (Center 0,0) */}
                    <g style={{ opacity: sparkOpacity, transform: `scale(${sparkScale})` }}>
                        <path d="M-50 -20 L-80 -50" className="stroke-oxford-blue dark:stroke-white" stroke="currentColor" strokeWidth="15" strokeLinecap="round"/>
                        <path d="M0 -60 L0 -100" stroke="#4BFFC0" strokeWidth="15" strokeLinecap="round"/>
                        <path d="M50 -20 L80 -50" className="stroke-oxford-blue dark:stroke-white" stroke="currentColor" strokeWidth="15" strokeLinecap="round"/>
                    </g>

                </g>
            </svg>
        </div>
    );
};

export function RemotionLogoAnimation() {
    return (
        <Player
            component={LogoComposition}
            durationInFrames={120}
            fps={30}
            compositionWidth={800}
            compositionHeight={800}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
            autoPlay
            loop
        />
    );
}
