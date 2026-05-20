const MenuSkeletonCard = () => (
  <div className="animate-pulse grid grid-cols-[1fr_104px] sm:grid-cols-[1fr_120px] xl:grid-cols-[1fr_140px] border border-white/10 bg-[#0d1218]/45 p-4 rounded-2xl">
    {/* Left: Text Skeleton */}
    <div className="flex flex-col justify-between pr-4">
      <div>
        <div className="h-6 w-3/4 rounded bg-white/10 animate-pulse" />
        <div className="mt-2 h-4 w-1/4 rounded bg-white/10 animate-pulse" />
        <div className="mt-4 space-y-2">
          <div className="h-3 w-5/6 rounded bg-white/5 animate-pulse" />
          <div className="h-3 w-4/5 rounded bg-white/5 animate-pulse" />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-white/5 animate-pulse" />
        <div className="h-5 w-16 rounded-full bg-white/5 animate-pulse" />
      </div>
    </div>

    {/* Right: Image Skeleton */}
    <div className="self-center justify-self-end h-[104px] w-[104px] sm:h-[120px] sm:w-[120px] xl:h-[140px] xl:w-[140px] rounded-xl bg-white/10 animate-pulse" />
  </div>
);

export default MenuSkeletonCard;
