import { Navigate, useParams } from 'react-router-dom';

import { PATHS, TASK_PARAM } from '@/app/paths';

/** Прямая ссылка `/tasks/EA-42` → список задач с открытой карточкой. */
export const TaskRedirect = () => {
  const { key } = useParams();
  return <Navigate to={key ? `${PATHS.tasks}?${TASK_PARAM}=${encodeURIComponent(key)}` : PATHS.tasks} replace />;
};
