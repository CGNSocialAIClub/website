import { landscapeSvg } from './imageFallbacks';

export default function ImagePlaceholder() {
    return <span role="img" aria-label="Bild nicht verfügbar" style={{ display: 'block', width: '100%', height: '100%', borderRadius: 'inherit', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: landscapeSvg }} />;
}
