'use client';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import useKanaStore from '@/features/Kana/store/useKanaStore';
import useKanjiStore from '@/features/Kanji/store/useKanjiStore';
import useVocabStore from '@/features/Vocabulary/store/useVocabStore';
import usePreferencesStore from '@/features/Preferences/store/usePreferencesStore';
import { useClick } from '@/shared/hooks/useAudio';
import { Play, Zap, Swords } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import GameModes from '@/shared/components/Menu/GameModes';

// Gauntlet components with onCancel prop support
import GauntletKana from '@/features/Kana/components/Gauntlet';
import GauntletKanji from '@/features/Kanji/components/Gauntlet';
import GauntletVocab from '@/features/Vocabulary/components/Gauntlet';

interface ITopBarProps {
  currentDojo: string;
}

const TrainingActionBar: React.FC<ITopBarProps> = ({
  currentDojo
}: ITopBarProps) => {
  const hotkeysOn = usePreferencesStore(state => state.hotkeysOn);

  const { playClick } = useClick();

  // Modal state
  const [showGameModesModal, setShowGameModesModal] = useState(false);
  const [gameModesMode, setGameModesMode] = useState<
    'train' | 'blitz' | 'gauntlet'
  >('train');
  const [showGauntletModal, setShowGauntletModal] = useState(false);

  // Kana store
  const kanaGroupIndices = useKanaStore(state => state.kanaGroupIndices);

  // Kanji store
  const selectedKanjiObjs = useKanjiStore(state => state.selectedKanjiObjs);

  // Vocab store
  const selectedWordObjs = useVocabStore(state => state.selectedVocabObjs);

  const isFilled =
    currentDojo === 'kana'
      ? kanaGroupIndices.length !== 0
      : currentDojo === 'kanji'
        ? selectedKanjiObjs.length >= 10
        : currentDojo === 'vocabulary'
          ? selectedWordObjs.length >= 10
          : false;

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!hotkeysOn) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        return;

      if (event.key === 'Enter' && isFilled) {
        event.preventDefault();
        setShowGameModesModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hotkeysOn, isFilled]);

  const showBlitz =
    currentDojo === 'kana' ||
    currentDojo === 'vocabulary' ||
    currentDojo === 'kanji';

  const [layout, setLayout] = useState<{
    bottom: number;
    left: number | string;
    width: number | string;
  }>({
    bottom: 0,
    left: 0,
    width: '100%'
  });

  const placeholderRef = useRef<HTMLDivElement | null>(null);

  // Safe useLayoutEffect for SSR
  const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    const updateLayout = () => {
      const sidebar = document.getElementById('main-sidebar');
      const bottomBar = document.getElementById('main-bottom-bar');
      const width = window.innerWidth;

      let bottom = 0;
      let left: number | string = 0;
      let barWidth: number | string = '100%';

      // 1. Calculate Bottom Offset
      if (width < 1024) {
        // Mobile: Sidebar is at bottom
        if (sidebar) {
          bottom = sidebar.offsetHeight;
        }
      } else {
        // Desktop: BottomBar is at bottom
        if (bottomBar) {
          bottom = bottomBar.offsetHeight;
        }
      }

      // 2. Calculate Horizontal Layout
      if (width >= 1024) {
        // Desktop: Stretch from sidebar's right edge to viewport right edge
        if (sidebar) {
          const sidebarRect = sidebar.getBoundingClientRect();
          left = sidebarRect.right;
          barWidth = width - sidebarRect.right;
        }
      } else {
        // Mobile: Full width
        left = 0;
        barWidth = '100%';
      }

      setLayout({ bottom, left, width: barWidth });
    };

    // Initial update
    updateLayout();

    // Setup ResizeObserver on sidebar for layout changes
    let observer: ResizeObserver | null = null;
    const sidebar = document.getElementById('main-sidebar');

    if (sidebar) {
      observer = new ResizeObserver(() => {
        updateLayout();
      });
      observer.observe(sidebar);
    }

    // Also listen to window resize for global changes (like breakpoints)
    window.addEventListener('resize', updateLayout);

    return () => {
      window.removeEventListener('resize', updateLayout);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <>
      {/* Invisible placeholder to measure parent width/position */}
      <div
        ref={placeholderRef}
        className='pointer-events-none h-0 w-full opacity-0'
      />

      <AnimatePresence>
        {isFilled && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              bottom: `${layout.bottom}px`,
              left:
                typeof layout.left === 'number'
                  ? `${layout.left}px`
                  : layout.left,
              width:
                typeof layout.width === 'number'
                  ? `${layout.width}px`
                  : layout.width
            }}
            id='main-training-action-bar'
            className={clsx(
              'fixed z-40',
              'bg-[var(--background-color)]',
              'border-t-2 border-[var(--border-color)]',
              'px-4 py-3'
            )}
          >
            <div
              className={clsx(
                'flex flex-row items-center justify-center gap-2 md:gap-8',
                'mx-auto w-full max-w-4xl'
              )}
            >
              {/* Blitz Button */}
              {showBlitz && (
                <button
                  className={clsx(
                    'flex h-12 max-w-sm flex-1 flex-row items-center justify-center gap-2 px-2 sm:px-6',
                    'bg-[var(--secondary-color)] text-[var(--background-color)]',
                    'rounded-2xl transition-colors duration-200',
                    'border-b-8 border-[var(--secondary-color-accent)] shadow-sm',
                    'hover:cursor-pointer'
                  )}
                  onClick={e => {
                    e.currentTarget.blur();
                    playClick();
                    setGameModesMode('blitz');
                    setShowGameModesModal(true);
                  }}
                >
                  <Zap size={20} />
                  <span className='whitespace-nowrap'>Blitz</span>
                </button>
              )}

              {/* Gauntlet Button */}
              {showBlitz && (
                <button
                  className={clsx(
                    'flex h-12 max-w-sm flex-1 flex-row items-center justify-center gap-2 px-2 sm:px-6',
                    'bg-[var(--secondary-color)] text-[var(--background-color)]',
                    'rounded-2xl transition-colors duration-200',
                    'border-b-8 border-[var(--secondary-color-accent)] shadow-sm',
                    'hover:cursor-pointer'
                  )}
                  onClick={e => {
                    e.currentTarget.blur();
                    playClick();
                    setShowGauntletModal(true);
                  }}
                >
                  <Swords size={20} />
                  <span className='whitespace-nowrap'>Gauntlet</span>
                </button>
              )}

              {/* Start Training Button - Opens Modal */}
              <button
                ref={buttonRef}
                disabled={!isFilled}
                className={clsx(
                  'flex h-12 max-w-sm flex-1 flex-row items-center justify-center gap-2 px-2 sm:px-6',
                  'rounded-2xl transition-colors duration-200',
                  'border-b-8 font-medium shadow-sm',
                  'hover:cursor-pointer',
                  isFilled
                    ? 'border-[var(--main-color-accent)] bg-[var(--main-color)] text-[var(--background-color)]'
                    : 'cursor-not-allowed bg-[var(--card-color)] text-[var(--border-color)]'
                )}
                onClick={e => {
                  e.currentTarget.blur();
                  playClick();
                  setGameModesMode('train');
                  setShowGameModesModal(true);
                }}
              >
                <span className='whitespace-nowrap'>Classic</span>
                <Play className={clsx(isFilled && 'fill-current')} size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Modes Interstitial */}
      <GameModes
        isOpen={showGameModesModal}
        onClose={() => setShowGameModesModal(false)}
        currentDojo={currentDojo}
        mode={gameModesMode}
      />

      {/* Gauntlet Modal - shows Gauntlet component without route change */}
      {showGauntletModal && (
        <div className='fixed inset-0 z-[80] bg-[var(--background-color)]'>
          {currentDojo === 'kana' && (
            <GauntletKana onCancel={() => setShowGauntletModal(false)} />
          )}
          {currentDojo === 'kanji' && (
            <GauntletKanji onCancel={() => setShowGauntletModal(false)} />
          )}
          {currentDojo === 'vocabulary' && (
            <GauntletVocab onCancel={() => setShowGauntletModal(false)} />
          )}
        </div>
      )}
    </>
  );
};

export default TrainingActionBar;
