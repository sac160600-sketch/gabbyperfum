import { useState, useEffect } from 'react';
import api from '../../lib/api';
import ProductCard from '../../components/ProductCard';
import ProductModal from '../../components/ProductModal';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<string>('Todos');
  const [search, setSearch] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products');
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  const categories = ['Todos', 'Dama', 'Caballero', 'Unisex'];

  const filteredProducts = Array.isArray(products)
    ? products.filter(p => {
        if (!p || !p.name) return false;
        const matchCategory = category === 'Todos' || p.category === category;
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        return matchCategory && matchSearch;
      })
    : [];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10" />
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="relative z-20 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-light tracking-wider mb-6 text-white drop-shadow-lg">
            Esencia <span className="text-[#d4af37]">Inolvidable</span>
          </h1>
          <p className="text-xl md:text-2xl font-light tracking-wide text-gray-300 max-w-2xl mx-auto">
            Descubre nuestra colección exclusiva de fragancias premium.
          </p>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 py-2 rounded-full border transition-all whitespace-nowrap ${
                  category === cat 
                    ? 'border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10' 
                    : 'border-gray-800 text-gray-400 hover:border-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <input 
            type="text"
            placeholder="Buscar fragancia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 bg-transparent border-b border-gray-800 py-2 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onOpen={() => setSelectedProduct(product)} 
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            <p className="text-xl font-light">No encontramos fragancias con esos filtros.</p>
          </div>
        )}
      </section>

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
