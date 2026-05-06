import MenuCard from './MenuCard';
import MenuSkeletonCard from '../MenuSkeletonCard';

const MenuGrid = ({ items, loading, onAdd, lastAddedId, restaurantOpen }) => {
  if (loading) {
    return (
      <div className="grid gap-3 md:grid-cols-2 min-[1900px]:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <MenuSkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-white/10 bg-white/[0.03] p-8 text-center text-white/65">
        Inga rätter matchar ditt val just nu.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 min-[1900px]:grid-cols-3">
      {items.map((item) => (
        <MenuCard
          key={item._id}
          item={item}
          onAdd={onAdd}
          added={lastAddedId === item._id}
          restaurantOpen={restaurantOpen}
        />
      ))}
    </div>
  );
};

export default MenuGrid;

