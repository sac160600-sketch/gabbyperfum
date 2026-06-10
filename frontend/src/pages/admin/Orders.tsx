import { useEffect, useState } from 'react';
import api from '../../lib/api';

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: number, type: 'status' | 'payment_status', value: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { [type]: value });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-gray-100">
      <h2 className="text-2xl font-light">Gestión de Órdenes</h2>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/50 text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Orden #</th>
              <th className="px-6 py-4 font-medium">Cliente</th>
              <th className="px-6 py-4 font-medium">Total</th>
              <th className="px-6 py-4 font-medium">Método</th>
              <th className="px-6 py-4 font-medium">Estado Pedido</th>
              <th className="px-6 py-4 font-medium">Estado Pago</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 text-[#d4af37]">#{order.id}</td>
                <td className="px-6 py-4">{order.user?.name || 'Usuario'}</td>
                <td className="px-6 py-4">${order.total.toLocaleString()}</td>
                <td className="px-6 py-4">{order.payment_method}</td>
                <td className="px-6 py-4">
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, 'status', e.target.value)}
                    className="bg-black border border-gray-800 rounded p-1.5 text-sm text-gray-300 outline-none focus:border-[#d4af37]"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En preparación">En preparación</option>
                    <option value="Enviado">Enviado</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={order.payment_status}
                    onChange={(e) => handleStatusChange(order.id, 'payment_status', e.target.value)}
                    className="bg-black border border-gray-800 rounded p-1.5 text-sm text-gray-300 outline-none focus:border-[#d4af37]"
                  >
                    <option value="Pagado">Pagado</option>
                    <option value="Pagar al llegar">Pagar al llegar</option>
                  </select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No hay órdenes registradas aún</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
