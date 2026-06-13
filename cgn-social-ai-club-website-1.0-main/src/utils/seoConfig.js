export const SITE_URL = 'https://cgn-socialaiclub.de';

export const ROUTE_SEO = {
    '/': {
        title: "Cologne's Leading Student Initiative for AI & Social Impact",
        description: "CGN Social AI Club is a student-led initiative in Cologne building AI projects for social impact and sustainability with nonprofits and NGOs.",
        changefreq: 'weekly',
        priority: '1.0',
    },
    '/projects': {
        title: 'Cologne AI for Good Projects | Student Consulting',
        description: 'Explore AI for Good projects in Cologne. We build machine learning solutions for nonprofits and social organizations, driving environmental and social sustainability.',
        changefreq: 'monthly',
        priority: '0.8',
    },
    '/team': {
        title: 'CGN AI Student Community in Cologne',
        description: 'Meet the diverse student community behind Cologne’s leading AI initiative. From engineering to project management, discover the team at CGN Social AI Club.',
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
        title: 'Partner with Cologne’s AI Student Club | Impact Partners',
        description: 'Join our ecosystem of impact partners and support student-led AI for good projects in Cologne.',
        changefreq: 'monthly',
        priority: '0.7',
    },
    '/contact': {
        title: 'Contact Cologne Student AI Initiative',
        description: 'Reach out to CGN Social AI Club in Cologne for AI collaborations, nonprofit partnerships, student membership, and entrepreneurship opportunities.',
        changefreq: 'monthly',
        priority: '0.6',
    },
    '/application': {
        title: 'Apply to Join Cologne’s AI Student Club',
        description: 'Join Germany’s leading AI student initiative in Cologne. Explore the member journey at CGN Social AI Club.',
        changefreq: 'monthly',
        priority: '0.6',
    },
    '/privacy': {
        title: 'Privacy Policy',
        description: 'Privacy policy for CGN Social AI Club members and website visitors in Cologne.',
        changefreq: 'yearly',
        priority: '0.1',
    },
    '/imprint': {
        title: 'Imprint',
        description: 'Imprint and legal notice for CGN Social AI Club e.V.',
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
