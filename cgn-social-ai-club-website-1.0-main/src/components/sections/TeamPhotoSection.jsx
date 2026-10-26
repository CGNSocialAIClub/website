import OptimizedImage from '../ui/OptimizedImage.jsx';
import React from 'react';
import Container from '../ui/Container';
import { useLocale } from '../../i18n/LocaleContext';
import { assetUrl } from '../../utils/assetUrl';

const TeamPhotoSection = () => {
    const { t } = useLocale();

    return (
        <section id="team-photo" className="w-full">
            <Container className="mb-10">
                <div className="relative w-full aspect-[4/3] md:aspect-[21/9] overflow-hidden rounded-[1.5rem]">
                    <OptimizedImage
                        src="/cms/team/founding_pic.jpg"
                        sizes="(max-width: 1536px) 100vw, 1536px"
                        alt={t.home.teamPhotoAlt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />

                </div>
            </Container>
        </section>
    );
};

export default TeamPhotoSection;
