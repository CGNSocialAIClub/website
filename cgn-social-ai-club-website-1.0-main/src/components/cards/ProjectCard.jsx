import '../events/EventScene.css';
import '../../pages/EventsPage.css';
import { projectArticlePath } from '../../utils/contentRoutes';
import EventCard, { EventCardHeader } from '../events/EventCard';
import { rememberArticleCard } from '../../hooks/useArticleExpansion';
import TiltedCard from '../ui/TiltedCard';
import Button from '../ui/Button';
import { useLocale } from '../../i18n/LocaleContext';
import ProjectAvatarStack from './ProjectAvatarStack';
import './ProjectCard.css';

export function ProjectCardSummary({ project, metadata, actions, actionHref, onClick }) {
    const { t, locale } = useLocale();
    const opensArticle = project.hasArticle && typeof onClick === 'function';
    const contributors = [...(project.contributors || [])].sort((a, b) => Number(b.projectRole === 'lead') - Number(a.projectRole === 'lead'));
    return <div className="project-card-summary">
        {metadata}
        <p className="flex-grow text-[var(--text-secondary)] text-[length:var(--type-card-copy)] leading-relaxed">{project.description}</p>
        {actions || ((opensArticle || actionHref) && <div className="project-card-actions mt-4">
            <Button variant="always-white" href={actionHref || projectArticlePath(project)} onClick={event => {
                event.stopPropagation();
                if (!actionHref && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onClick(); }
            }}>{actionHref ? t.projects.startProject : t.projects.learnMore}</Button>
            <ProjectAvatarStack contributors={contributors} locale={locale} />
        </div>)}
    </div>;
}

export default function ProjectCard({ project, onClick, actionHref, metadata, actions, imageFit, imageAspect = '16 / 10', articleLayoutId }) {
    const isClickable = typeof onClick === 'function';
    const opensArticle = project.hasArticle && isClickable;
    const isCardClickable = isClickable && !opensArticle && !actionHref;

    return (
        <TiltedCard
            containerHeight="100%"
            containerWidth="100%"
            rotateAmplitude={0}
            scaleOnHover={1}
            showMobileWarning={false}
            showTooltip={false}
            onClick={isCardClickable ? onClick : undefined}
        >
            <EventCard event={{...project,articleKind:'project',id:`project-${project.id}`,imageFit:imageFit || project.imageFit || (project.isLogo?'contain':'cover')}} state="grid" morph={false}
                data-article-kind="project"
                onClickCapture={event => { if (opensArticle) rememberArticleCard(articleLayoutId || `project-article-${project.id}`, event.currentTarget); }}
                className={`project-article-source group bg-[var(--bg-surface)] shadow-lg rounded-3xl overflow-hidden flex flex-col h-full ${isCardClickable ? 'cursor-pointer' : 'cursor-default'}`}>
                <EventCardHeader
                    coverProps={{style:{aspectRatio:imageAspect || undefined,height:imageAspect?undefined:192}}}
                    badgeProps={{style:{position:'absolute',right:40,top:40,pointerEvents:'none'}}}
                    titleProps={{as:'h3',className:'font-bold leading-[1.05] text-[var(--text-primary)] font-heading'}}>
                    <ProjectCardSummary project={project} metadata={metadata} actions={actions} actionHref={actionHref} onClick={onClick}/>
                </EventCardHeader>
            </EventCard>
        </TiltedCard>
    );
}
