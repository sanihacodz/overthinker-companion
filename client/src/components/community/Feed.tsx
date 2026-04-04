import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

export default function Feed() {
  const dummyPosts = [
    {
      id: 1,
      author: 'DeluluMainCharacter_99',
      thought: 'Should I text my ex back after they liked my story?',
      vibeCheck: 'Extremely delulu',
      upvotes: 342
    },
    {
      id: 2,
      author: 'AnxiousGremlin_12',
      thought: 'Do my coworkers hate me or are they just busy?',
      vibeCheck: 'Need validation ASAP',
      upvotes: 1105
    }
  ];

  return (
    <div className="w-full max-w-2xl mx-auto p-4 flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-neon-blue)] to-white">
        Community Brain-Rot
      </h2>
      {dummyPosts.map(post => (
        <div key={post.id} className="bg-[#1f2833]/80 backdrop-blur rounded-xl p-4 border border-white/10 shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[var(--color-neon-purple)] font-semibold">{post.author}</span>
            <span className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">Vibe: {post.vibeCheck}</span>
          </div>
          <p className="text-lg font-medium text-white mb-4">"{post.thought}"</p>
          <div className="flex gap-4">
            <button className="flex items-center gap-1 text-gray-400 hover:text-[var(--color-neon-blue)] transition">
              <ThumbsUp size={16} /> {post.upvotes}
            </button>
            <button className="flex items-center gap-1 text-gray-400 hover:text-[var(--color-neon-pink)] transition">
              <ThumbsDown size={16} />
            </button>
            <button className="text-sm text-gray-400 hover:text-white transition ml-auto border border-white/20 px-3 py-1 rounded-full">
              View Tree
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
