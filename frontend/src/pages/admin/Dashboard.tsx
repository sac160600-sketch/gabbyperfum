import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Package } from 'lucide-react';
import api from '../../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalSales: 0, pendingOrders: 0, catalogSize: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/products')
        ]);
        
        const orders = ordersRes.data;
        const products = productsRes.data;
        
        const totalSales = orders.reduce((sum: number, o: any) => sum + o.total, 0);
        const pendingOrders = orders.filter((o: any) => o.status === 'Pendiente').length;
        
        setStats({
          totalSales,
          pendingOrders,
          catalogSize: products.length
        });
      } catch (error) {
        console.error("Error fetching stats", error);
      }
    };
    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(amount);
  };

  const cards = [
    { title: 'Ventas Totales', value: formatCurrency(stats.totalSales), icon: DollarSign, color: 'text-green-400' },
    { title: 'Órdenes Pendientes', value: stats.pendingOrders, icon: ShoppingBag, color: 'text-amber-400' },
    { title: 'Catálogo de Productos', value: stats.catalogSize, icon: Package, color: 'text-[#d4af37]' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{card.title}</p>
                <h3 className="text-3xl font-light text-gray-100">{card.value}</h3>
              </div>
              <div className={`p-4 bg-black rounded-xl ${card.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 h-64 flex items-center justify-center">
        <p className="text-gray-500 font-light">Métricas adicionales próximamente...</p>
      </div>
    </div>
  );
}
