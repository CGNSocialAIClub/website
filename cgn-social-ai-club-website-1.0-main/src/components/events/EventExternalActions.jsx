import Button from '../ui/Button';
import {eventActionLinks} from './eventActions.mjs';

export default function EventExternalActions({event,locale,now,includePast=false,variant}) {
  return eventActionLinks(event,locale,now,includePast).map(link=><Button key={link.key} href={link.href} variant={variant || link.variant}
    target={link.external?'_blank':undefined} rel={link.external?'noopener noreferrer':undefined}>
    {link.label}
  </Button>);
}
