import React from 'react';

/**
 * Skeleton individual para um Card de Tópico da Comunidade
 */
export const PostSkeleton: React.FC = () => {
  return (
    <div className="bg-[#101B1E] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-lg space-y-5 relative overflow-hidden animate-fade-in">
      {/* Top Author Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 skeleton-shimmer shrink-0" />
          <div className="space-y-1.5">
            <div className="w-28 h-3.5 bg-white/10 rounded-md skeleton-shimmer" />
            <div className="w-20 h-2.5 bg-white/5 rounded-md skeleton-shimmer" />
          </div>
        </div>
        <div className="w-24 h-6 bg-white/10 rounded-full skeleton-shimmer" />
      </div>

      {/* Title & Body */}
      <div className="space-y-2.5 pt-1">
        <div className="w-3/4 h-5 bg-white/10 rounded-lg skeleton-shimmer" />
        <div className="w-full h-3.5 bg-white/5 rounded-md skeleton-shimmer" />
        <div className="w-5/6 h-3.5 bg-white/5 rounded-md skeleton-shimmer" />
      </div>

      {/* Bottom Reactions & Comments Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-16 h-8 bg-white/10 rounded-xl skeleton-shimmer" />
          <div className="w-16 h-8 bg-white/10 rounded-xl skeleton-shimmer" />
        </div>
        <div className="w-24 h-8 bg-white/10 rounded-xl skeleton-shimmer" />
      </div>
    </div>
  );
};

/**
 * Skeleton para Destaques / Stories 9:16
 */
export const StorySkeleton: React.FC = () => {
  return (
    <div className="flex-none w-36 sm:w-44 aspect-[9/16] rounded-2xl overflow-hidden relative border border-white/10 bg-[#101B1E] skeleton-shimmer">
      <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/20 skeleton-shimmer" />
    </div>
  );
};

/**
 * Skeleton para Grid 2x2 do Dashboard
 */
export const DashboardGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-[#101B1E] border border-white/10 rounded-2xl p-4 space-y-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 skeleton-shimmer" />
          <div className="w-16 h-5 bg-white/10 rounded-md skeleton-shimmer" />
          <div className="w-24 h-3 bg-white/5 rounded-md skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
};
