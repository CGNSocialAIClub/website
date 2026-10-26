import Button from './Button';

export default function NavbarItem({ href, children, className = "", onClick, active = false }) {
    return (
        <Button
            variant="tertiary"
            href={href}
            onClick={onClick}
            aria-current={active ? 'page' : undefined}
            className={`navbar-page-link px-4 py-2 ${className}`}
        >
            {children}
        </Button>
    );
}
