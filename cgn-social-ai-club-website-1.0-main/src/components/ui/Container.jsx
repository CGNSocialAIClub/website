export default function Container({ children, className = "" }) {
    return (
        <div data-content-container className={`mx-auto w-full max-w-[var(--content-max-width)] px-4 ${className}`}>
            {children}
        </div>
    );
}
