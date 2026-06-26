export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewInput {
  rating: number | string;
  title?: string;
  body?: string;
  authorName?: string;
  authorEmail?: string;
}

export function sanitizeReview(input: ReviewInput) {
  const rating = Math.max(1, Math.min(5, Number(input.rating) || 0));
  const title = typeof input.title === 'string' ? input.title.trim().slice(0, 140) : '';
  const body = typeof input.body === 'string' ? input.body.trim().slice(0, 2000) : '';
  const authorName = typeof input.authorName === 'string' ? input.authorName.trim().slice(0, 120) : '';
  const authorEmail = typeof input.authorEmail === 'string' ? input.authorEmail.trim().toLowerCase().slice(0, 180) : '';

  if (!rating) throw new Error('Rating is required');
  if (!body && !title) throw new Error('Review text is required');
  return { rating, title: title || null, body: body || null, authorName: authorName || 'Store customer', authorEmail: authorEmail || null, status: 'pending' as ReviewStatus };
}

export function summarizeReviews(reviews: Array<{ rating: number | string; status?: string }>) {
  const approved = reviews.filter((review) => !review.status || review.status === 'approved');
  const count = approved.length;
  const average = count === 0 ? 0 : approved.reduce((sum, review) => sum + Number(review.rating || 0), 0) / count;
  return { count, average: Math.round(average * 10) / 10 };
}
