import { Linkedin, Mail, Github, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '../../i18n/LocaleContext';
import { assetUrl } from '../../utils/assetUrl';

export default function TeamMemberCard({ member, showDepartment = true, isSelected = false, onSelect, onSocialClick }) {
    const { t } = useLocale();
    const hasSocials = member.linkedin || member.github || member.email;
    const departmentLabel = t.departments.names[member.department] || member.department;

    const handleClick = () => {
        if (onSelect) {
            onSelect(isSelected ? null : member.id);
        }
    };

    const handleSocialClick = (event) => {
        event.stopPropagation();
        if (onSocialClick) {
            const allowed = onSocialClick();
            if (!allowed) {
                event.preventDefault();
            }
        }
    };

    const socialLinks = (
        <div className="flex items-center gap-2">
            {member.linkedin && (
                <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleSocialClick}
                    className="p-2 bg-white text-oxford-blue rounded-full hover:bg-blue-500 hover:text-white transition-colors  border border-[var(--border-subtle)]"
                >
                    <Linkedin className="w-4 h-4" />
                </a>
            )}
            {member.github && (
                <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleSocialClick}
                    className="p-2 bg-white text-oxford-blue rounded-full hover:bg-neutral-800 hover:text-white transition-colors border border-[var(--border-subtle)]"
                >
                    <Github className="w-4 h-4" />
                </a>
            )}
            {member.email && (
                <a
                    href={`mailto:${member.email}`}
                    onClick={handleSocialClick}
                    className="p-2 bg-white text-oxford-blue rounded-full hover:bg-teal-500 hover:text-white transition-colors border border-[var(--border-subtle)]"
                >
                    <Mail className="w-4 h-4" />
                </a>
            )}
        </div>
    );

    return (
        <motion.div
            layout
            onClick={handleClick}
            className={`group relative h-full shadow-lg border border-[var(--border-subtle)] hover:bg-[var(--active-overlay)] rounded-3xl p-3 cursor-pointer flex flex-col w-full transition-colors duration-300 ${isSelected ? 'bg-[var(--active-overlay)]' : 'bg-[var(--bg-surface)]'}`}
        >
            {/* Image Container */}
            <div className="aspect-square w-full overflow-hidden bg-[var(--bg-surface-subtle)] relative rounded-xl mb-4 flex-shrink-0">
                {member.image ? (
                    <>
                        <img
                            src={assetUrl(member.image)}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            style={{
                                transform: member.zoom ? `scale(${member.zoom})` : undefined,
                                objectPosition: (member.offsetX !== undefined || member.offsetY !== undefined)
                                    ? `${member.offsetX !== undefined ? ((member.offsetX + 100) / 2) + '%' : '50%'} ${member.offsetY !== undefined ? ((member.offsetY + 100) / 2) + '%' : '50%'}`
                                    : 'center',
                            }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                }
                            }}
                            loading="lazy"
                        />
                        <div className="hidden absolute inset-0 items-center justify-center bg-[var(--bg-surface-subtle)]">
                            <User className="w-16 h-16 text-[var(--text-secondary)]" />
                        </div>
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-surface-subtle)]">
                        <User className="w-16 h-16 text-[var(--text-secondary)] opacity-40" />
                    </div>
                )}

                {/* Desktop-only: Social Overlay on image */}
                {hasSocials && (
                    <div className={`hidden md:flex absolute inset-0 bg-black/60 transition-opacity duration-300 items-center justify-center gap-4 backdrop-blur-[2px] ${isSelected ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'}`}>
                        {member.linkedin && (
                            <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleSocialClick}
                                className="p-2 bg-white text-oxford-blue rounded-full hover:bg-blue-500 hover:text-white transition-colors shadow-md"
                            >
                                <Linkedin className="w-5 h-5" />
                            </a>
                        )}
                        {member.github && (
                            <a
                                href={member.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleSocialClick}
                                className="p-2 bg-white text-oxford-blue rounded-full hover:bg-neutral-800 hover:text-white transition-colors shadow-md"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                        )}
                        {member.email && (
                            <a
                                href={`mailto:${member.email}`}
                                onClick={handleSocialClick}
                                className="p-2 bg-white text-oxford-blue rounded-full hover:bg-teal-500 hover:text-white transition-colors shadow-md"
                            >
                                <Mail className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1">
                <div className="mb-0 flex flex-col justify-start">
                    <h3 className="font-semibold text-base font-heading leading-[1.2] mb-0.5 transition-colors text-[var(--text-primary)]">
                        {member.name}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] font-medium leading-[1.2]">
                        {member.role}
                    </p>
                </div>
                {showDepartment && (
                    <div className="mt-auto pt-2 flex">
                        <span className="inline-block px-3 py-1 rounded-full bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] text-[10px] font-medium border border-[var(--border-subtle)] uppercase tracking-wide leading-none">
                            {departmentLabel}
                        </span>
                    </div>
                )}

                {/* Mobile-only: Social links below department */}
                <AnimatePresence>
                    {isSelected && hasSocials && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden md:hidden"
                        >
                            <div className="pt-3">
                                {socialLinks}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
