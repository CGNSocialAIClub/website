export const SITE_URL = 'https://tum-socialaiclub.de';

export const ROUTE_SEO = {
    '/': {
        title: "Munich's Leading Student Initiative for AI & Social Impact",
        description: "TUM Social AI Club is a premier Munich student initiative at TUM and LMU building AI projects for social impact and sustainability with global nonprofits and NGOs.",
        changefreq: 'weekly',
        priority: '1.0',
    },
    '/projects': {
        title: 'Munich AI for Good Projects | Student Consulting',
        description: 'Explore AI for Good projects in Munich. We build machine learning solutions for nonprofits and social organizations, driving environmental and social sustainability.',
        changefreq: 'monthly',
        priority: '0.8',
    },
    '/team': {
        title: 'TUM & LMU AI Student Community in Munich',
        description: 'Meet the diverse student community behind Munich’s leading AI initiative. From engineering to project management, discovers the team at TUM Social AI Club.',
        changefreq: 'monthly',
        priority: '0.7',
    },
    '/social-partners': {
        title: 'Nonprofit AI Partnerships | Social Impact Consulting',
        description: 'We offer AI consulting for social organizations and nonprofits. From challenge discovery to deployment, we build practical AI tools for environmental and social impact.',
        changefreq: 'monthly',
        priority: '0.8',
    },
    '/sponsors': {
        title: 'Partner with Munich’s AI Student Club | UnternehmerTUM & Partners',
        description: "Join our ecosystem alongside partners like UnternehmerTUM and Munich Urban Colab. Support Munich's student-led AI for good projects and impact tech.",
        changefreq: 'monthly',
        priority: '0.7',
    },
    '/contact': {
        title: 'Contact Munich Student AI Initiative',
        description: 'Reach out to the TUM Social AI Club in Munich for AI collaborations, nonprofit partnerships, student membership, and entrepreneurship opportunities.',
        changefreq: 'monthly',
        priority: '0.6',
    },
    '/application': {
        title: 'Apply to Join Munich’s AI Student Club',
        description: 'Join Germany’s leading AI student initiative. Explore the member journey at TUM and LMU, building AI for good and environmental impact in Munich.',
        changefreq: 'monthly',
        priority: '0.6',
    },
    '/privacy': {
        title: 'Privacy Policy',
        description: 'Privacy policy for TUM Social AI Club members and website visitors in Munich.',
        changefreq: 'yearly',
        priority: '0.1',
    },
    '/imprint': {
        title: 'Imprint',
        description: 'Imprint and legal notice for the TUM Social AI Club e.V. at the Technical University of Munich.',
        changefreq: 'yearly',
        priority: '0.1',
    },
    '/404': {
        title: 'Page Not Found',
        description: 'The requested page was not found.',
        noIndex: true,
    },
};

export function getSeoForPath(pathname = '/') {
    return ROUTE_SEO[pathname] || null;
}

export function getIndexableRoutes() {
    return Object.entries(ROUTE_SEO)
        .filter(([path, meta]) => path !== '/404' && !meta.noIndex)
        .map(([path, meta]) => ({
            path,
            changefreq: meta.changefreq || 'monthly',
            priority: meta.priority || '0.5',
        }));
}
