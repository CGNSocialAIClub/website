import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor, Smartphone } from 'lucide-react';

export default function ThemeToggle() {
    // State: 'light' | 'dark' | 'system'
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
                return savedTheme;
            }
        }
        return 'system';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        const applyTheme = (targetTheme) => {
            if (targetTheme === 'dark') {
                root.classList.add('dark');
            } else if (targetTheme === 'light') {
                root.classList.remove('dark');
            } else if (targetTheme === 'system') {
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }
        };

        applyTheme(theme);

        // Save to local storage
        if (theme === 'system') {
            localStorage.removeItem('theme');
        } else {
            localStorage.setItem('theme', theme);
        }

        // Listen for system changes if in system mode
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme('system');
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }

    }, [theme]);

    const cycleTheme = () => {
        setTheme(prev => {
            if (prev === 'system') return 'light';
            if (prev === 'light') return 'dark';
            return 'system';
        });
    };

    return (
        <button
            onClick={cycleTheme}
            className="flex h-[44px] w-[44px] items-center justify-center rounded-full border border-[var(--border-default)] text-[var(--text-primary)] transition-all hover:bg-[var(--hover-overlay)]"
            aria-label={`Current theme: ${theme}. Click to cycle.`}
            title="Toggle Theme (System -> Light -> Dark)"
        >
            {theme === 'light' && <Sun className="w-5 h-5" />}
            {theme === 'dark' && <Moon className="w-5 h-5" />}
            {theme === 'system' && (
                <>
                    <Smartphone className="w-5 h-5 md:hidden" />
                    <Monitor className="hidden w-5 h-5 md:block" />
                </>
            )}
        </button>
    );
}
