import { Rating, ReviewState } from '../types';

export function advanceSM2(
  current: ReviewState | undefined,
  rating: Rating
): ReviewState {
  const cardId = current?.cardId || '';
  let reps = current?.reps || 0;
  let interval = current?.interval || 0;
  let easeFactor = current?.easeFactor || 2.5;

  if (rating === 'again') {
    reps = 0;
    interval = 0.007; // ~10 minutes
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (rating === 'hard') {
    reps += 1;
    interval = interval === 0 ? 1 : Math.max(1, Math.round(interval * 1.2));
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (rating === 'good') {
    reps += 1;
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = 3;
    else interval = Math.round(interval * easeFactor);
  } else if (rating === 'easy') {
    reps += 1;
    if (reps === 1) interval = 3;
    else if (reps === 2) interval = 6;
    else interval = Math.round(interval * easeFactor * 1.3);
    easeFactor = Math.min(3.0, easeFactor + 0.15);
  }

  const dueDate = new Date();
  dueDate.setMinutes(dueDate.getMinutes() + Math.round(interval * 1440));

  return {
    cardId,
    reps,
    interval,
    easeFactor,
    dueDate: dueDate.toISOString(),
  };
}
