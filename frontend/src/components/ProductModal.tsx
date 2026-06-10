import { X, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function ProductModal({ product, onClose }: { product: any, onClose: () => void }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-[#050505] border border-gray-800 shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white bg-black/50 rounded-full"
        >
          <X size={24} />
        </button>

        <div className="md:w-1/2 bg-[#111827] aspect-square md:aspect-auto flex items-center justify-center relative">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
             <div className="text-center text-[#d4af37]">
               <h1 className="text-6xl font-light tracking-widest">GABBYPERFUM</h1>
             </div>
          )}
        </div>

        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[#050505]">
          <span className="text-[#d4af37] text-sm tracking-widest uppercase mb-2">
            {product.category}
          </span>
          <h2 className="text-3xl md:text-4xl font-light text-white mb-4">
            {product.name}
          </h2>
          <p className="text-2xl font-medium text-gray-300 mb-6">
            ${product.price.toLocaleString()}
          </p>
          
          <div className="prose prose-invert mb-8 text-gray-400 font-light leading-relaxed">
            <p>{product.description}</p>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <span className="text-gray-500">Volumen:</span>
            <span className="px-4 py-2 border border-gray-800 text-gray-300">
              {product.volume_ml} ml
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-800">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-3 text-gray-400 hover:text-[#d4af37]"
              >
                -
              </button>
              <span className="w-12 text-center text-white">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-3 text-gray-400 hover:text-[#d4af37]"
              >
                +
              </button>
            </div>
            <button 
              onClick={handleAdd}
              className="flex-1 bg-[#d4af37] text-black font-medium py-3 px-6 flex items-center justify-center gap-2 hover:bg-black hover:text-[#d4af37] border border-[#d4af37] transition-all"
            >
              <ShoppingBag size={20} />
              AÑADIR AL CARRITO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
