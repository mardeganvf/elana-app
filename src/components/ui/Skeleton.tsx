import React from 'react';

interface SkeletonProps {
  className?: string;
}

const SkeletonBase: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/[0.06] rounded-2xl ${className}`} />
);

/** Large card skeleton for dashboard sections */
export const SkeletonCard: React.FC = () => (
  <div className="bg-[#101B1E] rounded-3xl border border-white/10 p-6 space-y-4">
    <div className="flex items-center gap-3">
      <SkeletonBase className="w-12 h-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonBase className="h-4 w-2/3 rounded-lg" />
        <SkeletonBase className="h-3 w-1/3 rounded-lg" />
      </div>
    </div>
    <SkeletonBase className="h-24 w-full rounded-2xl" />
    <div className="flex gap-2">
      <SkeletonBase className="h-8 w-20 rounded-xl" />
      <SkeletonBase className="h-8 w-24 rounded-xl" />
    </div>
  </div>
);

/** Profile header skeleton */
export const SkeletonProfile: React.FC = () => (
  <div className="bg-[#101B1E] rounded-3xl border border-white/10 p-6 sm:p-8">
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <SkeletonBase className="w-24 h-24 rounded-full" />
      <div className="flex-1 space-y-3 w-full">
        <SkeletonBase className="h-6 w-48 rounded-xl mx-auto sm:mx-0" />
        <SkeletonBase className="h-4 w-32 rounded-lg mx-auto sm:mx-0" />
        <div className="flex gap-3 justify-center sm:justify-start">
          <SkeletonBase className="h-8 w-16 rounded-xl" />
          <SkeletonBase className="h-8 w-16 rounded-xl" />
          <SkeletonBase className="h-8 w-16 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

/** Community post skeleton */
export const SkeletonPost: React.FC = () => (
  <div className="bg-[#101B1E] rounded-3xl border border-white/10 p-5 space-y-4">
    <div className="flex items-center gap-3">
      <SkeletonBase className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonBase className="h-3.5 w-28 rounded-lg" />
        <SkeletonBase className="h-2.5 w-20 rounded-lg" />
      </div>
    </div>
    <div className="space-y-2">
      <SkeletonBase className="h-3.5 w-full rounded-lg" />
      <SkeletonBase className="h-3.5 w-5/6 rounded-lg" />
      <SkeletonBase className="h-3.5 w-2/3 rounded-lg" />
    </div>
    <div className="flex gap-3">
      <SkeletonBase className="h-7 w-14 rounded-xl" />
      <SkeletonBase className="h-7 w-14 rounded-xl" />
      <SkeletonBase className="h-7 w-14 rounded-xl" />
    </div>
  </div>
);
