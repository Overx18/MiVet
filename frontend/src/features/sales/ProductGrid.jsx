// frontend/src/features/sales/ProductGrid.jsx
// Muestra los productos y servicios en tarjetas
import { useState, useMemo } from 'react';

const ProductCard = ({ item, onAddToCart }) => {
  const isProduct = item.type === 'product';
  const hasStock = !isProduct || item.quantity > 0;

  return (
    <div className={`bg-white rounded-lg shadow p-4 flex flex-col justify-between ${!hasStock ? 'opacity-50' : ''}`}>
      <div>
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-800">{item.name}</h3>
          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${isProduct ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
            {isProduct ? 'Producto' : 'Servicio'}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{item.description || 'Sin descripción'}</p>
        {isProduct && <p className="text-xs text-gray-500 mt-2">Stock: {item.quantity}</p>}
      </div>
      <div className="flex justify-between items-center mt-4">
        <span className="text-lg font-bold text-gray-900">S/ {Number(item.price).toFixed(2)}</span>
        <button
          onClick={() => onAddToCart(item)}
          disabled={!hasStock}
          className="px-3 py-1 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          + Añadir
        </button>
      </div>
    </div>
  );
};

export default function ProductGrid({ items, onAddToCart }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('Todos');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = category === 'Todos' || (category === 'Productos' && item.type === 'product') || (category === 'Servicios' && item.type === 'service');
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, searchTerm, category]);

  return (
    <div>
      <div className="sticky top-0 bg-gray-100 p-2 z-10">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded-md mb-2"
        />
        <div className="flex space-x-2">
          {['Todos', 'Productos', 'Servicios'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${category === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {filteredItems.map(item => (
          <ProductCard key={`${item.type}-${item.id}`} item={item} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
}