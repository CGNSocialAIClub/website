import React from 'react';
import { RemotionLogoAnimation } from '../components/ui/RemotionLogoAnimation';

export default function LogoAnimationTest() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen pt-24 bg-surface dark:bg-surface-elevated">
            <h1 className="text-4xl font-bold mb-8 text-center px-4">
                Remotion "High-Five" Logo Animation
            </h1>
            
            <p className="max-w-xl text-center mb-12 text-surface-600 dark:text-surface-300">
                This animation uses actual video-timeline properties mapped natively to React components via the <strong>@remotion/player</strong> package without compiling a video.
            </p>
            
            {/* 
              Remotion <Player> embeds directly into the web DOM 
              while processing useCurrentFrame(), spring(), etc. 
            */}
            <div className="relative w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-oxford-blue">
                <RemotionLogoAnimation />
            </div>
            
        </div>
    );
}
