import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './RabbitPage.module.css';

/* ── Types matching backend schemas ── */
interface Community {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  created_by_user_id: string;
  created_at: string;
}

interface Post {
  id: number;
  community_id: number;
  title: string;
  body: string | null;
  author_user_id: string;
  created_at: string;
  updated_at: string | null;
  is_deleted: boolean;
  is_locked: boolean;
}

interface Comment {
  id: number;
  post_id: number;
  parent_comment_id: number | null;
  body: string;
  author_user_id: string;
  created_at: string;
  updated_at: string | null;
  is_deleted: boolean;
  is_removed_by_mod: boolean;
}

const API = '/api/v1/rabbit';

/* ── Helpers ── */
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function communityInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts?.headers as Record<string, string> || {}) },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

/* ── Icons ── */
const UpArrow = ({ active }: { active?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#f97316' : 'currentColor'} strokeWidth="2">
    <path d="M8 3L3 9H13L8 3Z" fill={active ? '#f97316' : 'none'} strokeLinejoin="round" />
  </svg>
);

const DownArrow = ({ active }: { active?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={active ? '#6366f1' : 'currentColor'} strokeWidth="2">
    <path d="M8 13L3 7H13L8 13Z" fill={active ? '#6366f1' : 'none'} strokeLinejoin="round" />
  </svg>
);

const CommentIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 3C2 2.4 2.4 2 3 2H13C13.6 2 14 2.4 14 3V10C14 10.6 13.6 11 13 11H5L2 14V3Z" strokeLinejoin="round" />
  </svg>
);

const BackIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 3L5 8L10 13" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M8 3V13M3 8H13" strokeLinecap="round" />
  </svg>
);

/* ═══════════════════════════════════════════════
   Main RabbitPage Component
   ═══════════════════════════════════════════════ */
const RabbitPage: React.FC = () => {
  /* ── State ── */
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({}); // "post:id" => -1|0|1

  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  const [newCommentBody, setNewCommentBody] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* ── Derived ── */
  const selectedCommunity = useMemo(
    () => communities.find(c => c.slug === selectedSlug) ?? null,
    [communities, selectedSlug]
  );

  const communityMap = useMemo(() => {
    const m: Record<number, Community> = {};
    for (const c of communities) m[c.id] = c;
    return m;
  }, [communities]);

  /* ── Fetch communities ── */
  const fetchCommunities = useCallback(async () => {
    try {
      const data = await apiFetch<Community[]>('/communities');
      setCommunities(data);
    } catch {
      /* silent */
    } finally {
      setLoadingCommunities(false);
    }
  }, []);

  useEffect(() => { fetchCommunities(); }, [fetchCommunities]);

  /* ── Fetch posts for selected community ── */
  const fetchPosts = useCallback(async (slug: string | null) => {
    if (!slug) {
      setPosts([]);
      return;
    }
    setLoadingPosts(true);
    try {
      const data = await apiFetch<Post[]>(`/communities/${slug}/posts`);
      setPosts(data.filter(p => !p.is_deleted));
    } catch {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    setSelectedPost(null);
    fetchPosts(selectedSlug);
  }, [selectedSlug, fetchPosts]);

  /* ── Fetch comments for selected post ── */
  const fetchComments = useCallback(async (postId: number) => {
    setLoadingComments(true);
    try {
      const data = await apiFetch<Comment[]>(`/posts/${postId}/comments`);
      setComments(data.filter(c => !c.is_deleted));
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPost) fetchComments(selectedPost.id);
    else setComments([]);
  }, [selectedPost, fetchComments]);

  /* ── Vote handler ── */
  const handleVote = async (targetType: 'post' | 'comment', targetId: number, value: 1 | -1) => {
    const key = `${targetType}:${targetId}`;
    const current = votes[key] ?? 0;
    const newValue = current === value ? 0 : value;
    setVotes(prev => ({ ...prev, [key]: newValue }));
    try {
      await apiFetch('/votes', {
        method: 'PUT',
        body: JSON.stringify({ target_type: targetType, target_id: targetId, value: newValue }),
      });
    } catch {
      setVotes(prev => ({ ...prev, [key]: current }));
    }
  };

  /* ── Submit comment ── */
  const handleSubmitComment = async () => {
    if (!selectedPost || !newCommentBody.trim()) return;
    setSubmittingComment(true);
    try {
      await apiFetch<Comment>(`/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: newCommentBody.trim() }),
      });
      setNewCommentBody('');
      fetchComments(selectedPost.id);
    } catch (e: any) {
      setError(e.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  /* ── Select community ── */
  const handleSelectCommunity = (slug: string) => {
    setSelectedSlug(prev => (prev === slug ? null : slug));
  };

  /* ═══════════════════════════════════
     RENDER
     ═══════════════════════════════════ */
  return (
    <div style={{ paddingTop: 60 }}>
      <div className={styles.rabbitRoot}>
        {/* ── SIDEBAR ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarTitle}>Communities</div>
            {loadingCommunities ? (
              <div className={styles.loading}>
                <span className={styles.spinner} /> Loading…
              </div>
            ) : communities.length === 0 ? (
              <div className={styles.noCommunities}>No communities yet. Create one!</div>
            ) : (
              <div className={styles.communityList}>
                {communities.map(c => (
                  <button
                    key={c.slug}
                    className={`${styles.communityItem} ${selectedSlug === c.slug ? styles.communityItemActive : ''}`}
                    onClick={() => handleSelectCommunity(c.slug)}
                  >
                    <div className={styles.communityAvatar}>{communityInitial(c.name)}</div>
                    <div style={{ overflow: 'hidden' }}>
                      <div className={styles.communityName}>r/{c.slug}</div>
                      {c.description && <div className={styles.communityDesc}>{c.description}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button
              className={`${styles.btnPrimary} ${styles.btnSmall}`}
              style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
              onClick={() => setShowCreateCommunity(true)}
            >
              <PlusIcon /> Create Community
            </button>
          </div>
        </aside>

        {/* ── MAIN FEED ── */}
        <main className={styles.feed}>
          {/* Post Detail View */}
          {selectedPost ? (
            <PostDetailView
              post={selectedPost}
              community={communityMap[selectedPost.community_id]}
              comments={comments}
              loadingComments={loadingComments}
              votes={votes}
              newCommentBody={newCommentBody}
              submittingComment={submittingComment}
              error={error}
              onBack={() => setSelectedPost(null)}
              onVote={handleVote}
              onCommentChange={setNewCommentBody}
              onSubmitComment={handleSubmitComment}
              onClearError={() => setError(null)}
            />
          ) : (
            <>
              {/* Feed Header */}
              <div className={styles.feedHeader}>
                <div>
                  <div className={styles.feedTitle}>
                    {selectedCommunity ? `r/${selectedCommunity.slug}` : 'Rabbit Feed'}
                  </div>
                  <div className={styles.feedSubtitle}>
                    {selectedCommunity
                      ? selectedCommunity.description || 'Community posts'
                      : 'Select a community to browse posts'}
                  </div>
                </div>
                {selectedSlug && (
                  <div className={styles.feedActions}>
                    <button className={styles.btnPrimary} onClick={() => setShowCreatePost(true)}>
                      <PlusIcon /> New Post
                    </button>
                  </div>
                )}
              </div>

              {/* Create Post Box */}
              {selectedSlug && (
                <div className={styles.createBox} onClick={() => setShowCreatePost(true)}>
                  <div className={styles.createBoxAvatar}>
                    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="8" cy="5" r="3" />
                      <path d="M3 14C3 11 5 9 8 9C11 9 13 11 13 14" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className={styles.createBoxInput}>Create a post...</div>
                </div>
              )}

              {/* Posts */}
              {!selectedSlug ? (
                <div className={styles.emptyState}>
                  <svg className={styles.emptyIcon} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="32" cy="32" r="28" />
                    <path d="M22 38c3 4 14 4 20 0" strokeLinecap="round" />
                    <circle cx="24" cy="26" r="2" fill="currentColor" />
                    <circle cx="40" cy="26" r="2" fill="currentColor" />
                  </svg>
                  <div className={styles.emptyTitle}>Welcome to Rabbit</div>
                  <div className={styles.emptyDesc}>
                    Pick a community from the sidebar to start browsing posts, or create a new one.
                  </div>
                </div>
              ) : loadingPosts ? (
                <div className={styles.loading}>
                  <span className={styles.spinner} /> Loading posts…
                </div>
              ) : posts.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg className={styles.emptyIcon} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="8" y="12" width="48" height="40" rx="4" />
                    <path d="M8 24H56" />
                    <path d="M20 34H44M24 42H40" strokeLinecap="round" />
                  </svg>
                  <div className={styles.emptyTitle}>No posts yet</div>
                  <div className={styles.emptyDesc}>Be the first to post in r/{selectedSlug}!</div>
                </div>
              ) : (
                posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    community={communityMap[post.community_id]}
                    voteValue={votes[`post:${post.id}`] ?? 0}
                    onVote={(v) => handleVote('post', post.id, v)}
                    onClick={() => setSelectedPost(post)}
                    onCommunityClick={() => {
                      const c = communityMap[post.community_id];
                      if (c) setSelectedSlug(c.slug);
                    }}
                  />
                ))
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Social Links ── */}
      <div className={styles.socialFooter}>
        <a href="https://www.linkedin.com/company/resonantgenesis/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </a>
        <a href="https://www.youtube.com/@ResonantGenesis" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        </a>
        <a href="https://x.com/resonantgenesis" target="_blank" rel="noopener noreferrer" aria-label="X">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="https://www.reddit.com/u/ResonantGenesis/" target="_blank" rel="noopener noreferrer" aria-label="Reddit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
        </a>
        <a href="mailto:contact@resonantgenesis.xyz" aria-label="Email">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        </a>
      </div>

      {/* ── Modals ── */}
      {showCreateCommunity && (
        <CreateCommunityModal
          onClose={() => setShowCreateCommunity(false)}
          onCreated={(c) => {
            setCommunities(prev => [c, ...prev]);
            setSelectedSlug(c.slug);
            setShowCreateCommunity(false);
          }}
        />
      )}
      {showCreatePost && selectedSlug && (
        <CreatePostModal
          communitySlug={selectedSlug}
          onClose={() => setShowCreatePost(false)}
          onCreated={(p) => {
            setPosts(prev => [p, ...prev]);
            setShowCreatePost(false);
          }}
        />
      )}
    </div>
  );
};

/* ═══════════════════════════════════
   Post Card Component
   ═══════════════════════════════════ */
interface PostCardProps {
  post: Post;
  community?: Community;
  voteValue: number;
  onVote: (v: 1 | -1) => void;
  onClick: () => void;
  onCommunityClick: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, community, voteValue, onVote, onClick, onCommunityClick }) => (
  <div className={styles.postCard}>
    <div className={styles.postVoteSidebar}>
      <button
        className={`${styles.voteBtn} ${voteValue === 1 ? styles.voteBtnUpActive : ''}`}
        onClick={(e) => { e.stopPropagation(); onVote(1); }}
        title="Upvote"
      >
        <UpArrow active={voteValue === 1} />
      </button>
      <span className={styles.voteCount}>{voteValue}</span>
      <button
        className={`${styles.voteBtn} ${voteValue === -1 ? styles.voteBtnDownActive : ''}`}
        onClick={(e) => { e.stopPropagation(); onVote(-1); }}
        title="Downvote"
      >
        <DownArrow active={voteValue === -1} />
      </button>
    </div>
    <div className={styles.postContent}>
      <div className={styles.postMeta}>
        {community && (
          <span className={styles.postCommunity} onClick={(e) => { e.stopPropagation(); onCommunityClick(); }}>
            r/{community.slug}
          </span>
        )}
        <span>•</span>
        <span className={styles.postAuthor}>u/{post.author_user_id.slice(0, 8)}</span>
        <span>•</span>
        <span className={styles.timeAgo}>{timeAgo(post.created_at)}</span>
      </div>
      <div className={styles.postTitle} onClick={onClick}>{post.title}</div>
      {post.body && <div className={styles.postBody}>{post.body}</div>}
      <div className={styles.postFooter}>
        <button className={styles.postFooterBtn} onClick={onClick}>
          <CommentIcon /> Comments
        </button>
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════
   Post Detail View Component
   ═══════════════════════════════════ */
interface PostDetailProps {
  post: Post;
  community?: Community;
  comments: Comment[];
  loadingComments: boolean;
  votes: Record<string, number>;
  newCommentBody: string;
  submittingComment: boolean;
  error: string | null;
  onBack: () => void;
  onVote: (type: 'post' | 'comment', id: number, v: 1 | -1) => void;
  onCommentChange: (v: string) => void;
  onSubmitComment: () => void;
  onClearError: () => void;
}

const PostDetailView: React.FC<PostDetailProps> = ({
  post, community, comments, loadingComments, votes,
  newCommentBody, submittingComment, error,
  onBack, onVote, onCommentChange, onSubmitComment, onClearError,
}) => (
  <>
    <button className={styles.backBtn} onClick={onBack}>
      <BackIcon /> Back to feed
    </button>
    <div className={styles.postDetail}>
      <div className={styles.postMeta} style={{ marginBottom: 8 }}>
        {community && <span className={styles.postCommunity}>r/{community.slug}</span>}
        <span>•</span>
        <span className={styles.postAuthor}>u/{post.author_user_id.slice(0, 8)}</span>
        <span>•</span>
        <span className={styles.timeAgo}>{timeAgo(post.created_at)}</span>
        {post.is_locked && <span style={{ color: '#f59e0b', fontWeight: 600 }}>🔒 Locked</span>}
      </div>
      <div className={styles.postDetailTitle}>{post.title}</div>
      {post.body && <div className={styles.postDetailBody}>{post.body}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <button
          className={`${styles.voteBtn} ${(votes[`post:${post.id}`] ?? 0) === 1 ? styles.voteBtnUpActive : ''}`}
          onClick={() => onVote('post', post.id, 1)}
        >
          <UpArrow active={(votes[`post:${post.id}`] ?? 0) === 1} />
        </button>
        <span className={styles.voteCount}>{votes[`post:${post.id}`] ?? 0}</span>
        <button
          className={`${styles.voteBtn} ${(votes[`post:${post.id}`] ?? 0) === -1 ? styles.voteBtnDownActive : ''}`}
          onClick={() => onVote('post', post.id, -1)}
        >
          <DownArrow active={(votes[`post:${post.id}`] ?? 0) === -1} />
        </button>
      </div>

      {/* Comments */}
      <div className={styles.commentsSection}>
        <div className={styles.commentsTitle}>
          {comments.length} Comment{comments.length !== 1 ? 's' : ''}
        </div>

        {!post.is_locked && (
          <div className={styles.commentBox}>
            {error && (
              <div className={styles.error} onClick={onClearError} style={{ cursor: 'pointer' }}>
                {error} (click to dismiss)
              </div>
            )}
            <textarea
              className={styles.commentTextarea}
              placeholder="Write a comment..."
              value={newCommentBody}
              onChange={e => onCommentChange(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className={styles.btnPrimary}
                disabled={submittingComment || !newCommentBody.trim()}
                onClick={onSubmitComment}
                style={{ opacity: submittingComment || !newCommentBody.trim() ? 0.5 : 1 }}
              >
                {submittingComment ? 'Posting…' : 'Comment'}
              </button>
            </div>
          </div>
        )}

        {loadingComments ? (
          <div className={styles.loading}>
            <span className={styles.spinner} /> Loading comments…
          </div>
        ) : comments.length === 0 ? (
          <div className={styles.noComments}>No comments yet. Be the first!</div>
        ) : (
          comments.map(c => (
            <div key={c.id} className={styles.commentItem} style={{ marginLeft: c.parent_comment_id ? 24 : 0 }}>
              <div className={styles.commentMeta}>
                <span className={styles.commentAuthor}>u/{c.author_user_id.slice(0, 8)}</span>
                {' • '}
                <span className={styles.timeAgo}>{timeAgo(c.created_at)}</span>
              </div>
              <div className={styles.commentBody}>{c.body}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <button
                  className={`${styles.voteBtn} ${(votes[`comment:${c.id}`] ?? 0) === 1 ? styles.voteBtnUpActive : ''}`}
                  onClick={() => onVote('comment', c.id, 1)}
                  style={{ width: 24, height: 24 }}
                >
                  <UpArrow active={(votes[`comment:${c.id}`] ?? 0) === 1} />
                </button>
                <span className={styles.voteCount} style={{ fontSize: 11 }}>{votes[`comment:${c.id}`] ?? 0}</span>
                <button
                  className={`${styles.voteBtn} ${(votes[`comment:${c.id}`] ?? 0) === -1 ? styles.voteBtnDownActive : ''}`}
                  onClick={() => onVote('comment', c.id, -1)}
                  style={{ width: 24, height: 24 }}
                >
                  <DownArrow active={(votes[`comment:${c.id}`] ?? 0) === -1} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </>
);

/* ═══════════════════════════════════
   Create Community Modal
   ═══════════════════════════════════ */
interface CreateCommunityModalProps {
  onClose: () => void;
  onCreated: (c: Community) => void;
}

const CreateCommunityModal: React.FC<CreateCommunityModalProps> = ({ onClose, onCreated }) => {
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!slug.trim() || !name.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const c = await apiFetch<Community>('/communities', {
        method: 'POST',
        body: JSON.stringify({
          slug: slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''),
          name: name.trim(),
          description: description.trim() || null,
        }),
      });
      onCreated(c);
    } catch (e: any) {
      setError(e.message || 'Failed to create community');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalTitle}>Create a Community</div>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Slug (URL-friendly name)</label>
          <input
            className={styles.formInput}
            placeholder="e.g. general-chat"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            maxLength={64}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Display Name</label>
          <input
            className={styles.formInput}
            placeholder="e.g. General Chat"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={128}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Description (optional)</label>
          <textarea
            className={`${styles.formInput} ${styles.formTextarea}`}
            placeholder="What is this community about?"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div className={styles.modalActions}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button
            className={styles.btnPrimary}
            disabled={submitting || !slug.trim() || !name.trim()}
            onClick={handleSubmit}
            style={{ opacity: submitting || !slug.trim() || !name.trim() ? 0.5 : 1 }}
          >
            {submitting ? 'Creating…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════
   Create Post Modal
   ═══════════════════════════════════ */
interface CreatePostModalProps {
  communitySlug: string;
  onClose: () => void;
  onCreated: (p: Post) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ communitySlug, onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const p = await apiFetch<Post>('/posts', {
        method: 'POST',
        body: JSON.stringify({
          community_slug: communitySlug,
          title: title.trim(),
          body: body.trim() || null,
        }),
      });
      onCreated(p);
    } catch (e: any) {
      setError(e.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalTitle}>New Post in r/{communitySlug}</div>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Title</label>
          <input
            className={styles.formInput}
            placeholder="An interesting title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={300}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Body (optional)</label>
          <textarea
            className={`${styles.formInput} ${styles.formTextarea}`}
            placeholder="Share your thoughts..."
            value={body}
            onChange={e => setBody(e.target.value)}
          />
        </div>
        <div className={styles.modalActions}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button
            className={styles.btnPrimary}
            disabled={submitting || !title.trim()}
            onClick={handleSubmit}
            style={{ opacity: submitting || !title.trim() ? 0.5 : 1 }}
          >
            {submitting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RabbitPage;
