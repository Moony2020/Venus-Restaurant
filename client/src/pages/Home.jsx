import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import StorySection from '../components/home/StorySection';
import GrillSection from '../components/home/GrillSection';
import MenuSection from '../components/home/MenuSection';
import ReservationSection from '../components/home/ReservationSection';
import SiteHeader from '../layout/SiteHeader';
import OpeningHoursDropdown from '../components/menu/OpeningHoursDropdown';
import { useCart } from '../context/CartContext';
import { useRestaurantStatus } from '../hooks/useRestaurantStatus';

const Home = () => {
  const { count } = useCart();
  const { data: restaurantStatus } = useRestaurantStatus();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-background text-white">
      <SiteHeader />
      <section className="mx-auto w-[92vw] max-w-[2200px] px-6 py-2 text-xs text-white/75 lg:px-8">
        <div className="flex items-center justify-end">
          {restaurantStatus?.week && (
            <OpeningHoursDropdown 
              week={restaurantStatus.week} 
              statusText={restaurantStatus?.nowStatus?.text}
              isOpen={restaurantStatus?.nowStatus?.isOpen}
            />
          )}
        </div>
      </section>
      <HeroSection />
      <div className="reveal"><StorySection /></div>
      <div className="reveal"><GrillSection /></div>
      <div className="reveal"><MenuSection /></div>
      <div className="reveal"><ReservationSection /></div>
    </main>
  );
};

export default Home;
