import Container from '../ui/Container';
import HeadingSection from '../ui/HeadingSection';
import TeamMemberCard from '../cards/TeamMemberCard';
import { getTeamMembers } from '../../utils/cms';
import { Link } from 'react-router-dom';

const normalizeDepartment = (department) => {
    if (department === 'Events' || department === 'HR & Recruiting') return 'Community';
    return department;
};

/**
 * Use memberIds for a curated order, departments for selected departments,
 * or omit both to show all active members with portraits.
 */
export default function MemberCarouselSection({
    badge,
    title,
    subtitle,
    memberIds = [],
    departments = [],
    status = 'active member',
    limit,
}) {
    const allMembers = getTeamMembers();
    const departmentSet = new Set(departments.map(normalizeDepartment));
    let members;

    if (memberIds.length > 0) {
        const membersById = new Map(allMembers.map((member) => [member.id, member]));
        members = memberIds.map((id) => membersById.get(id)).filter(Boolean);
    } else {
        members = allMembers.filter((member) => {
            const hasRequestedStatus = !status || member.status === status;
            const isRequestedDepartment = departmentSet.size === 0
                || departmentSet.has(normalizeDepartment(member.department));

            return hasRequestedStatus && isRequestedDepartment && member.image;
        });
    }

    if (Number.isFinite(limit)) members = members.slice(0, limit);
    if (members.length === 0) return null;

    const duration = Math.max(42, members.length * 5.5);
    const memberGroup = (copy) => (
        <div
            className="member-carousel-group flex shrink-0 gap-4 md:gap-6"
            aria-hidden={copy ? 'true' : undefined}
            inert={copy ? '' : undefined}
        >
            {members.map((member) => (
                <Link
                    key={`${copy ? 'copy' : 'member'}-${member.id}`}
                    to="/team"
                    className="w-[124px] shrink-0 sm:w-[136px] lg:w-[148px]"
                    aria-label={`${member.name.split(' ')[0]} on the team page`}
                    tabIndex={copy ? -1 : undefined}
                >
                    <TeamMemberCard
                        member={{ ...member, name: member.name.split(' ')[0] }}
                        imageLoading="eager"
                        interactive={false}
                        hoverable
                        showRole={false}
                    />
                </Link>
            ))}
        </div>
    );

    return (
        <section className="w-full overflow-hidden">
            <Container>
                <HeadingSection badge={badge} title={title} subtitle={subtitle} />
            </Container>

            <div className="member-carousel-viewport" aria-label={title}>
                <div
                    className="member-carousel-track"
                    style={{ '--member-scroll-duration': `${duration}s` }}
                >
                    {memberGroup(false)}
                    {memberGroup(true)}
                </div>
            </div>
        </section>
    );
}
