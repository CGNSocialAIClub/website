export default function AvatarPlaceholder({ size = 48, className = '', style }) {
    return <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" className={className}
        style={{ display: 'block', flexShrink: 0, borderRadius: '50%', ...style }}>
        <circle cx="32" cy="32" r="32" fill="#e8ecf0" />
        <circle cx="32" cy="24" r="11" fill="#aabac8" />
        <path d="M10 61v-6a22 22 0 0 1 44 0v6" fill="#aabac8" />
    </svg>;
}
