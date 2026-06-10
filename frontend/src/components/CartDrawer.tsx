import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, subtotal } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-gray-800 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-light text-white flex items-center gap-2">
            <ShoppingBag className="text-[#d4af37]" />
            Tu Carrito
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4 bg-[#111827] p-4 rounded-xl border border-gray-800">
                <div className="w-20 h-24 bg-black rounded-lg flex items-center justify-center overflow-hidden border border-gray-800">
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#d4af37] text-xs font-light">GABBYPERFUM</span>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between">
                      <h3 className="text-white font-medium">{item.product.name}</h3>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-gray-500 hover:text-red-400">
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-gray-400 text-sm">{item.product.volume_ml} ml</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-black rounded-lg px-2 py-1 border border-gray-800">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="text-gray-400 hover:text-[#d4af37]">
                        <Minus size={14} />
                      </button>
                      <span className="text-white text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="text-gray-400 hover:text-[#d4af37]">
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-[#d4af37] font-medium">
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-gray-800 bg-[#0a0a0a]">
          <div className="flex justify-between text-gray-300 mb-4">
            <span>Subtotal</span>
            <span className="text-xl text-white font-medium">${subtotal.toLocaleString()}</span>
          </div>
          <button 
            disabled={items.length === 0}
            onClick={() => {
              setIsCartOpen(false);
              navigate('/checkout'); // Próximamente Fase 6
            }}
            className="w-full bg-[#d4af37] hover:bg-[#c5a028] disabled:bg-gray-800 disabled:text-gray-500 text-black font-medium py-4 rounded-xl transition-colors tracking-wide"
          >
            PROCEDER AL PAGO
          </button>
        </div>
      </div>
    </>
  );
}
