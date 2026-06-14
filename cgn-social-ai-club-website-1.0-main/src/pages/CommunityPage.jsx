import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import Container from '../components/ui/Container';
import HeadingSection from '../components/ui/HeadingSection';
import TeamMemberCard from '../components/cards/TeamMemberCard';
import CTASection from '../components/sections/CTASection';
import Button from '../components/ui/Button';
import { getTeamMembers } from '../utils/cms';
import Seo from '../components/ui/Seo';
import { useLocale } from '../i18n/LocaleContext';

/** Wraps a member card so it animates in/out by row (line by line) when scrolling. */
function AnimatedMemberCardWrapper({ children, rowIndex, className = '' }) {
    const delay = rowIndex * 0.05;
    return (
        <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15, delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Community definitions with order and descriptions
const communityConfig = [
    {
        id: 'members',
        filter: (m) => m.status === 'active member',
        sortFn: (a, b) => {
            // Define hierarchy order
            const getRank = (m) => {
                if (m.department === 'Management Board') return 0;
                if (m.name === 'Karthik Gudibanda') return 1;
                if (m.role === 'Team Lead') return 2;
                if (m.name === 'Nikita Zubairov') return 3;
                if (m.department === 'Advisory') return 4;
                return 5; // Ordinary Members
            };

            const rankA = getRank(a);
            const rankB = getRank(b);

            if (rankA !== rankB) return rankA - rankB;

            // Secondary sort for Management Board based on specific roles
            if (rankA === 0) {
                const roleOrder = [
                    'Head of Strategy',
                    'Head of Growth',
                    'Head of AI Projects',
                    'Head of Community'
                ];
                const aIndex = roleOrder.indexOf(a.role);
                const bIndex = roleOrder.indexOf(b.role);
                if (aIndex !== bIndex) return aIndex - bIndex;
            }

            // Default: alphabetical by name (First Name)
            return a.name.localeCompare(b.name);
        }
    }
];

function CommunitySection({ configuration, members, showCommunityLabels, selectedMemberId, onSelectMember, onSocialClick }) {
    const [numCols, setNumCols] = React.useState(1);
    const containerRef = React.useRef(null);

    React.useEffect(() => {
        const updateCols = () => {
            if (!containerRef.current) return;
            const width = containerRef.current.offsetWidth;
            if (width < 640) {
                setNumCols(2); // Mobile: w-[calc(50%-8px)] -> 2 cols
            } else if (width < 768) {
                // Tablet: ~200px cards + 24px gap
                setNumCols(Math.floor((width + 24) / 224));
            } else {
                // Desktop: ~220px cards + 32px gap
                setNumCols(Math.floor((width + 32) / 252));
            }
        };

        updateCols();
        window.addEventListener('resize', updateCols);
        return () => window.removeEventListener('resize', updateCols);
    }, []);

    if (members.length === 0) return null;

    const normalizeDepartment = (department) => {
        if (department === 'Events' || department === 'HR & Recruiting') return 'Community';
        return department;
    };

    // Filter and sort members
    const boardMembers = members.filter(m => m.department === 'Management Board');
    
    // Departments for sorting team leads
    const deptOrder = [
        'Engineering',
        'Social Partnerships',
        'Strategic Partnerships',
        'Community',
        'Marketing',
        'Finance Legal Admin'
    ];

    const featuredMembers = members.filter(m => m.name === 'Karthik Gudibanda');
    const advisoryBoardMembers = members.filter(m => m.department === 'Advisory');
    const nonBoardMembers = members.filter(m => m.department !== 'Management Board' && m.department !== 'Advisory' && m.name !== 'Karthik Gudibanda');
    
    const teamLeads = nonBoardMembers.filter(m => m.role === 'Team Lead');
    const justMembers = nonBoardMembers.filter(m => m.role !== 'Team Lead');

    teamLeads.sort((a, b) => {
        const orderA = deptOrder.indexOf(normalizeDepartment(a.department));
        const orderB = deptOrder.indexOf(normalizeDepartment(b.department));
        if (orderA === -1 && orderB === -1) return 0;
        if (orderA === -1) return 1;
        if (orderB === -1) return -1;
        return orderA - orderB;
    });

    const otherMembers = [...featuredMembers, ...teamLeads, ...advisoryBoardMembers, ...justMembers];
    const boardRows = boardMembers.length > 0 ? Math.ceil(boardMembers.length / numCols) : 0;
    const splitForOrphan = (items) => {
        if (numCols <= 2 || items.length <= 1 || items.length % numCols !== 1) {
            return [items, []];
        }
        return [items.slice(0, -2), items.slice(-2)];
    };
    const [otherPrimary, otherTail] = splitForOrphan(otherMembers);
    const otherPrimaryRows = otherPrimary.length > 0 ? Math.ceil(otherPrimary.length / numCols) : 0;

    return (
        <section
            id={configuration.id}
            className="w-full"
        >


            <div ref={containerRef} className="w-full">
                {/* Management Board */}
                {boardMembers.length > 0 && (
                    <div className={`mx-auto grid w-full max-w-[724px] grid-cols-2 justify-center gap-4 sm:gap-6 md:gap-8 md:grid-cols-3 ${boardMembers.some(m => m.id === selectedMemberId) ? 'items-start' : 'items-stretch'}`}>
                        {boardMembers.map((member, idx) => {
                            const rowIndex = Math.floor(idx / numCols);
                            return (
                                <AnimatedMemberCardWrapper
                                    key={`board-${member.id}-${idx}`}
                                    rowIndex={rowIndex}
                                    className="flex w-full self-start"
                                >
                                    <TeamMemberCard member={member} showDepartment={showCommunityLabels} isSelected={selectedMemberId === member.id} onSelect={onSelectMember} onSocialClick={onSocialClick} />
                                </AnimatedMemberCardWrapper>
                            );
                        })}
                    </div>
                )}

                {/* Members (Advisory first, then others) */}
                {otherMembers.length > 0 && (
                    <div className={`${boardMembers.length > 0 ? 'mt-4 sm:mt-6 md:mt-8' : ''}`}>
                        <div className={`flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 ${otherPrimary.some(m => m.id === selectedMemberId) ? 'items-start' : 'items-stretch'}`}>
                            {otherPrimary.map((member, idx) => {
                                const rowIndex = boardRows + Math.floor(idx / numCols);
                                return (
                                    <AnimatedMemberCardWrapper
                                        key={`member-primary-${member.id}-${idx}`}
                                        rowIndex={rowIndex}
                                        className="flex w-[calc(50%-8px)] sm:w-[200px] md:w-[220px] self-start"
                                    >
                                        <TeamMemberCard member={member} showDepartment={showCommunityLabels} isSelected={selectedMemberId === member.id} onSelect={onSelectMember} onSocialClick={onSocialClick} />
                                    </AnimatedMemberCardWrapper>
                                );
                            })}
                        </div>

                        {otherTail.length > 0 && (
                            <div className={`mt-4 sm:mt-6 md:mt-8 flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 ${otherTail.some(m => m.id === selectedMemberId) ? 'items-start' : 'items-stretch'}`}>
                                {otherTail.map((member, idx) => {
                                    const rowIndex = boardRows + otherPrimaryRows + Math.floor(idx / numCols);
                                    return (
                                        <AnimatedMemberCardWrapper
                                            key={`member-tail-${member.id}-${idx}`}
                                            rowIndex={rowIndex}
                                            className="flex w-[calc(50%-8px)] sm:w-[200px] md:w-[220px] self-start"
                                        >
                                            <TeamMemberCard member={member} showDepartment={showCommunityLabels} isSelected={selectedMemberId === member.id} onSelect={onSelectMember} onSocialClick={onSocialClick} />
                                        </AnimatedMemberCardWrapper>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}

export default function CommunityPage() {
    const { t } = useLocale();
    const allMembers = getTeamMembers();
    const [showCommunityLabels, setShowCommunityLabels] = useState(true);
    const [selectedMemberId, setSelectedMemberId] = useState(null);

    const VIEW_LIMIT_PER_DAY = 5;
    const VIEW_STORAGE_KEY = 'community_member_views';
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    const [limitModalStep, setLimitModalStep] = useState('prompt'); // 'prompt' | 'student' | 'recruiter'
    const CHOICE_STORAGE_KEY = 'community_member_limit_choice';
    const CHOICE_TTL_MS = 60 * 60 * 1000;
    const LIMIT_MODAL_VARIANTS = {
        prompt: {
            title: t.pages.community.limitPromptTitle,
            description: t.pages.community.limitPromptDescription
        },
        student: {
            title: t.pages.community.limitStudentTitle,
            description: t.pages.community.limitStudentDescription,
            ctaLabel: t.pages.community.limitApply,
            ctaHref: '/application'
        },
        recruiter: {
            title: t.pages.community.limitRecruiterTitle,
            description: t.pages.community.limitRecruiterDescription,
            ctaLabel: t.pages.community.limitPartner,
            ctaHref: '/sponsors'
        }
    };

    const getTodayKey = () => new Date().toISOString().slice(0, 10);
    const getSavedChoice = () => {
        try {
            const raw = sessionStorage.getItem(CHOICE_STORAGE_KEY);
            if (!raw) return null;

            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed.choice !== 'string' || typeof parsed.expiresAt !== 'number') {
                sessionStorage.removeItem(CHOICE_STORAGE_KEY);
                return null;
            }

            if (Date.now() > parsed.expiresAt) {
                sessionStorage.removeItem(CHOICE_STORAGE_KEY);
                return null;
            }

            return parsed.choice;
        } catch (error) {
            try {
                sessionStorage.removeItem(CHOICE_STORAGE_KEY);
            } catch (storageError) {
                // Ignore storage errors.
            }
            return null;
        }
    };

    const isUnlimitedStudent = () => getSavedChoice() === 'student';
    const saveChoice = (choice) => {
        try {
            sessionStorage.setItem(
                CHOICE_STORAGE_KEY,
                JSON.stringify({
                    choice,
                    expiresAt: Date.now() + CHOICE_TTL_MS,
                })
            );
        } catch (error) {
            // Ignore storage errors.
        }
    };

    const clearSavedChoice = () => {
        try {
            sessionStorage.removeItem(CHOICE_STORAGE_KEY);
            // Remove potential legacy persistence from previous implementations.
            localStorage.removeItem(CHOICE_STORAGE_KEY);
        } catch (error) {
            // Ignore storage errors.
        }
    };

    useEffect(() => {
        // Cleanup once on mount if a stale/legacy value exists.
        const saved = getSavedChoice();
        if (!saved) {
            clearSavedChoice();
        }
    }, []);

    const canOpenMember = () => {
        try {
            if (isUnlimitedStudent()) {
                return true;
            }
            const today = getTodayKey();
            const raw = localStorage.getItem(VIEW_STORAGE_KEY);
            const stored = raw ? JSON.parse(raw) : null;
            if (!stored || stored.date !== today) {
                localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
                return true;
            }
            return stored.count < VIEW_LIMIT_PER_DAY;
        } catch (error) {
            return true;
        }
    };

    const incrementViewCount = () => {
        try {
            if (isUnlimitedStudent()) {
                return;
            }
            const today = getTodayKey();
            const raw = localStorage.getItem(VIEW_STORAGE_KEY);
            const stored = raw ? JSON.parse(raw) : { date: today, count: 0 };
            const next = stored.date === today
                ? { date: today, count: stored.count + 1 }
                : { date: today, count: 1 };
            localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(next));
        } catch (error) {
            // Ignore storage errors; allow interaction.
        }
    };

    const handleSelectMember = (memberId) => {
        if (!memberId) {
            setSelectedMemberId(null);
            return;
        }

        setSelectedMemberId(memberId);
    };

    const handleSocialClick = () => {
        if (!canOpenMember()) {
            const savedChoice = getSavedChoice();
            if (savedChoice === 'student' || savedChoice === 'recruiter') {
                setLimitModalStep(savedChoice);
            } else {
                setLimitModalStep('prompt');
            }
            setIsLimitModalOpen(true);
            return false;
        }
        incrementViewCount();
        return true;
    };

    const handleLimitChoice = (choice) => {
        saveChoice(choice);
        if (choice === 'student') {
            setLimitModalStep('student');
        } else {
            setLimitModalStep('recruiter');
        }
    };

    // Process community sections
    const communitySections = communityConfig.map(config => {
        let members = allMembers.filter(member => config.filter(member));
        if (config.sortFn) {
            members = members.sort(config.sortFn);
        } else {
            members = members.sort((a, b) => a.name.localeCompare(b.name));
        }
        return { ...config, members };
    });

    return (
        <div className="flex flex-col items-center pt-0 pb-12">
            <Seo title={t.pages.community.membersTitle} description={t.pages.community.membersSubtitle} />
            <Container>
                {/* Members Hero Header */}
                <div>
                    <HeadingSection
                        as="h1"
                        badge={t.pages.community.membersBadge}
                        title={t.pages.community.membersTitle}
                        subtitle={t.pages.community.membersSubtitle}
                        className=""
                    />
                </div>

                {/* Community Sections */}
                <div className="space-y-24 mb-24">
                    {communitySections.map((section) => (
                        <CommunitySection
                            key={section.id}
                            configuration={section}
                            members={section.members}
                            showCommunityLabels={showCommunityLabels}
                            selectedMemberId={selectedMemberId}
                            onSelectMember={handleSelectMember}
                            onSocialClick={handleSocialClick}
                        />
                    ))}
                </div>
                <CTASection variant="members" />
            </Container>
            {isLimitModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="relative w-full max-w-md rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl p-6 text-left flex flex-col gap-6">
                        <button
                            type="button"
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[var(--bg-surface-subtle)] border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--hover-overlay)] transition-colors flex items-center justify-center"
                            onClick={() => setIsLimitModalOpen(false)}
                            aria-label={t.pages.community.close}
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-start justify-between pr-12">
                            <h3 className="text-2xl md:text-3xl leading-tight font-bold text-[var(--text-primary)] font-heading">
                                {LIMIT_MODAL_VARIANTS[limitModalStep].title}
                            </h3>
                        </div>
                        <p className="text-[var(--text-secondary)]">
                            {LIMIT_MODAL_VARIANTS[limitModalStep].description}
                        </p>
                        {limitModalStep === 'prompt' ? (
                            <div className="flex gap-3">
                                <Button variant="primary" className="flex-1" onClick={() => handleLimitChoice('student')}>
                                    {t.pages.community.limitStudentButton}
                                </Button>
                                <Button variant="primary" className="flex-1" onClick={() => handleLimitChoice('recruiter')}>
                                    {t.pages.community.limitRecruiterButton}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Button
                                    variant="primary"
                                    href={LIMIT_MODAL_VARIANTS[limitModalStep].ctaHref}
                                    className="w-full"
                                    onClick={() => setIsLimitModalOpen(false)}
                                >
                                    {LIMIT_MODAL_VARIANTS[limitModalStep].ctaLabel}
                                </Button>
                                {limitModalStep === 'student' && (
                                    <Button
                                        variant="tertiary"
                                        className="w-full"
                                        onClick={() => setIsLimitModalOpen(false)}
                                    >
                                        {t.pages.community.limitExplore}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
