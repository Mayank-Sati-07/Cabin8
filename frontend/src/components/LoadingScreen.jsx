import { motion } from 'framer-motion';

const blobShapes = [
  '62% 38% 57% 43% / 41% 51% 49% 59%',
  '41% 59% 63% 37% / 56% 44% 56% 44%',
  '53% 47% 34% 66% / 63% 46% 54% 37%',
  '62% 38% 57% 43% / 41% 51% 49% 59%',
];

/**
 * Full-screen branded takeover used for auth transitions and the rare
 * first-time route-chunk fetch. A morphing "liquid" blob carries the
 * loading motif used elsewhere (cursor, dashboard reveals).
 */
export default function LoadingScreen({ label = 'Loading Cabin8...' }) {
  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="loading-screen-inner">
        <motion.div
          className="loading-screen-blob"
          animate={{ borderRadius: blobShapes, rotate: [0, 12, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span>C8</span>
        </motion.div>
        <motion.p
          className="loading-screen-label"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          {label}
        </motion.p>
      </div>
    </motion.div>
  );
}
