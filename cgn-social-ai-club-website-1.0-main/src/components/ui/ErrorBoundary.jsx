import React from 'react';
import { useLocale } from '../../i18n/LocaleContext';
import Container from './Container';
import Button from './Button';
import { RefreshCcw, AlertCircle } from 'lucide-react';

function ErrorFallback() {
    const { t } = useLocale();
    
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-md">
                <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[2rem] p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
                    
                    <div className="flex justify-center mb-6">
                        <div className="bg-red-500/10 p-4 rounded-2xl text-red-500">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-bold font-heading mb-4 text-[var(--text-primary)]">
                        {t.error.title}
                    </h1>
                    
                    <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                        {t.error.message}
                    </p>
                    
                    <Button 
                        variant="primary" 
                        className="w-full flex items-center justify-center gap-2 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => window.location.reload()}
                    >
                        <RefreshCcw className="w-5 h-5" />
                        {t.error.refresh}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            return <ErrorFallback />;
        }
        return this.props.children;
    }
}
