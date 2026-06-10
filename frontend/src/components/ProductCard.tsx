import { useCart } from '../context/CartContext';
import { ShoppingBag, Check } from 'lucide-react';

export default function ProductCard({ product, onOpen }: { product: any, onOpen: () => void }) {
  const { items, addToCart } = useCart();
  
  const isInCart = items.some(item => item.product.id === product.id);

  return (
    <div className="group flex flex-col gap-4 cursor-pointer">
      <div 
        onClick={onOpen}
        className="aspect-[3/4] bg-[#111827] overflow-hidden rounded-sm relative border border-gray-900"
      >
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#d4af37]">
            <span className="text-2xl font-light tracking-widest">GABBYPERFUM</span>
            <span className="text-xs text-gray-600 mt-2">{product.category}</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-medium text-white">{product.name}</h3>
        <p className="text-sm text-gray-400">{product.volume_ml} ml • {product.category}</p>
        <p className="text-[#d4af37] font-medium mt-1">${product.price.toLocaleString()}</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          addToCart(product, 1);
        }}
        className={`mt-2 py-3 w-full border flex items-center justify-center gap-2 transition-colors ${
          isInCart 
            ? 'bg-black border-[#d4af37] text-[#d4af37]' 
            : 'bg-[#d4af37] border-[#d4af37] text-black hover:bg-black hover:text-[#d4af37]'
        }`}
      >
        {isInCart ? (
          <>
            <Check size={18} />
            <span>EN EL CARRITO</span>
          </>
        ) : (
          <>
            <ShoppingBag size={18} />
            <span>AÑADIR</span>
          </>
        )}
      </button>
    </div>
  );
}
