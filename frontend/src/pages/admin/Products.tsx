import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../lib/api';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', volume_ml: '', category: 'Dama', image_url: ''
  });

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      await api.delete(`/products/${id}`);
      fetchProducts();
    }
  };

  const handleEdit = (prod: any) => {
    setEditingId(prod.id);
    setFormData({
      name: prod.name,
      description: prod.description,
      price: prod.price.toString(),
      volume_ml: prod.volume_ml.toString(),
      category: prod.category,
      image_url: prod.image_url || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      volume_ml: parseInt(formData.volume_ml)
    };
    
    if (editingId) {
      await api.put(`/products/${editingId}`, payload);
    } else {
      await api.post('/products', payload);
    }
    
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', volume_ml: '', category: 'Dama', image_url: '' });
    fetchProducts();
  };

  return (
    <div className="space-y-6 text-gray-100">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-light">Catálogo de Perfumes</h2>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', description: '', price: '', volume_ml: '', category: 'Dama', image_url: '' });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-[#d4af37] text-black px-4 py-2 rounded-lg hover:bg-[#c5a028] transition-colors"
        >
          <Plus size={20} />
          <span>Agregar Producto</span>
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/50 text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Nombre</th>
              <th className="px-6 py-4 font-medium">Categoría</th>
              <th className="px-6 py-4 font-medium">Volumen</th>
              <th className="px-6 py-4 font-medium">Precio</th>
              <th className="px-6 py-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {products.map(prod => (
              <tr key={prod.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">{prod.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">{prod.category}</span>
                </td>
                <td className="px-6 py-4">{prod.volume_ml} ml</td>
                <td className="px-6 py-4">${prod.price.toLocaleString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(prod)} className="text-gray-400 hover:text-[#d4af37] mr-3 transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(prod.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No hay productos en el catálogo</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-light mb-4">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input placeholder="Nombre del perfume" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-[#d4af37] outline-none" />
              <textarea placeholder="Descripción detallada" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 h-24 text-white focus:border-[#d4af37] outline-none" />
              <div className="flex gap-4">
                <input type="number" placeholder="Precio (COP)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-[#d4af37] outline-none" />
                <input type="number" placeholder="Volumen (ml)" value={formData.volume_ml} onChange={e => setFormData({...formData, volume_ml: e.target.value})} required className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-[#d4af37] outline-none" />
              </div>
              <div className="flex gap-4">
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-[#d4af37] outline-none">
                  <option>Dama</option>
                  <option>Caballero</option>
                  <option>Unisex</option>
                </select>
                <input placeholder="URL de Imagen (opcional)" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-black border border-gray-800 rounded-lg px-4 py-2 text-white focus:border-[#d4af37] outline-none" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancelar</button>
                <button type="submit" className="bg-[#d4af37] text-black px-6 py-2 rounded-lg hover:bg-[#c5a028] transition-colors">{editingId ? 'Guardar Cambios' : 'Crear Producto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
