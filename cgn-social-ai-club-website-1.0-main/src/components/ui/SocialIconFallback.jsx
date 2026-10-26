import { lumaSvg } from './imageFallbacks';
// Self-contained substitutes for app-icon files that fail to load.
export default function SocialIconFallback({ service, size = 40 }) {
    if (service === 'luma') return <span aria-hidden="true" style={{ display: 'block', width: size, height: size }} dangerouslySetInnerHTML={{ __html: lumaSvg }} />;
    const instagram = service === 'instagram';
    return <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" style={{ display: 'block', width: size, height: size }}>
        <rect width="40" height="40" rx="9" fill={service === 'linkedin' ? '#0a66c2' : instagram ? '#9c337f' : '#fff'} />
        {service === 'linkedin' ? <g fill="#fff"><circle cx="10" cy="11" r="2.3" /><path d="M8 16h4v16H8zM17 16h4v2c2-3 10-4 10 5v9h-4v-9c0-5-6-4-6 0v9h-4z" /></g>
            : instagram ? <g fill="none" stroke="#fff" strokeWidth="2.5"><rect x="8" y="8" width="24" height="24" rx="7" /><circle cx="20" cy="20" r="6" /><circle cx="27" cy="13" r="1" fill="#fff" stroke="none" /></g>
                : null}
    </svg>;
}
