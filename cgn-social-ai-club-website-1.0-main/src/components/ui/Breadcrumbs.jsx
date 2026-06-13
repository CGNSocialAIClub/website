import { Link, useLocation } from 'react-router-dom';
import Container from './Container';
import { getBreadcrumbs, normalizePath } from '../../utils/seoRoutes';

export default function Breadcrumbs() {
    const location = useLocation();
    const pathname = normalizePath(location.pathname);

    if (pathname === '/') {
        return null;
    }

    const breadcrumbs = getBreadcrumbs(pathname);

    return (
        <nav aria-label="Breadcrumb" className="w-full py-4">
            <Container>
                <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]">
                    {breadcrumbs.map((crumb, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        return (
                            <li key={crumb.path} className="flex items-center gap-2">
                                {isLast ? (
                                    <span aria-current="page" className="text-[var(--text-primary)]">
                                        {crumb.name}
                                    </span>
                                ) : (
                                    <Link to={crumb.path} className="hover:text-[var(--text-primary)] transition-colors">
                                        {crumb.name}
                                    </Link>
                                )}
                                {!isLast && <span aria-hidden="true">:</span>}
                            </li>
                        );
                    })}
                </ol>
            </Container>
        </nav>
    );
}
