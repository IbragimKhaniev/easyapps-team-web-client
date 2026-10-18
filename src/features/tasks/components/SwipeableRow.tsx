import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { Archive, Check } from 'lucide-react';
import type { ReactNode } from 'react';

/** Сколько протянуть, чтобы действие сработало, — как в Почте iOS. */
const TRIGGER_DISTANCE = 96;
const SPRING = { type: 'spring', stiffness: 520, damping: 42 } as const;

interface ISwipeableRowProps {
  children: ReactNode;
  /** Свайп вправо. */
  onSwipeRight?: () => void;
  rightLabel?: string;
  /** Свайп влево. */
  onSwipeLeft?: () => void;
  leftLabel?: string;
}

/**
 * Строка со свайпами на телефоне: вправо — «Готово» (фирменный голубой),
 * влево — «В архив» (красный). Действие срабатывает, если протянуть дальше
 * порога; строка возвращается пружиной.
 */
export const SwipeableRow = ({
  children,
  onSwipeRight,
  rightLabel = 'Готово',
  onSwipeLeft,
  leftLabel = 'В архив',
}: ISwipeableRowProps) => {
  const x = useMotionValue(0);
  const rightOpacity = useTransform(x, [0, TRIGGER_DISTANCE * 0.6], [0, 1]);
  const leftOpacity = useTransform(x, [-TRIGGER_DISTANCE * 0.6, 0], [1, 0]);

  return (
    <div className="relative overflow-hidden">
      {onSwipeRight && (
        <motion.div style={{ opacity: rightOpacity }} className="absolute inset-0 flex items-center bg-brand-700 pl-6 text-white">
          <Check className="mr-2 h-5 w-5" />
          <span className="text-[15px] font-bold">{rightLabel}</span>
        </motion.div>
      )}
      {onSwipeLeft && (
        <motion.div style={{ opacity: leftOpacity }} className="absolute inset-0 flex items-center justify-end bg-rose-500 pr-6 text-white">
          <span className="text-[15px] font-bold">{leftLabel}</span>
          <Archive className="ml-2 h-5 w-5" />
        </motion.div>
      )}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: onSwipeLeft ? -TRIGGER_DISTANCE * 1.6 : 0, right: onSwipeRight ? TRIGGER_DISTANCE * 1.6 : 0 }}
        dragElastic={0.12}
        style={{ x, touchAction: 'pan-y' }}
        onDragEnd={(_, info) => {
          if (info.offset.x > TRIGGER_DISTANCE && onSwipeRight) onSwipeRight();
          if (info.offset.x < -TRIGGER_DISTANCE && onSwipeLeft) onSwipeLeft();
          void animate(x, 0, SPRING);
        }}
        className="relative bg-white"
      >
        {children}
      </motion.div>
    </div>
  );
};
