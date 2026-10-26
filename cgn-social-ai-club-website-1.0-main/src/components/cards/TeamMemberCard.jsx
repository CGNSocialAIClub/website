import AvatarPlaceholder from '../ui/AvatarPlaceholder';
import OptimizedImage from '../ui/OptimizedImage.jsx';
import { Linkedin, Mail, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '../../i18n/LocaleContext';
import { openSocialAppLink } from '../../utils/socialAppLinks';

export default function TeamMemberCard({ member, showDepartment = true, showRole = true, isSelected = false, onSelect, onSocialClick, imageLoading = 'lazy', interactive = true, hoverable = interactive }) {
    const { t } = useLocale();
    const hasSocials = interactive && (member.linkedin || member.github || member.email);
    const departmentLabel = t.departments.names[member.department] || member.department;

    const handleClick = () => {
        if (interactive && onSelect) {
            onSelect(isSelected ? null : member.id);
        }
    };

    const handleSocialClick = (event, href) => {
        event.stopPropagation();

        openSocialAppLink(event, href, {
            beforeOpen: () => !onSocialClick || onSocialClick(),
        });
    };

    const socialLinks = (
        <div className="flex items-center gap-2">
            {member.linkedin && (
                <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(event) => handleSocialClick(event, member.linkedin)}
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
                    onClick={(event) => handleSocialClick(event, member.github)}
                    className="p-2 bg-white text-oxford-blue rounded-full hover:bg-neutral-800 hover:text-white transition-colors border border-[var(--border-subtle)]"
                >
                    <Github className="w-4 h-4" />
                </a>
            )}
            {member.email && (
                <a
                    href={`mailto:${member.email}`}
                    onClick={(event) => handleSocialClick(event, `mailto:${member.email}`)}
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
            className={`group relative h-full shadow-lg border border-[var(--border-subtle)] rounded-3xl p-3 flex flex-col w-full transition-colors duration-300 ${hoverable ? 'cursor-pointer hover:bg-[var(--active-overlay)]' : ''} ${isSelected ? 'bg-[var(--active-overlay)]' : 'bg-[var(--bg-surface)]'}`}
        >
            {/* Image Container */}
            <div className="aspect-square w-full overflow-hidden bg-[var(--bg-surface-subtle)] relative rounded-xl mb-4 flex-shrink-0 isolate">
                {member.image ? (
                    <>
                        <OptimizedImage
                            src={member.image}
                            sizes="(max-width: 767px) 50vw, (max-width: 1100px) 33vw, 25vw"
                            alt={member.name}
                            className={`w-full h-full object-cover rounded-[inherit] ${hoverable ? 'transition-transform duration-500 group-hover:scale-105' : ''}`}
                            style={{
                                transform: member.zoom ? `scale(${member.zoom})` : undefined,
                                objectPosition: (member.offsetX !== undefined || member.offsetY !== undefined)
                                    ? `${member.offsetX !== undefined ? ((member.offsetX + 100) / 2) + '%' : '50%'} ${member.offsetY !== undefined ? ((member.offsetY + 100) / 2) + '%' : '50%'}`
                                    : 'center',
                            }}
                            fallback={<AvatarPlaceholder size="100%" style={{ position: 'absolute', inset: 0 }} />}
                            loading={imageLoading}
                        />

                    </>
                ) : (
                    <AvatarPlaceholder size="100%" style={{ position: 'absolute', inset: 0 }} />
                )}

                {/* Desktop-only: Social Overlay on image */}
                {hasSocials && (
                    <div className={`hidden md:flex absolute inset-0 rounded-[inherit] bg-black/60 transition-opacity duration-300 items-center justify-center gap-4 ${isSelected ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'}`}>
                        {member.linkedin && (
                            <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(event) => handleSocialClick(event, member.linkedin)}
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
                                onClick={(event) => handleSocialClick(event, member.github)}
                                className="p-2 bg-white text-oxford-blue rounded-full hover:bg-neutral-800 hover:text-white transition-colors shadow-md"
                            >
                                <Github className="w-5 h-5" />
                            </a>
                        )}
                        {member.email && (
                            <a
                                href={`mailto:${member.email}`}
                                onClick={(event) => handleSocialClick(event, `mailto:${member.email}`)}
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
                    {showRole && (
                        <p className="text-sm text-[var(--text-secondary)] font-medium leading-[1.2]">
                            {[...(member.additionalRoles || []), member.role].filter(Boolean).join(' & ')}
                        </p>
                    )}
                </div>
                {showDepartment && (
                    <div className="mt-auto pt-2 flex">
                        <span className="inline-block px-3 py-1 rounded-full bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] text-[length:var(--type-micro)] font-medium border border-[var(--border-subtle)] uppercase tracking-wide leading-none">
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
