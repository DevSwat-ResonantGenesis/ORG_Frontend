import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './RabbitPage.module.css';
import { useAuth } from '../../security/auth/AuthProvider';

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
  community_slug?: string | null;
  title: string;
  body: string | null;
  image_url?: string | null;
  author_user_id: string;
  created_at: string;
  updated_at: string | null;
  is_deleted: boolean;
  is_locked: boolean;
  vote_score: number;
  comment_count: number;
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

type SortMode = 'new' | 'top' | 'hot';

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

function displaySlug(slug: string): string {
  return slug.replace(/^r\//, '');
}

function hotScore(post: Post): number {
  const age = (Date.now() - new Date(post.created_at).getTime()) / 3600000;
  return (post.vote_score + post.comment_count * 2) / Math.pow(age + 2, 1.5);
}

function sortPosts(posts: Post[], mode: SortMode): Post[] {
  const sorted = [...posts];
  switch (mode) {
    case 'new': return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'top': return sorted.sort((a, b) => b.vote_score - a.vote_score);
    case 'hot': return sorted.sort((a, b) => hotScore(b) - hotScore(a));
    default: return sorted;
  }
}

interface CommentNode extends Comment {
  depth: number;
}

function buildCommentTree(comments: Comment[]): CommentNode[] {
  const childrenMap = new Map<number | null, Comment[]>();
  comments.forEach(c => {
    const key = c.parent_comment_id;
    if (!childrenMap.has(key)) childrenMap.set(key, []);
    childrenMap.get(key)!.push(c);
  });
  const result: CommentNode[] = [];
  const walk = (parentId: number | null, depth: number) => {
    const kids = childrenMap.get(parentId) || [];
    kids.forEach(c => {
      result.push({ ...c, depth });
      walk(c.id, depth + 1);
    });
  };
  walk(null, 0);
  return result;
}

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts?.headers as Record<string, string> || {}) },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    if (res.status === 401 || text.includes('Missing x-user-id')) {
      throw new Error('Please log in to perform this action.');
    }
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

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="7" cy="7" r="5" />
    <path d="M11 11L14 14" strokeLinecap="round" />
  </svg>
);

const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="2" width="12" height="12" rx="2" />
    <circle cx="5.5" cy="5.5" r="1.5" />
    <path d="M2 11L5 8L8 11L11 7L14 11" strokeLinejoin="round" />
  </svg>
);

const ShareIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 8V13H12V8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 2V10" strokeLinecap="round" />
    <path d="M5 5L8 2L11 5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 4H13" strokeLinecap="round" />
    <path d="M6 4V3C6 2.4 6.4 2 7 2H9C9.6 2 10 2.4 10 3V4" />
    <path d="M4 4L5 14H11L12 4" strokeLinejoin="round" />
  </svg>
);

const ReplyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6 8L2 5L6 2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 5H10C12.2 5 14 6.8 14 9V14" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M6.5 9.5L9.5 6.5" strokeLinecap="round" />
    <path d="M9 4L11 2C12.1 0.9 13.9 0.9 15 2C16.1 3.1 16.1 4.9 15 6L13 8" strokeLinecap="round" />
    <path d="M7 12L5 14C3.9 15.1 2.1 15.1 1 14C-0.1 12.9 -0.1 11.1 1 10L3 8" strokeLinecap="round" />
  </svg>
);

const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="5" r="3" />
    <path d="M3 14C3 11 5 9 8 9C11 9 13 11 13 14" strokeLinecap="round" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="5" y="5" width="9" height="9" rx="1.5" />
    <path d="M11 5V3.5C11 2.67 10.33 2 9.5 2H3.5C2.67 2 2 2.67 2 3.5V9.5C2 10.33 2.67 11 3.5 11H5" />
  </svg>
);

const TwitterXIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);

const LinkedInIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
);

const RedditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/></svg>
);

/* ── Share Dropdown Component ── */
interface ShareDropdownProps {
  postId: number;
  postTitle: string;
  onClose: () => void;
}

const ShareDropdown: React.FC<ShareDropdownProps> = ({ postId, postTitle, onClose }) => {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const url = `${window.location.origin}/rabbit?post=${postId}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(postTitle);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => { setCopied(false); onClose(); }, 1200);
    }).catch(() => {});
  };

  const items = [
    { label: 'Twitter / X', icon: <TwitterXIcon />, href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { label: 'Facebook', icon: <FacebookIcon />, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: 'LinkedIn', icon: <LinkedInIcon />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { label: 'Reddit', icon: <RedditIcon />, href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}` },
  ];

  return (
    <div ref={ref} className={styles.shareDropdown}>
      {items.map(item => (
        <a
          key={item.label}
          className={styles.shareDropdownItem}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
        >
          {item.icon}
          <span>{item.label}</span>
        </a>
      ))}
      <button className={styles.shareDropdownItem} onClick={copyLink}>
        <CopyIcon />
        <span>{copied ? 'Copied!' : 'Copy link'}</span>
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════
   Main RabbitPage Component
   ═══════════════════════════════════════════════ */
const RabbitPage: React.FC = () => {
  /* ── Auth ── */
  const { userId } = useAuth();

  /* ── State ── */
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [allUserComments, setAllUserComments] = useState<Comment[]>([]);
  const [localVotes, setLocalVotes] = useState<Record<string, number>>({});
  const [sortMode, setSortMode] = useState<SortMode>('hot');
  const [shareDropdownId, setShareDropdownId] = useState<number | null>(null);

  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [profileTab, setProfileTab] = useState<'overview' | 'posts' | 'comments'>('overview');

  const [newCommentBody, setNewCommentBody] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Post[] | null>(null);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [error, setError] = useState<string | null>(null);

  /* ── Derived ── */
  const selectedCommunity = useMemo(
    () => communities.find(c => c.slug === selectedSlug) ?? null,
    [communities, selectedSlug]
  );

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

  /* ── Fetch posts ── */
  const fetchPosts = useCallback(async (slug: string | null) => {
    setLoadingPosts(true);
    try {
      const data = slug
        ? await apiFetch<Post[]>(`/communities/${slug}/posts`)
        : await apiFetch<Post[]>('/posts');
      setPosts(data.filter(p => !p.is_deleted));
    } catch {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    setSelectedPost(null);
    setSearchQuery('');
    setSearchResults(null);
    fetchPosts(selectedSlug);
  }, [selectedSlug, fetchPosts]);

  /* ── Search ── */
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await apiFetch<Post[]>(`/posts/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current); };
  }, [searchQuery]);

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
    if (selectedPost) {
      fetchComments(selectedPost.id);
      setReplyTo(null);
      setNewCommentBody('');
    } else {
      setComments([]);
    }
  }, [selectedPost, fetchComments]);

  /* ── Vote handler ── */
  const handleVote = async (targetType: 'post' | 'comment', targetId: number, value: 1 | -1) => {
    const key = `${targetType}:${targetId}`;
    const current = localVotes[key] ?? 0;
    const newValue = current === value ? 0 : value;
    const scoreDelta = newValue - current;

    setLocalVotes(prev => ({ ...prev, [key]: newValue }));

    if (targetType === 'post') {
      setPosts(prev => prev.map(p =>
        p.id === targetId ? { ...p, vote_score: p.vote_score + scoreDelta } : p
      ));
      if (selectedPost && selectedPost.id === targetId) {
        setSelectedPost(prev => prev ? { ...prev, vote_score: prev.vote_score + scoreDelta } : prev);
      }
    }

    try {
      await apiFetch('/votes', {
        method: 'PUT',
        body: JSON.stringify({ target_type: targetType, target_id: targetId, value: newValue }),
      });
    } catch {
      setLocalVotes(prev => ({ ...prev, [key]: current }));
      if (targetType === 'post') {
        setPosts(prev => prev.map(p =>
          p.id === targetId ? { ...p, vote_score: p.vote_score - scoreDelta } : p
        ));
        if (selectedPost && selectedPost.id === targetId) {
          setSelectedPost(prev => prev ? { ...prev, vote_score: prev.vote_score - scoreDelta } : prev);
        }
      }
    }
  };

  /* ── Submit comment (supports reply) ── */
  const handleSubmitComment = async (parentId?: number | null) => {
    if (!selectedPost || !newCommentBody.trim()) return;
    setSubmittingComment(true);
    try {
      await apiFetch<Comment>(`/posts/${selectedPost.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: newCommentBody.trim(), parent_comment_id: parentId || null }),
      });
      setNewCommentBody('');
      setReplyTo(null);
      fetchComments(selectedPost.id);
      setSelectedPost(prev => prev ? { ...prev, comment_count: prev.comment_count + 1 } : prev);
      setPosts(prev => prev.map(p =>
        p.id === selectedPost.id ? { ...p, comment_count: p.comment_count + 1 } : p
      ));
    } catch (e: any) {
      setError(e.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  /* ── Delete post ── */
  const handleDeletePost = async (postId: number) => {
    if (!confirm('Delete this post?')) return;
    try {
      await apiFetch(`/posts/${postId}`, { method: 'DELETE' });
      setPosts(prev => prev.filter(p => p.id !== postId));
      if (selectedPost?.id === postId) setSelectedPost(null);
    } catch (e: any) {
      setError(e.message || 'Failed to delete post');
    }
  };

  /* ── Delete comment ── */
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await apiFetch(`/comments/${commentId}`, { method: 'DELETE' });
      setComments(prev => prev.filter(c => c.id !== commentId));
      if (selectedPost) {
        setSelectedPost(prev => prev ? { ...prev, comment_count: Math.max(0, prev.comment_count - 1) } : prev);
        setPosts(prev => prev.map(p =>
          p.id === selectedPost.id ? { ...p, comment_count: Math.max(0, p.comment_count - 1) } : p
        ));
      }
    } catch (e: any) {
      setError(e.message || 'Failed to delete comment');
    }
  };

  /* ── Share toggle ── */
  const handleShareToggle = (postId: number) => {
    setShareDropdownId(prev => prev === postId ? null : postId);
  };

  /* ── Select community ── */
  const handleSelectCommunity = (slug: string) => {
    setSelectedSlug(prev => (prev === slug ? null : slug));
  };

  /* ── Fetch all posts (for user profile stats) – once on mount + after creating ── */
  const fetchAllPosts = useCallback(() => {
    apiFetch<Post[]>('/posts').then(data => setAllPosts(data.filter(p => !p.is_deleted))).catch(() => {});
  }, []);
  useEffect(() => { fetchAllPosts(); }, [fetchAllPosts]);

  /* ── User profile computed data ── */
  const userPosts = useMemo(() => userId ? allPosts.filter(p => p.author_user_id === userId) : [], [allPosts, userId]);
  const userKarma = useMemo(() => userPosts.reduce((sum, p) => sum + p.vote_score, 0), [userPosts]);
  const userCommentCount = allUserComments.length;

  const rawPosts = searchResults !== null ? searchResults : posts;
  const displayPosts = sortPosts(rawPosts, sortMode);

  /* ═══════════════════════════════════
     RENDER
     ═══════════════════════════════════ */
  return (
    <div style={{ paddingTop: 60 }}>
      <div className={styles.rabbitRoot}>
        {/* ── LEFT SIDEBAR – Nav / Communities ── */}
        <aside className={styles.leftSidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarTitle}>Communities</div>
            {loadingCommunities ? (
              <div className={styles.loading}><span className={styles.spinner} /> Loading…</div>
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
                      <div className={styles.communityName}>r/{displaySlug(c.slug)}</div>
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

        {/* ── CENTER FEED ── */}
        <main className={styles.feed}>
          {selectedPost ? (
            <PostDetailView
              post={selectedPost}
              communitySlug={selectedPost.community_slug || undefined}
              comments={comments}
              loadingComments={loadingComments}
              localVotes={localVotes}
              newCommentBody={newCommentBody}
              replyTo={replyTo}
              submittingComment={submittingComment}
              error={error}
              onBack={() => setSelectedPost(null)}
              onVote={handleVote}
              onCommentChange={setNewCommentBody}
              onSubmitComment={handleSubmitComment}
              onClearError={() => setError(null)}
              onDeletePost={handleDeletePost}
              onDeleteComment={handleDeleteComment}
              onShareToggle={handleShareToggle}
              onReplyTo={setReplyTo}
              shareDropdownId={shareDropdownId}
              onShareClose={() => setShareDropdownId(null)}
            />
          ) : (
            <>
              {/* Feed Header */}
              <div className={styles.feedHeader}>
                <div>
                  <div className={styles.feedTitle}>
                    {selectedCommunity ? `r/${displaySlug(selectedCommunity.slug)}` : 'Rabbit Feed'}
                  </div>
                  <div className={styles.feedSubtitle}>
                    {selectedCommunity
                      ? selectedCommunity.description || 'Community posts'
                      : 'All posts across communities'}
                  </div>
                </div>
                <div className={styles.feedActions}>
                  <button className={styles.btnPrimary} onClick={() => setShowCreatePost(true)}>
                    <PlusIcon /> New Post
                  </button>
                </div>
              </div>

              {/* Sort Tabs + Search */}
              <div className={styles.feedToolbar}>
                <div className={styles.sortTabs}>
                  {(['hot', 'new', 'top'] as SortMode[]).map(mode => (
                    <button
                      key={mode}
                      className={`${styles.sortTab} ${sortMode === mode ? styles.sortTabActive : ''}`}
                      onClick={() => setSortMode(mode)}
                    >
                      {mode === 'hot' && '🔥 '}
                      {mode === 'new' && '🕐 '}
                      {mode === 'top' && '⬆ '}
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
                <div className={styles.searchBar}>
                  <SearchIcon />
                  <input
                    className={styles.searchInput}
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button className={styles.searchClear} onClick={() => { setSearchQuery(''); setSearchResults(null); }}>
                      &times;
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Create Post */}
              {showCreatePost ? (
                <InlineCreatePost
                  communitySlug={selectedSlug}
                  communities={communities}
                  onCreated={(p) => {
                    setPosts(prev => [p, ...prev]);
                    setShowCreatePost(false);
                    if (p.community_slug && p.community_slug !== selectedSlug) {
                      setSelectedSlug(p.community_slug);
                    }
                  }}
                  onCancel={() => setShowCreatePost(false)}
                />
              ) : (
                <div className={styles.createBox} onClick={() => setShowCreatePost(true)}>
                  <div className={styles.createBoxAvatar}>
                    <UserIcon />
                  </div>
                  <div className={styles.createBoxInput}>Create a post</div>
                  <div className={styles.createBoxIcons}>
                    <ImageIcon />
                    <LinkIcon />
                  </div>
                </div>
              )}

              {/* Posts Feed */}
              {searching ? (
                <div className={styles.loading}><span className={styles.spinner} /> Searching…</div>
              ) : loadingPosts ? (
                <div className={styles.loading}><span className={styles.spinner} /> Loading posts…</div>
              ) : displayPosts.length === 0 ? (
                <div className={styles.emptyState}>
                  <svg className={styles.emptyIcon} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="8" y="12" width="48" height="40" rx="4" />
                    <path d="M8 24H56" />
                    <path d="M20 34H44M24 42H40" strokeLinecap="round" />
                  </svg>
                  <div className={styles.emptyTitle}>
                    {searchResults !== null ? 'No results found' : 'No posts yet'}
                  </div>
                  <div className={styles.emptyDesc}>
                    {searchResults !== null
                      ? `No posts matching "${searchQuery}"`
                      : selectedSlug
                        ? `Be the first to post in r/${displaySlug(selectedSlug)}!`
                        : 'Create a community and start posting!'}
                  </div>
                </div>
              ) : (
                displayPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    localVote={localVotes[`post:${post.id}`] ?? 0}
                    onVote={(v) => handleVote('post', post.id, v)}
                    onClick={() => setSelectedPost(post)}
                    onCommunityClick={() => { if (post.community_slug) setSelectedSlug(post.community_slug); }}
                    onShareToggle={() => handleShareToggle(post.id)}
                    onDelete={() => handleDeletePost(post.id)}
                    shareDropdownId={shareDropdownId}
                    onShareClose={() => setShareDropdownId(null)}
                  />
                ))
              )}
            </>
          )}
        </main>

        {/* ── RIGHT SIDEBAR – Reddit-style user profile + community info ── */}
        <aside className={styles.rightSidebar}>
          {/* User Profile Card (always visible) */}
          <div className={styles.profileCard}>
            <div className={styles.profileBanner} />
            <div className={styles.profileCardBody}>
              <div className={styles.profileAvatarWrap}>
                <div className={styles.profileAvatar}>
                  <UserIcon />
                </div>
              </div>
              <div className={styles.profileName}>{userId ? `u/${userId.slice(0, 8)}` : 'Guest'}</div>
              <div className={styles.profileStatsGrid}>
                <div className={styles.profileStat}>
                  <span className={styles.profileStatValue}>{userKarma}</span>
                  <span className={styles.profileStatLabel}>Karma</span>
                </div>
                <div className={styles.profileStat}>
                  <span className={styles.profileStatValue}>{userPosts.length}</span>
                  <span className={styles.profileStatLabel}>Posts</span>
                </div>
                <div className={styles.profileStat}>
                  <span className={styles.profileStatValue}>{userCommentCount}</span>
                  <span className={styles.profileStatLabel}>Comments</span>
                </div>
              </div>
              {/* Profile Tabs */}
              <div className={styles.profileTabs}>
                {(['overview', 'posts', 'comments'] as const).map(tab => (
                  <button
                    key={tab}
                    className={`${styles.profileTab} ${profileTab === tab ? styles.profileTabActive : ''}`}
                    onClick={() => setProfileTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className={styles.profileContent}>
                {profileTab === 'overview' && (
                  <div className={styles.profileOverview}>
                    <div className={styles.profileOverviewItem}>
                      <span>Karma</span><span>{userKarma}</span>
                    </div>
                    <div className={styles.profileOverviewItem}>
                      <span>Posts</span><span>{userPosts.length}</span>
                    </div>
                    <div className={styles.profileOverviewItem}>
                      <span>Comments</span><span>{userCommentCount}</span>
                    </div>
                  </div>
                )}
                {profileTab === 'posts' && (
                  userPosts.length === 0 ? (
                    <div className={styles.profileEmpty}>No posts yet</div>
                  ) : (
                    userPosts.slice(0, 10).map(p => (
                      <div key={p.id} className={styles.profilePostItem} onClick={() => setSelectedPost(p)}>
                        <div className={styles.profilePostTitle}>{p.title}</div>
                        <div className={styles.profilePostMeta}>
                          {p.community_slug && <span>r/{displaySlug(p.community_slug)}</span>}
                          <span>•</span>
                          <span>{p.vote_score} pts</span>
                          <span>•</span>
                          <span>{p.comment_count} comments</span>
                        </div>
                      </div>
                    ))
                  )
                )}
                {profileTab === 'comments' && (
                  allUserComments.length === 0 ? (
                    <div className={styles.profileEmpty}>No comments yet</div>
                  ) : (
                    allUserComments.slice(0, 10).map(c => (
                      <div key={c.id} className={styles.profileCommentItem}>
                        <div className={styles.profileCommentBody}>{c.body}</div>
                        <div className={styles.profilePostMeta}>
                          <span>{timeAgo(c.created_at)}</span>
                        </div>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          </div>

          {/* Community Info Panel */}
          {selectedCommunity && (
            <div className={styles.sidebarCard}>
              <div className={styles.communityInfoTitle}>r/{displaySlug(selectedCommunity.slug)}</div>
              <div className={styles.communityInfoDesc}>{selectedCommunity.description || 'A community on Rabbit'}</div>
              <div className={styles.communityInfoStats}>
                <div className={styles.communityInfoStat}>
                  <span className={styles.communityInfoStatValue}>{posts.length}</span>
                  <span className={styles.communityInfoStatLabel}>Posts</span>
                </div>
                <div className={styles.communityInfoStat}>
                  <span className={styles.communityInfoStatValue}>
                    {new Date(selectedCommunity.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                  <span className={styles.communityInfoStatLabel}>Created</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Links (Reddit-style settings section) */}
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarTitle}>Links</div>
            <a href="https://resonantgenesis.xyz" className={styles.quickLink}>
              <span>🏠</span> Home
            </a>
            <a href="https://resonantgenesis.xyz/rabbit" className={styles.quickLink}>
              <span>🐰</span> Rabbit Feed
            </a>
            <a href="https://www.reddit.com/u/ResonantGenesis/" target="_blank" rel="noopener noreferrer" className={styles.quickLink}>
              <span>🔗</span> Reddit
            </a>
          </div>
        </aside>
      </div>

      {/* ── Create Community Modal ── */}
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
    </div>
  );
};

/* ═══════════════════════════════════
   Inline Create Post (in-feed, not modal)
   ═══════════════════════════════════ */
interface InlineCreatePostProps {
  communitySlug: string | null;
  communities: Community[];
  onCreated: (p: Post) => void;
  onCancel: () => void;
}

const InlineCreatePost: React.FC<InlineCreatePostProps> = ({ communitySlug, communities, onCreated, onCancel }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'link'>('text');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [chosenSlug, setChosenSlug] = useState(communitySlug || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const effectiveSlug = communitySlug || chosenSlug;
  const effectiveBody = activeTab === 'link' ? linkUrl.trim() || null : body.trim() || null;

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10 MB');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      const key = `rabbit/images/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      formData.append('file', file);
      formData.append('key', key);
      const res = await fetch('/api/v1/storage/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Upload failed (HTTP ${res.status})`);
      }
      const data = await res.json();
      setImageUrl(data.url || `/api/v1/storage/download/${key}`);
    } catch (e: any) {
      setError(e.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !effectiveSlug) return;
    setSubmitting(true);
    setError(null);
    try {
      const p = await apiFetch<Post>('/posts', {
        method: 'POST',
        body: JSON.stringify({
          community_slug: effectiveSlug,
          title: title.trim(),
          body: effectiveBody,
          image_url: imageUrl.trim() || null,
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
    <div className={styles.inlineCreatePost}>
      <div className={styles.inlineCreateHeader}>
        <span className={styles.inlineCreateTitle}>
          {effectiveSlug ? `Create post in r/${displaySlug(effectiveSlug)}` : 'Create a new post'}
        </span>
      </div>

      {/* Community picker (shown only if no community is pre-selected) */}
      {!communitySlug && (
        <select
          className={styles.inlineInput}
          value={chosenSlug}
          onChange={e => setChosenSlug(e.target.value)}
        >
          <option value="">Choose a community...</option>
          {communities.map(c => (
            <option key={c.slug} value={c.slug}>r/{displaySlug(c.slug)} — {c.name}</option>
          ))}
        </select>
      )}

      {/* Tabs */}
      <div className={styles.createTabs}>
        {(['text', 'image', 'link'] as const).map(tab => (
          <button
            key={tab}
            className={`${styles.createTab} ${activeTab === tab ? styles.createTabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'text' && 'Text'}
            {tab === 'image' && <><ImageIcon /> Image</>}
            {tab === 'link' && <><LinkIcon /> Link</>}
          </button>
        ))}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <input
        ref={titleRef}
        className={styles.inlineInput}
        placeholder="Title *"
        value={title}
        onChange={e => setTitle(e.target.value)}
        maxLength={300}
      />

      <div className={styles.titleCount}>{title.length}/300</div>

      {activeTab === 'text' && (
        <textarea
          className={styles.inlineTextarea}
          placeholder="Body text (optional)"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={5}
        />
      )}

      {activeTab === 'image' && (
        <div className={styles.imageUploadArea}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
          />
          {!imageUrl ? (
            <div
              className={styles.imageDropZone}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImageUpload(f); }}
            >
              {uploading ? (
                <><span className={styles.spinner} /> Uploading...</>
              ) : (
                <>
                  <ImageIcon />
                  <span style={{ marginTop: 8 }}>Click to upload or drag & drop</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted, #71717a)', marginTop: 4 }}>PNG, JPG, GIF up to 10MB</span>
                </>
              )}
            </div>
          ) : (
            <div className={styles.imagePreview}>
              <img src={imageUrl} alt="Preview" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <button
                className={styles.btnSecondary}
                style={{ marginTop: 8 }}
                onClick={() => { setImageUrl(''); if (fileRef.current) fileRef.current.value = ''; }}
              >
                Remove image
              </button>
            </div>
          )}
          <input
            className={styles.inlineInput}
            placeholder="Or paste image URL..."
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            style={{ marginTop: 8 }}
          />
        </div>
      )}

      {activeTab === 'link' && (
        <input
          className={styles.inlineInput}
          placeholder="Paste a URL..."
          value={linkUrl}
          onChange={e => setLinkUrl(e.target.value)}
        />
      )}

      <div className={styles.inlineCreateActions}>
        <button className={styles.btnSecondary} onClick={onCancel}>Cancel</button>
        <button
          className={styles.btnPrimary}
          disabled={submitting || uploading || !title.trim() || !effectiveSlug}
          onClick={handleSubmit}
          style={{ opacity: submitting || uploading || !title.trim() || !effectiveSlug ? 0.5 : 1 }}
        >
          {submitting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════
   Post Card Component
   ═══════════════════════════════════ */
interface PostCardProps {
  post: Post;
  localVote: number;
  onVote: (v: 1 | -1) => void;
  onClick: () => void;
  onCommunityClick: () => void;
  onShareToggle: () => void;
  onDelete: () => void;
  shareDropdownId: number | null;
  onShareClose: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, localVote, onVote, onClick, onCommunityClick, onShareToggle, onDelete, shareDropdownId, onShareClose }) => (
  <div className={styles.postCard}>
    <div className={styles.postVoteSidebar}>
      <button
        className={`${styles.voteBtn} ${localVote === 1 ? styles.voteBtnUpActive : ''}`}
        onClick={(e) => { e.stopPropagation(); onVote(1); }}
        title="Upvote"
      >
        <UpArrow active={localVote === 1} />
      </button>
      <span className={styles.voteCount}>{post.vote_score}</span>
      <button
        className={`${styles.voteBtn} ${localVote === -1 ? styles.voteBtnDownActive : ''}`}
        onClick={(e) => { e.stopPropagation(); onVote(-1); }}
        title="Downvote"
      >
        <DownArrow active={localVote === -1} />
      </button>
    </div>
    <div className={styles.postContent}>
      <div className={styles.postMeta}>
        {post.community_slug && (
          <span className={styles.postCommunity} onClick={(e) => { e.stopPropagation(); onCommunityClick(); }}>
            r/{displaySlug(post.community_slug)}
          </span>
        )}
        <span className={styles.metaDot}>•</span>
        <span className={styles.postAuthor}>u/{post.author_user_id.slice(0, 8)}</span>
        <span className={styles.metaDot}>•</span>
        <span className={styles.timeAgo}>{timeAgo(post.created_at)}</span>
      </div>
      <div className={styles.postTitle} onClick={onClick}>{post.title}</div>
      {post.body && <div className={styles.postBody}>{post.body}</div>}
      {post.image_url && (
        <div className={styles.postImage}>
          <img src={post.image_url} alt="" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }} />
        </div>
      )}
      <div className={styles.postFooter}>
        <button className={styles.postFooterBtn} onClick={onClick}>
          <CommentIcon /> {post.comment_count} Comment{post.comment_count !== 1 ? 's' : ''}
        </button>
        <div style={{ position: 'relative' }}>
          <button className={styles.postFooterBtn} onClick={(e) => { e.stopPropagation(); onShareToggle(); }}>
            <ShareIcon /> Share
          </button>
          {shareDropdownId === post.id && (
            <ShareDropdown postId={post.id} postTitle={post.title} onClose={onShareClose} />
          )}
        </div>
        <button
          className={`${styles.postFooterBtn} ${styles.postFooterBtnDanger}`}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete (your posts only)"
        >
          <TrashIcon />
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
  communitySlug?: string;
  comments: Comment[];
  loadingComments: boolean;
  localVotes: Record<string, number>;
  newCommentBody: string;
  replyTo: number | null;
  submittingComment: boolean;
  error: string | null;
  onBack: () => void;
  onVote: (type: 'post' | 'comment', id: number, v: 1 | -1) => void;
  onCommentChange: (v: string) => void;
  onSubmitComment: (parentId?: number | null) => void;
  onClearError: () => void;
  onDeletePost: (id: number) => void;
  onDeleteComment: (id: number) => void;
  onShareToggle: (id: number) => void;
  onReplyTo: (id: number | null) => void;
  shareDropdownId: number | null;
  onShareClose: () => void;
}

const PostDetailView: React.FC<PostDetailProps> = ({
  post, communitySlug, comments, loadingComments, localVotes,
  newCommentBody, replyTo, submittingComment, error,
  onBack, onVote, onCommentChange, onSubmitComment, onClearError,
  onDeletePost, onDeleteComment, onShareToggle, onReplyTo, shareDropdownId, onShareClose,
}) => {
  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

  return (
    <>
      <button className={styles.backBtn} onClick={onBack}>
        <BackIcon /> Back to feed
      </button>
      <div className={styles.postDetail}>
        <div className={styles.postMeta} style={{ marginBottom: 8 }}>
          {communitySlug && <span className={styles.postCommunity}>r/{displaySlug(communitySlug)}</span>}
          <span>•</span>
          <span className={styles.postAuthor}>u/{post.author_user_id.slice(0, 8)}</span>
          <span>•</span>
          <span className={styles.timeAgo}>{timeAgo(post.created_at)}</span>
          {post.is_locked && <span style={{ color: '#f59e0b', fontWeight: 600 }}>Locked</span>}
        </div>
        <div className={styles.postDetailTitle}>{post.title}</div>
        {post.body && <div className={styles.postDetailBody}>{post.body}</div>}
        {post.image_url && (
          <div className={styles.postDetailImage}>
            <img src={post.image_url} alt="" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }} />
          </div>
        )}

        <div className={styles.postDetailActions}>
          <button
            className={`${styles.voteBtn} ${(localVotes[`post:${post.id}`] ?? 0) === 1 ? styles.voteBtnUpActive : ''}`}
            onClick={() => onVote('post', post.id, 1)}
          >
            <UpArrow active={(localVotes[`post:${post.id}`] ?? 0) === 1} />
          </button>
          <span className={styles.voteCount}>{post.vote_score}</span>
          <button
            className={`${styles.voteBtn} ${(localVotes[`post:${post.id}`] ?? 0) === -1 ? styles.voteBtnDownActive : ''}`}
            onClick={() => onVote('post', post.id, -1)}
          >
            <DownArrow active={(localVotes[`post:${post.id}`] ?? 0) === -1} />
          </button>
          <span className={styles.actionDivider} />
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <button className={styles.postFooterBtn} onClick={() => onShareToggle(post.id)}>
              <ShareIcon /> Share
            </button>
            {shareDropdownId === post.id && (
              <ShareDropdown postId={post.id} postTitle={post.title} onClose={onShareClose} />
            )}
          </div>
          <button
            className={`${styles.postFooterBtn} ${styles.postFooterBtnDanger}`}
            onClick={() => onDeletePost(post.id)}
            title="Delete (your posts only)"
          >
            <TrashIcon /> Delete
          </button>
        </div>

        {/* Comments */}
        <div className={styles.commentsSection}>
          <div className={styles.commentsTitle}>
            {comments.length} Comment{comments.length !== 1 ? 's' : ''}
          </div>

          {/* Top-level comment box */}
          {!post.is_locked && replyTo === null && (
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
                  onClick={() => onSubmitComment(null)}
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
            commentTree.map(c => (
              <div key={c.id} className={styles.commentItem} style={{ marginLeft: Math.min(c.depth, 5) * 24 }}>
                {c.depth > 0 && <div className={styles.commentThreadLine} />}
                <div className={styles.commentMeta}>
                  <span className={styles.commentAuthor}>u/{c.author_user_id.slice(0, 8)}</span>
                  {' • '}
                  <span className={styles.timeAgo}>{timeAgo(c.created_at)}</span>
                  {c.is_removed_by_mod && <span style={{ color: '#ef4444', fontSize: 11 }}>[removed]</span>}
                </div>
                <div className={styles.commentBody}>{c.body}</div>
                <div className={styles.commentActions}>
                  <button
                    className={`${styles.voteBtn} ${(localVotes[`comment:${c.id}`] ?? 0) === 1 ? styles.voteBtnUpActive : ''}`}
                    onClick={() => onVote('comment', c.id, 1)}
                    style={{ width: 24, height: 24 }}
                  >
                    <UpArrow active={(localVotes[`comment:${c.id}`] ?? 0) === 1} />
                  </button>
                  <span className={styles.voteCount} style={{ fontSize: 11 }}>{localVotes[`comment:${c.id}`] ?? 0}</span>
                  <button
                    className={`${styles.voteBtn} ${(localVotes[`comment:${c.id}`] ?? 0) === -1 ? styles.voteBtnDownActive : ''}`}
                    onClick={() => onVote('comment', c.id, -1)}
                    style={{ width: 24, height: 24 }}
                  >
                    <DownArrow active={(localVotes[`comment:${c.id}`] ?? 0) === -1} />
                  </button>
                  {!post.is_locked && (
                    <button
                      className={styles.postFooterBtn}
                      onClick={() => onReplyTo(replyTo === c.id ? null : c.id)}
                      style={{ marginLeft: 4 }}
                    >
                      <ReplyIcon /> Reply
                    </button>
                  )}
                  <button
                    className={`${styles.postFooterBtn} ${styles.postFooterBtnDanger}`}
                    onClick={() => onDeleteComment(c.id)}
                    title="Delete (your comments only)"
                  >
                    <TrashIcon />
                  </button>
                </div>

                {/* Inline reply box */}
                {replyTo === c.id && (
                  <div className={styles.commentBox} style={{ marginTop: 8, marginLeft: 24 }}>
                    {error && (
                      <div className={styles.error} onClick={onClearError} style={{ cursor: 'pointer' }}>
                        {error} (click to dismiss)
                      </div>
                    )}
                    <textarea
                      className={styles.commentTextarea}
                      placeholder={`Reply to u/${c.author_user_id.slice(0, 8)}...`}
                      value={newCommentBody}
                      onChange={e => onCommentChange(e.target.value)}
                      autoFocus
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button className={styles.btnSecondary} onClick={() => { onReplyTo(null); onCommentChange(''); }}>
                        Cancel
                      </button>
                      <button
                        className={styles.btnPrimary}
                        disabled={submittingComment || !newCommentBody.trim()}
                        onClick={() => onSubmitComment(c.id)}
                        style={{ opacity: submittingComment || !newCommentBody.trim() ? 0.5 : 1 }}
                      >
                        {submittingComment ? 'Posting…' : 'Reply'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

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

export default RabbitPage;
