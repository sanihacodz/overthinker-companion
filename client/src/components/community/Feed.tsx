import React, { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Feed({ onViewTree }: { onViewTree: (tree: any) => void }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    
    // Set up realtime channel
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'thoughts' },
        (payload) => {
          console.log('Realtime update:', payload);
          fetchPosts(); // Refetch on any change for simplicity MVP
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('thoughts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id: string, currentUpvotes: number) => {
    try {
      const { error } = await supabase
        .from('thoughts')
        .update({ upvotes: currentUpvotes + 1 })
        .eq('id', id);
        
      if (error) throw error;
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  if (loading) {
    return <div className="text-center p-10">Loading brain-rot...</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-neon-blue)] to-white">
        Community Brain-Rot
      </h2>
      
      {posts.length === 0 ? (
        <div className="text-gray-400 text-center py-10">No thoughts published yet. Be the first!</div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="bg-[#1f2833]/80 backdrop-blur rounded-xl p-4 border border-white/10 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[var(--color-neon-purple)] font-semibold">{post.author}</span>
              <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">Vibe: {post.vibe_check}</span>
            </div>
            <p className="text-lg font-medium text-white mb-4">"{post.dilemma}"</p>
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => handleUpvote(post.id, post.upvotes)}
                className="flex items-center gap-1 text-gray-400 hover:text-[var(--color-neon-blue)] transition"
              >
                <ThumbsUp size={16} /> {post.upvotes}
              </button>
              <button className="flex items-center gap-1 text-gray-400 hover:text-[var(--color-neon-pink)] transition border-none bg-transparent">
                <ThumbsDown size={16} />
              </button>
              <button 
                onClick={() => onViewTree(post.tree_data)}
                className="text-sm text-[var(--color-dark-bg)] bg-white hover:bg-gray-200 font-bold transition ml-auto px-4 py-1.5 rounded-full"
              >
                View Tree
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
