export default function PartnerLogoFallback({ name, style, className = '' }) {
    return <span className={className} style={{ display: 'block', maxWidth: '85%', textAlign: 'center', fontFamily: "'League Spartan', sans-serif", fontWeight: 700, fontSize: 'clamp(18px, 2.5vw, 30px)', lineHeight: 1.1, color: 'var(--text-primary)', overflowWrap: 'anywhere', ...style }}>{name}</span>;
}
