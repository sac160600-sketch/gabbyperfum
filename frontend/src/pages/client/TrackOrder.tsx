import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PackageSearch, Clock, PackageCheck, Truck, ChevronLeft } from 'lucide-react';
import api from '../../lib/api';

const formatCOP = (amount: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);

const STATUS_STEPS = ['Pendiente', 'En preparación', 'Enviado'];

export default function TrackOrder() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      api.get(`/orders/${id}`)
        .then(res => {
          setOrder(res.data);
        })
        .catch(err => {
          console.error(err);
          setError('No se pudo encontrar el pedido o hubo un error en la conexión.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[#d4af37] text-lg font-light animate-pulse">Buscando información del pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <PackageSearch size={64} className="text-gray-700 mb-6" />
        <h1 className="text-2xl font-light text-white mb-2">Pedido no encontrado</h1>
        <p className="text-gray-400 mb-8 max-w-md font-light">{error}</p>
        <Link to="/" className="text-[#d4af37] hover:text-white transition-colors flex items-center gap-2">
          <ChevronLeft size={20} /> Volver a la tienda
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center gap-4 mb-10">
        <Link to="/" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-light text-white tracking-wide">Seguimiento de Pedido</h1>
          <p className="text-gray-500 font-light text-sm mt-1">ID: #{order.id}</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-medium text-[#d4af37] mb-8 tracking-widest uppercase">Estado Actual</h2>
        
        {/* Progress Bar */}
        <div className="relative mb-12">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-800 -translate-y-1/2 rounded-full" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-[#d4af37] -translate-y-1/2 rounded-full transition-all duration-1000"
            style={{ width: `${(Math.max(currentStepIndex, 0) / (STATUS_STEPS.length - 1)) * 100}%` }}
          />
          
          <div className="relative flex justify-between">
            {STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              let Icon = Clock;
              if (index === 1) Icon = PackageCheck;
              if (index === 2) Icon = Truck;

              return (
                <div key={step} className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-[#0a0a0a] relative z-10 transition-colors duration-500 ${
                    isCompleted ? 'bg-[#d4af37] text-black' : 'bg-gray-800 text-gray-500'
                  }`}>
                    <Icon size={20} className={isCurrent ? 'animate-pulse' : ''} />
                  </div>
                  <span className={`text-sm font-medium ${isCompleted ? 'text-white' : 'text-gray-600'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-800 pt-8">
          <div>
            <h3 className="text-sm text-gray-500 mb-2 uppercase tracking-wider">Información de Envío</h3>
            <p className="text-white font-medium">{order.customerName}</p>
            <p className="text-gray-400 text-sm mt-1">{order.shippingAddress}</p>
            <p className="text-gray-400 text-sm">{order.shippingCity}</p>
            <p className="text-gray-400 text-sm mt-1">{order.customerPhone}</p>
          </div>
          <div>
            <h3 className="text-sm text-gray-500 mb-2 uppercase tracking-wider">Detalles de Pago</h3>
            <p className="text-white font-medium">{order.payment_method}</p>
            <p className={`text-sm font-medium mt-1 ${order.payment_status === 'Pagado' ? 'text-green-400' : 'text-yellow-400'}`}>
              {order.payment_status}
            </p>
            <div className="mt-4 flex justify-between items-center bg-[#111827] p-3 rounded-lg border border-gray-800">
              <span className="text-gray-400 text-sm">Total:</span>
              <span className="text-[#d4af37] font-medium">{formatCOP(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-gray-800 rounded-2xl p-8">
        <h2 className="text-xl font-medium text-white mb-6">Artículos del Pedido</h2>
        <div className="space-y-4">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex gap-4 items-center bg-[#111827] border border-gray-800 p-4 rounded-xl">
              <div className="w-16 h-20 bg-gray-900 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                {item.product.image_url 
                  ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                  : <span className="text-[#d4af37] text-[10px]">GABBYPERFUM</span>
                }
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium">{item.product.name}</h3>
                <p className="text-gray-400 text-sm">{item.product.volume_ml}ml</p>
                <p className="text-gray-500 text-sm mt-1">Cantidad: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-[#d4af37] font-medium">{formatCOP(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
