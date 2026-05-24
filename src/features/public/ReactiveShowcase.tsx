import { useEffect, useState } from 'react';
import { getProductsByCategory, type Product, formatBRL } from '@/data/mock-data';
import { MessageCircle } from 'lucide-react';
import './ReactiveShowcase.css';

interface Props {
  deviceType: string;
}

const ReactiveShowcase = ({ deviceType }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // "A vitrine carrega de forma lazy — primeiro carrega o status, depois carrega os produtos em segundo plano"
    const loadProducts = () => {
      setIsLoading(true);
      setTimeout(() => {
        let items = getProductsByCategory(deviceType);
        // Se não tiver do tipo do aparelho, tenta puxar acessórios gerais para não ficar vazio na demo
        if (items.length === 0) {
          items = getProductsByCategory('acessorio');
        }
        setProducts(items);
        setIsLoading(false);
      }, 1200); // Demora intencional para mostrar o lazy load
    };

    loadProducts();
  }, [deviceType]);

  if (isLoading) {
    return (
      <div className="showcase-card">
        <h3>Enquanto seu aparelho está aqui, aproveite:</h3>
        <div className="showcase-grid">
          {[1, 2].map(i => (
            <div key={i} className="product-skeleton skeleton" style={{ height: '160px' }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="showcase-card">
      <h3>Enquanto seu aparelho está aqui, aproveite:</h3>
      
      <div className="showcase-grid">
        {products.map(product => (
          <div key={product.id} className="product-item">
            <div className="product-image-placeholder">
              {product.nome.substring(0, 2).toUpperCase()}
            </div>
            <div className="product-info">
              <span className="product-name" title={product.nome}>{product.nome}</span>
              <div className="product-price-row">
                <span className="product-price">{formatBRL(product.preco_venda)}</span>
                {product.desconto_vitrine && (
                  <span className="product-discount badge-info">
                    -{product.desconto_vitrine}%
                  </span>
                )}
              </div>
            </div>
            <a 
              href={`https://wa.me/5592988473321?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20produto%3A%20${encodeURIComponent(product.nome)}`}
              className="btn btn-outline btn-buy"
            >
              <MessageCircle size={14} /> Quero esse
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReactiveShowcase;
