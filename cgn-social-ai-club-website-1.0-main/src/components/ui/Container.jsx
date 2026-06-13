export default function Container({ children, className = "" }) {
    return (
        <div className={`mx-auto w-full max-w-screen-2xl px-4 ${className}`}>
            {children}
        </div>
    );
}
