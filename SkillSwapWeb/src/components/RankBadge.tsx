import React from 'react';

interface RankBadgeProps {
  rank: string;
  points: number;
  size?: 'sm' | 'md' | 'lg';
}

const RankBadge: React.FC<RankBadgeProps> = ({ rank, points, size = 'md' }) => {
  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'novice':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'expert':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'master':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRankIcon = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'novice':
        return '🌱';
      case 'beginner':
        return '🌿';
      case 'intermediate':
        return '🌳';
      case 'advanced':
        return '🏆';
      case 'expert':
        return '👑';
      case 'master':
        return '✨';
      default:
        return '🌱';
    }
  };

  const getNextRankThreshold = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'novice':
        return 100;
      case 'beginner':
        return 500;
      case 'intermediate':
        return 2000;
      case 'advanced':
        return 5000;
      case 'expert':
        return 10000;
      case 'master':
        return null;
      default:
        return 100;
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const nextThreshold = getNextRankThreshold(rank);
  const progress = nextThreshold ? Math.min((points / nextThreshold) * 100, 100) : 100;

  return (
    <div className="flex flex-col space-y-1">
      <div className={`
        inline-flex items-center space-x-1 rounded-full border font-medium
        ${getRankColor(rank)} ${sizeClasses[size]}
      `}>
        <span>{getRankIcon(rank)}</span>
        <span>{rank}</span>
        <span className="text-xs opacity-75">({points})</span>
      </div>
      
      {nextThreshold && size !== 'sm' && (
        <div className="w-full">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>{points}</span>
            <span>{nextThreshold}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-primary-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-center">
            {nextThreshold - points} points to next rank
          </div>
        </div>
      )}
    </div>
  );
};

export default RankBadge;