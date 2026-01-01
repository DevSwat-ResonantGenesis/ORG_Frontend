import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import logger from '../../utils/logger';
import {
  getMarketplaceItem,
  purchaseItem,
  installItem,
  listItemReviews,
  createReview,
  type MarketplaceItem,
  type MarketplaceReview,
} from '../../api/marketplace';
import { Button, Card, Text, Input } from '../../components/ui';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';
import { useToastContext } from '../../context/ToastContext';
import styles from './ItemDetailPage.module.css';

const ItemDetailPage: React.FC = () => {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const session = getSession();
  const toast = useToastContext();

  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [reviews, setReviews] = useState<MarketplaceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!itemId) {
      navigate('/marketplace');
      return;
    }
    loadItem();
    loadReviews();
  }, [itemId, navigate]);

  const loadItem = async () => {
    if (!itemId) return;
    
    setLoading(true);
    setError(null);
    try {
      const itemData = await getMarketplaceItem(itemId);
      setItem(itemData);
    } catch (err: unknown) {
      logger.error('Failed to load item:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to load item';
      setError(errorMessage as string);
      toast.error(errorMessage as string);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!itemId) return;
    
    try {
      const reviewsData = await listItemReviews(itemId);
      setReviews(reviewsData);
    } catch (err: unknown) {
      logger.error('Failed to load reviews:', err);
    }
  };

  const handlePurchase = async () => {
    if (!itemId) return;
    
    setPurchasing(true);
    try {
      await purchaseItem(itemId, {});
      toast.success('Item purchased successfully!');
      await loadItem();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to purchase item';
      toast.error(errorMessage as string);
    } finally {
      setPurchasing(false);
    }
  };

  const handleInstall = async () => {
    if (!itemId) return;
    
    setInstalling(true);
    try {
      await installItem(itemId, {});
      toast.success('Item installed successfully!');
      navigate('/marketplace/installations');
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to install item';
      toast.error(errorMessage as string);
    } finally {
      setInstalling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!itemId) return;
    
    setSubmittingReview(true);
    try {
      await createReview(itemId, {
        rating: reviewRating,
        title: reviewTitle || undefined,
        comment: reviewComment || undefined,
      });
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      setReviewTitle('');
      setReviewComment('');
      setReviewRating(5);
      await loadItem();
      await loadReviews();
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to submit review';
      toast.error(errorMessage as string);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <ModernPageLayout title="Loading..." description="Loading item details">
        <div className={styles.loadingState}>
          <Text>Loading item details...</Text>
        </div>
      </ModernPageLayout>
    );
  }

  if (error || !item) {
    return (
      <ModernPageLayout title="Error" description="Failed to load item">
        <Card variant="elevated" padding="lg">
          <Text color="error">{error || 'Item not found'}</Text>
          <Button variant="primary" size="md" onClick={() => navigate('/marketplace')} style={{ marginTop: '1rem' }}>
            Back to Marketplace
          </Button>
        </Card>
      </ModernPageLayout>
    );
  }

  return (
    <ModernPageLayout
      title={item.name}
      description={item.short_description || item.description || undefined}
    >
      <div className={styles.itemDetailContainer}>
        <div className={styles.itemMain}>
          <Card variant="elevated" padding="lg">
            <div className={styles.itemHeader}>
              {item.icon_url && (
                <img src={item.icon_url} alt={item.name} className={styles.itemIconLarge} />
              )}
              <div className={styles.itemInfo}>
                <Text variant="h1">{item.name}</Text>
                <Text variant="body" color="secondary">
                  by {item.publisher_name || 'Unknown Publisher'}
                </Text>
                <div className={styles.itemMeta}>
                  <Text variant="body-sm" color="secondary">
                    {item.item_type} • Version {item.version}
                  </Text>
                  {item.category && (
                    <Text variant="body-sm" color="secondary">
                      • {item.category}
                    </Text>
                  )}
                </div>
              </div>
              <div className={styles.itemActions}>
                <div className={styles.itemPrice}>
                  {item.is_free ? (
                    <Text variant="h2" color="success">Free</Text>
                  ) : (
                    <Text variant="h2">
                      ${item.price?.toFixed(2)} {item.currency}
                    </Text>
                  )}
                </div>
                {!item.is_free && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handlePurchase}
                    disabled={purchasing}
                  >
                    {purchasing ? 'Purchasing...' : 'Purchase'}
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleInstall}
                  disabled={installing}
                >
                  {installing ? 'Installing...' : item.is_free ? 'Install' : 'Install (After Purchase)'}
                </Button>
              </div>
            </div>

            {item.description && (
              <div className={styles.itemDescription}>
                <Text variant="body">{item.description}</Text>
              </div>
            )}

            {item.screenshots && item.screenshots.length > 0 && (
              <div className={styles.itemScreenshots}>
                {item.screenshots.map((screenshot, index) => (
                  <img
                    key={index}
                    src={screenshot}
                    alt={`Screenshot ${index + 1}`}
                    className={styles.screenshot}
                  />
                ))}
              </div>
            )}

            {item.documentation_url && (
              <div className={styles.itemDocumentation}>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => window.open(item.documentation_url!, '_blank')}
                >
                  View Documentation
                </Button>
              </div>
            )}
          </Card>

          {/* Reviews Section */}
          <Card variant="elevated" padding="lg" className={styles.reviewsSection}>
            <div className={styles.reviewsHeader}>
              <div>
                <Text variant="h2">Reviews</Text>
                {item.average_rating && (
                  <Text variant="body" color="secondary">
                    ⭐ {item.average_rating.toFixed(1)} ({item.review_count} reviews)
                  </Text>
                )}
              </div>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                Write Review
              </Button>
            </div>

            {showReviewForm && (
              <Card variant="outlined" padding="md" className={styles.reviewForm}>
                <Text variant="h3" style={{ marginBottom: '1rem' }}>Write a Review</Text>
                <div className={styles.reviewFormFields}>
                  <div>
                    <Text variant="body-sm" style={{ marginBottom: '0.5rem' }}>Rating</Text>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className={styles.ratingSelect}
                    >
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating} ⭐
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Title (optional)"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Review title"
                  />
                  <Input
                    label="Comment (optional)"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Your review..."
                    multiline
                    rows={4}
                  />
                  <div className={styles.reviewFormActions}>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewTitle('');
                        setReviewComment('');
                        setReviewRating(5);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className={styles.reviewsList}>
              {reviews.length === 0 ? (
                <Text color="secondary">No reviews yet. Be the first to review!</Text>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} variant="outlined" padding="md" className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <Text variant="body" style={{ fontWeight: 600 }}>
                        {review.reviewer_name || 'Anonymous'}
                      </Text>
                      <Text variant="body-sm" color="secondary">
                        ⭐ {review.rating}/5
                      </Text>
                    </div>
                    {review.title && (
                      <Text variant="h4" style={{ marginTop: '0.5rem' }}>{review.title}</Text>
                    )}
                    {review.comment && (
                      <Text variant="body" style={{ marginTop: '0.5rem' }}>{review.comment}</Text>
                    )}
                    {review.created_at && (
                      <Text variant="body-sm" color="secondary" style={{ marginTop: '0.5rem' }}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </Text>
                    )}
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </ModernPageLayout>
  );
};

export default ItemDetailPage;

