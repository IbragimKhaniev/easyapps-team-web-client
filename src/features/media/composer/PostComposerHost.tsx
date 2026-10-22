import { Suspense } from 'react';

import { lazyNamed } from '@/lib/lazyNamed';
import { usePostParam } from '../hooks/usePostParam';

const PostComposerSheet = lazyNamed(() => import('./PostComposerSheet'), 'PostComposerSheet');

/**
 * Конструктор поста живёт поверх любого экрана, но его код (редактор,
 * перетаскивание, предпросмотры) грузится только когда в адресе есть `?post=`.
 */
export const PostComposerHost = () => {
  const { isOpen } = usePostParam();
  if (!isOpen) return null;
  return (
    <Suspense fallback={null}>
      <PostComposerSheet />
    </Suspense>
  );
};
