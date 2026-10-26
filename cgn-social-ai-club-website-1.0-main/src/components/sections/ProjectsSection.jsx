import React, { useState } from 'react';
import Container from '../ui/Container';
import SectionLabel from '../ui/SectionLabel';
import ProjectCard from '../cards/ProjectCard';
import ProjectDetails from '../cards/ProjectDetails';
import useAlignedEventRows from '../events/useAlignedEventRows';
import { getProjects } from '../../utils/cms';
import { PROJECT_DETAILS_ENABLED } from '../../config/features';
import { useLocale } from '../../i18n/LocaleContext';

const ProjectsSection = () => {
    const { t, locale } = useLocale();
    const projectGridRoot = useAlignedEventRows('cards', locale);
    const projectData = getProjects(locale);
    const [selectedProject, setSelectedProject] = useState(null);

    return (
        <section ref={projectGridRoot} id="projects" className="w-full">
            <Container className="section-block">
                <div className="flex flex-col items-center text-center mb-10 md:mb-12 px-2">
                    <SectionLabel>{t.home.featuredProjectsBadge}</SectionLabel>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--text-primary)] font-heading">{t.home.featuredProjectsTitle}</h2>
                </div>
                <div className="project-article-grid grid grid-cols-1 min-[520px]:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projectData.map((project, index) => (
                        <div key={project.id} className={`h-full ${index === projectData.length - 1
                            ? `${projectData.length % 2 === 1 ? 'min-[520px]:max-lg:col-span-2 min-[520px]:max-lg:w-[calc((100%-1.5rem)/2)] min-[520px]:max-lg:justify-self-center' : ''} ${projectData.length % 3 === 1 ? 'lg:col-start-2' : ''}`
                            : ''}`}>
                            {project.id === '6'
                                ? <ProjectCard project={project} onClick={() => { window.location.href = '/social-partners'; }} />
                                : <ProjectCard
                                    project={project}
                                    onClick={PROJECT_DETAILS_ENABLED && project.hasArticle ? () => setSelectedProject(project) : undefined}
                                />}
                        </div>
                    ))}
                </div>
                {PROJECT_DETAILS_ENABLED && selectedProject && (
                    <ProjectDetails
                        project={selectedProject}
                        author={selectedProject.author}
                        onClose={() => setSelectedProject(null)}
                    />
                )}
            </Container>
        </section>
    );
};

export default ProjectsSection;
