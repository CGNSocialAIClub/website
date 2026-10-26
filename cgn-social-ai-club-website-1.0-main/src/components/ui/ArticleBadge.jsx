import { motion } from 'framer-motion';

export default function ArticleBadge({ category, children, className = '', ...props }) {
  return <motion.span data-event-category={category} className={`article-badge ${className}`} {...props}>
    {children ?? (category || '').toUpperCase()}
  </motion.span>;
}
