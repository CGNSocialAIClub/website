import React, { useState } from 'react';
import Container from '../ui/Container';
import SectionLabel from '../ui/SectionLabel';
import ProjectCard from '../cards/ProjectCard';
import ProjectDetails from '../cards/ProjectDetails';
import { getProjects } from '../../utils/cms';
import { PROJECT_DETAILS_ENABLED } from '../../config/features';
import { useLocale } from '../../i18n/LocaleContext';

const ProjectsSection = () => {
    const { t, locale } = useLocale();
    const projectData = getProjects(locale);
    const [selectedProject, setSelectedProject] = useState(null);
    return (
        <section id="projects" className="w-full">
            <Container className="mb-20">
                <div className="flex flex-col items-center text-center mb-10 md:mb-12 px-2">
                    <SectionLabel>{t.home.featuredProjectsBadge}</SectionLabel>
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[var(--text-primary)] font-heading">{t.home.featuredProjectsTitle}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projectData.map(project => (
                        project.id === '6'
                            ? <ProjectCard key={project.id} project={project} onClick={() => window.location.href = '/social-partners'} />
                            : <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={PROJECT_DETAILS_ENABLED && project.hasArticle ? () => setSelectedProject(project) : undefined}
                            />
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
