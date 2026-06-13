import TiltedCard from '../ui/TiltedCard';
import { useLocale } from '../../i18n/LocaleContext';

export default function ProjectCard({ project, onClick }) {
    const { t } = useLocale();
    const statusStyles = {
        Active: 'bg-teal-500/35 text-white border-teal-500/40',
        Upcoming: 'bg-blue-500/35 text-white border-blue-500/40',
        default: 'bg-slate-500/35 text-white border-slate-500/40',
    };

    const badgeClass = statusStyles[project.status] || statusStyles.default;
    const isClickable = typeof onClick === 'function';

    return (
        <TiltedCard
            containerHeight="100%"
            containerWidth="100%"
            rotateAmplitude={0}
            scaleOnHover={1}
            showMobileWarning={false}
            showTooltip={false}
            onClick={isClickable ? onClick : undefined}
        >
            <div
                className={`group bg-[var(--bg-surface)] shadow-lg rounded-3xl overflow-hidden transition-all duration-300 flex flex-col h-full ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
            >
                {/* Image Wrapper with Padding */}
                <div className="p-4 pb-0">
                    <div className={`h-48 w-full relative overflow-hidden rounded-xl border border-[var(--border-subtle)] ${project.isLogo ? 'bg-white' : 'bg-[var(--bg-surface-subtle)]'}`}>
                        {project.image ? (
                            <img
                                src={project.image}
                                alt={project.title}
                                className={`w-full h-full transition-transform duration-700 group-hover:scale-110 ${project.isLogo
                                    ? 'object-contain p-10'
                                    : 'object-cover'
                                    }`}
                                loading="lazy"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] ${project.image ? 'hidden' : 'flex'}`}>
                            <span className="text-sm font-medium">{t.projects.fallbackImage}</span>
                        </div>

                        <div className="absolute top-4 right-4 z-10 pointer-events-none">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${badgeClass}`}>
                                {t.projects.statuses[project.status] || project.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 pt-6 pb-4 flex flex-col flex-grow">
                    <div className="mb-4">
                        <h3 className="text-3xl font-bold text-[var(--text-primary)] group-hover:text-[#4A98FF] transition-colors font-heading">{project.title}</h3>
                    </div>

                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6 flex-grow">
                        {project.description}
                    </p>

                    <div className="mt-auto pt-4">
                        <div className="flex flex-wrap gap-2">
                            {project.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] text-xs rounded-full border border-[var(--border-subtle)]">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </TiltedCard>
    );
}
