import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import api from '../../lib/api';

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get(`/orders/${id}`).then(r => setOrder(r.data)).catch(console.error);
    }
  }, [id]);

  const formatCOP = (amount: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <CheckCircle2 size={72} className="text-[#d4af37] mx-auto mb-6" />
        <h1 className="text-3xl font-light text-white mb-2">¡Pedido Confirmado!</h1>
        <p className="text-gray-400 font-light mb-2">
          Tu pedido <span className="text-[#d4af37]">#{id}</span> fue registrado exitosamente.
        </p>
        {order && (
          <p className="text-gray-500 text-sm mb-8 font-light">
            Total: <span className="text-white">{formatCOP(order.total)}</span> — 
            Pago: <span className="text-white"> {order.payment_method}</span>
          </p>
        )}
        <p className="text-gray-400 mb-8 font-light">
          Se ha abierto WhatsApp con el detalle de tu pedido. Nuestro equipo te confirmará el envío pronto. 🚀
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 rounded-xl transition-colors"
          >
            Seguir comprando
          </Link>
          <Link
            to={`/track/${id}`}
            className="px-6 py-3 bg-[#d4af37] text-black font-medium rounded-xl hover:bg-[#c5a028] transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            Seguir mi pedido
          </Link>
        </div>
      </div>
    </div>
  );
}
