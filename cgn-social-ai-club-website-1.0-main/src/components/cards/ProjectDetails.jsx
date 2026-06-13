import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import styles from './ProjectDetails.module.css';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion as m } from 'framer-motion';
import { useLocale } from '../../i18n/LocaleContext';

export default function ProjectDetails({ project, author, onClose }) {
  const { t } = useLocale();
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef(null);

  const triggerClose = useCallback(() => {
    setIsClosing((prev) => {
      if (prev) return prev;
      closeTimerRef.current = setTimeout(() => {
        onClose();
      }, 220);
      return true;
    });
  }, [onClose]);

  useEffect(() => {
    // Block background scroll
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        triggerClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [triggerClose]);
  if (!project) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={triggerClose}
    >
      <motion.div
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 40 }}
        animate={isClosing ? { opacity: 1, y: '100%' } : { opacity: 1, y: 0 }}
        transition={isClosing
          ? { duration: 0.22, ease: [0.32, 0, 0.67, 0] }
          : { duration: 0.13, type: 'spring', damping: 30 }}
        className="relative bg-[var(--bg-surface)] shadow-2xl w-full md:max-w-4xl h-[92svh] md:h-auto md:max-h-[90vh] overflow-hidden flex flex-col rounded-t-3xl rounded-b-none md:rounded-3xl min-h-0"
      >
        <m.button
          onClick={triggerClose}
          whileTap={{ scale: 0.95 }}
          className="absolute top-4 right-4 z-20 w-11 h-11 flex items-center justify-center rounded-xl bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] hover:brightness-95 dark:hover:brightness-110 text-2xl transition-all duration-300 shadow-md hover:shadow-lg active:shadow-sm cursor-pointer"
          aria-label={t.projects.close}
          type="button"
        >
          <ChevronDown className="w-5 h-5" />
        </m.button>

        <motion.div
          className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center cursor-grab active:cursor-grabbing"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(_, info) => {
            if (info.offset.y > 80 || info.velocity.y > 600) {
              triggerClose();
            }
          }}
          style={{ touchAction: 'none' }}
        >
          <span className="h-1.5 w-12 rounded-full bg-[var(--border-strong)]" />
        </motion.div>

        <div
          className="overflow-y-auto flex-1 min-h-0 pb-16"
          style={{ touchAction: 'pan-y' }}
        >
          {project.image && (
            <div className="px-8 pt-8">
              <div className={`w-full h-52 md:h-64 overflow-hidden rounded-xl ${project.isLogo ? 'bg-white' : 'bg-[var(--bg-surface-subtle)]'}`}>
                <img
                  src={project.image}
                  alt={project.title}
                  className={`w-full h-full ${project.isLogo ? 'object-contain p-10' : 'object-cover'}`}
                  loading="lazy"
                />
              </div>
            </div>
          )}

          <div className="p-8">
          <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] m-0 leading-tight mb-6">
            {project.title}
          </h2>

          <div className="mb-6">
            <div className="flex justify-between items-end mb-2">
              <div className="flex-1" />
              <div className="text-sm text-[var(--text-secondary)] text-right">
                {project.date}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {author?.image && (
                <img
                  src={author.image}
                  alt={author.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[var(--border-default)]"
                  style={{ objectPosition: (author.offsetX !== undefined || author.offsetY !== undefined) ? `${((author.offsetX ?? 0) + 100) / 2}% ${((author.offsetY ?? 0) + 100) / 2}%` : 'center' }}
                  loading="lazy"
                />
              )}
              <div className="flex flex-col">
                <div className="text-xs text-[var(--text-tertiary)] font-semibold uppercase">{t.projects.authorLabel}</div>
                <div className="font-semibold text-[var(--text-primary)]">{author?.name}</div>
                <div className="text-xs text-[var(--text-secondary)]">{author?.role}</div>
              </div>
            </div>
          </div>
                <article className={`max-w-none text-[var(--text-secondary)] ${styles['project-article']}`}>
            <ReactMarkdown>{project.content}</ReactMarkdown>
          </article>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
