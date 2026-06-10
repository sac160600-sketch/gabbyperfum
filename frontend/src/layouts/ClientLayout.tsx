import { Outlet, Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartDrawer from '../components/CartDrawer';

export default function ClientLayout() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#d4af37] selection:text-black">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="text-3xl font-light tracking-[0.2em] text-[#d4af37]">
            GABBYPERFUM
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm tracking-wide font-light text-gray-300">
            <Link to="/" className="hover:text-white transition-colors">INICIO</Link>
            <Link to="/" className="hover:text-white transition-colors">CATÁLOGO</Link>
            <Link to="/orders" className="hover:text-white transition-colors">MIS PEDIDOS</Link>
          </div>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-gray-300 hover:text-white transition-colors"
          >
            <ShoppingBag size={24} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-[#d4af37] text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-black">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-160px)]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-black py-12 text-center text-gray-500 font-light text-sm">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-light tracking-[0.2em] text-gray-700 mb-4">GABBYPERFUM</h2>
          <p className="mb-6">La esencia de la exclusividad.</p>
          <div className="flex justify-center gap-6 mb-8">
            <Link to="#" className="hover:text-gray-300">Términos</Link>
            <Link to="#" className="hover:text-gray-300">Privacidad</Link>
            <Link to="#" className="hover:text-gray-300">Contacto</Link>
          </div>
          <div className="flex justify-between items-center text-xs">
            <p>&copy; {new Date().getFullYear()} GABBYPERFUM. Todos los derechos reservados.</p>
            <Link to="/admin/login" className="text-gray-800 hover:text-gray-600 transition-colors">Gestión</Link>
          </div>
        </div>
      </footer>

      <CartDrawer />
    </div>
  );
}
