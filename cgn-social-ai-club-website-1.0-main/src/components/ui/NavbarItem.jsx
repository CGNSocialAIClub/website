import Button from './Button';

export default function NavbarItem({ href, children, className = "", onClick }) {
    return (
        <Button
            variant="tertiary"
            href={href}
            onClick={onClick}
            className={`px-4 py-2 ${className}`}
        >
            {children}
        </Button>
    );
}
