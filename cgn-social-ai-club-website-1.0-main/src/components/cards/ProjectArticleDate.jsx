import { CalendarDays } from 'lucide-react';
import './ProjectArticleDate.css';

export default function ProjectArticleDate({date, mobileFooter=false}) {
  if(!date)return null;
  return <div className={`project-article-date ${mobileFooter ? 'project-article-date--footer' : 'project-article-date--header'} w-full text-[var(--text-secondary)] text-base`}>
    <p className="flex items-center gap-2 m-0"><CalendarDays aria-hidden="true" size={17}/><span>{date}</span></p>
  </div>;
}
