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
      
      <div className="relative">
        {/* Floating Status Bar Overlay */}
        <div className="absolute right-4 top-4 z-40 scale-90 transform-gpu origin-top-right">
          {restaurantStatus?.week && (
            <OpeningHoursDropdown 
              week={restaurantStatus.week} 
              statusText={restaurantStatus?.nowStatus?.text}
              isOpen={restaurantStatus?.nowStatus?.isOpen}
            />
          )}
        </div>

        <HeroSection />
      </div>

      <div className="reveal"><StorySection /></div>
      <div className="reveal"><GrillSection /></div>
      <div className="reveal"><MenuSection /></div>
      <div className="reveal"><ReservationSection /></div>
    </main>
  );
};

export default Home;
