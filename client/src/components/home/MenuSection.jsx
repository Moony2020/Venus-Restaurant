import { Link } from 'react-router-dom';

const categories = [
  { title: 'Förrätter', slug: 'starters', image: '/images/menu-starter.png' },
  { title: 'Varmrätter', slug: 'alacarte', image: '/images/hero-steak.png' },
  { title: 'Desserter', slug: 'others', image: '/images/menu-dessert.png' },
  { title: 'Dryck', slug: 'drinks', image: '/images/menu-drink.png' }
];

const MenuSection = () => (
  <section className="mx-auto max-w-7xl px-[12%] py-20 lg:px-20 lg:py-32 [@media(min-width:640px)_and_(max-width:786px)]:px-[14%] [@media(min-width:787px)_and_(max-width:1023px)]:px-[22%]">
    <div className="reveal">
      <p className="mb-4 text-center text-[10px] font-medium uppercase tracking-[0.4em] text-gold/80">Smakernas Galax</p>
      <h2 className="mb-12 text-center font-display text-4xl text-white sm:text-5xl lg:text-6xl">Utforska Vår Meny</h2>
    </div>

    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((item) => (
        <Link
          key={item.title}
          to={`/menu?category=${item.slug}`}
          onClick={() => window.scrollTo(0, 0)}
          className="group relative mx-auto w-full overflow-hidden border border-white/5 bg-panel transition-all duration-500 hover:border-gold/30 reveal lg:max-w-none"
        >
          <div className="aspect-[16/9] overflow-hidden sm:aspect-[3/4] lg:aspect-[3/4] [@media(min-width:640px)_and_(max-width:786px)]:aspect-[3/4.5]">
            <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" loading="lazy" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
            <p className="font-display text-2xl text-white transition-transform duration-500 group-hover:-translate-y-2 sm:text-3xl">{item.title}</p>
            <div className="mt-2 h-[1px] w-0 bg-gold transition-all duration-500 group-hover:w-12" />
          </div>
        </Link>
      ))}
    </div>
  </section>
);

export default MenuSection;

