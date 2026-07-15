import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
    return (
        <div className="bg-page text-primary min-h-screen flex flex-col selection:bg-teal-500/30 transition-colors duration-500 overflow-x-hidden">
            <Navbar />
            <main className="flex-grow flex flex-col pt-24 overflow-x-hidden">
                {children}
            </main>
            <Footer />
        </div>
    );
}
