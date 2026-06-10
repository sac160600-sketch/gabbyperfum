import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, ChevronRight, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import api from '../../lib/api';

type PaymentMethod = 'PSE' | 'Contra entrega';

interface ContactForm {
  name: string;
  phone: string;
  email: string;
  city: string;
  neighborhood: string;
  address: string;
}

const WHATSAPP_NUMBER = '573001234567'; // ← Reemplaza con el número real de GABBYPERFUM

const formatCOP = (amount: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PSE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ContactForm>({
    name: '', phone: '', email: '', city: '', neighborhood: '', address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const buildWhatsAppMessage = (orderId: number): string => {
    const itemLines = items
      .map(i => `- ${i.quantity}x ${i.product.name} ${i.product.volume_ml}ml (${formatCOP(i.product.price * i.quantity)})`)
      .join('\n');

    return (
      `¡Hola GABBYPERFUM! ✨ Acabo de realizar un pedido en la tienda web.\n\n` +
      `📦 *Pedido ID:* #${orderId}\n` +
      `👤 *Cliente:* ${form.name}\n` +
      `📞 *Teléfono:* ${form.phone}\n` +
      `📧 *Email:* ${form.email}\n` +
      `📍 *Dirección:* ${form.address}, ${form.neighborhood}, ${form.city}\n` +
      `💸 *Método de Pago:* ${paymentMethod}\n\n` +
      `*Detalle del Pedido:*\n${itemLines}\n\n` +
      `*Total a Pagar:* ${formatCOP(subtotal)} COP\n\n` +
      `¡Quedo atento a la confirmación de mi envío! 🚀`
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const payload = {
        items,
        payment_method: paymentMethod,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        shippingAddress: `${form.address}, ${form.neighborhood}`,
        shippingCity: form.city,
      };

      const { data: order } = await api.post('/orders', payload);
      const orderId: number = order.id;

      // Mark WhatsApp sent
      await api.patch(`/orders/${orderId}/whatsapp`);

      // Clear cart
      clearCart();

      // Build and encode WhatsApp message
      const message = buildWhatsAppMessage(orderId);
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank');

      // Navigate to confirmation
      navigate(`/order-confirmation/${orderId}`);
    } catch (err: any) {
      console.error(err);
      setError('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400 gap-4">
        <p className="text-xl font-light">Tu carrito está vacío.</p>
        <button onClick={() => navigate('/')} className="text-[#d4af37] hover:underline">
          Volver al catálogo →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-light text-white mb-2 tracking-wide">Finalizar Compra</h1>
      <p className="text-gray-400 mb-12 font-light">Completa tus datos para confirmar el pedido.</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* ── LEFT: Forms ── */}
        <div className="lg:col-span-3 space-y-10">

          {/* Contact Info */}
          <section>
            <h2 className="text-lg font-medium text-[#d4af37] mb-6 tracking-widest uppercase">Datos de Contacto</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Nombre Completo', name: 'name', placeholder: 'María García', colSpan: 'sm:col-span-2' },
                { label: 'Teléfono / Celular', name: 'phone', placeholder: '300 123 4567' },
                { label: 'Correo Electrónico', name: 'email', placeholder: 'correo@ejemplo.com' },
                { label: 'Ciudad / Municipio', name: 'city', placeholder: 'Medellín', colSpan: 'sm:col-span-2' },
                { label: 'Barrio', name: 'neighborhood', placeholder: 'El Poblado' },
                { label: 'Dirección de Residencia', name: 'address', placeholder: 'Calle 10 # 43D-52' },
              ].map(f => (
                <div key={f.name} className={f.colSpan ?? ''}>
                  <label className="block text-sm text-gray-400 mb-1.5">{f.label}</label>
                  <input
                    type={f.name === 'email' ? 'email' : 'text'}
                    name={f.name}
                    value={form[f.name as keyof ContactForm]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                    required
                    className="w-full bg-[#111827] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#d4af37] transition-colors"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Payment Method */}
          <section>
            <h2 className="text-lg font-medium text-[#d4af37] mb-6 tracking-widest uppercase">Método de Pago</h2>
            <div className="space-y-3">
              {/* PSE Option */}
              <label
                htmlFor="pse"
                className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'PSE' ? 'border-[#d4af37] bg-[#d4af37]/5' : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  id="pse"
                  name="payment"
                  checked={paymentMethod === 'PSE'}
                  onChange={() => setPaymentMethod('PSE')}
                  className="mt-1 accent-[#d4af37]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck size={20} className="text-[#d4af37]" />
                    <span className="text-white font-medium">Pago Electrónico con PSE</span>
                  </div>
                  <p className="text-gray-400 text-sm font-light">
                    Pago seguro en línea mediante débito bancario. Todas las transacciones están encriptadas y son 100% seguras.
                  </p>
                  <div className="flex gap-3 mt-3">
                    {['Bancolombia', 'Davivienda', 'Nequi', 'Wompi'].map(bank => (
                      <span key={bank} className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded border border-gray-700">{bank}</span>
                    ))}
                  </div>
                </div>
              </label>

              {/* COD Option */}
              <label
                htmlFor="cod"
                className={`flex items-start gap-4 p-5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'Contra entrega' ? 'border-[#d4af37] bg-[#d4af37]/5' : 'border-gray-800 hover:border-gray-600'
                }`}
              >
                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  checked={paymentMethod === 'Contra entrega'}
                  onChange={() => setPaymentMethod('Contra entrega')}
                  className="mt-1 accent-[#d4af37]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck size={20} className="text-[#d4af37]" />
                    <span className="text-white font-medium">Pago Contra Entrega</span>
                  </div>
                  <p className="text-gray-400 text-sm font-light">
                    Paga en efectivo o transferencia bancaria en el momento de recibir tu pedido. El paquete será verificado antes de pagar.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-lg">{error}</p>
          )}
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div className="lg:col-span-2">
          <div className="sticky top-28 bg-[#0a0a0a] border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-medium text-white mb-6">Resumen del Pedido</h2>

            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-3">
                  <div className="w-14 h-16 bg-[#111827] rounded-lg border border-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                    {item.product.image_url
                      ? <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                      : <span className="text-[#d4af37] text-[10px]">GABBYPERFUM</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-gray-500 text-xs">{item.product.volume_ml}ml × {item.quantity}</p>
                    <p className="text-[#d4af37] text-sm mt-1">{formatCOP(item.product.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-800 pt-4 space-y-2 mb-6">
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Subtotal</span>
                <span>{formatCOP(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Envío</span>
                <span className="text-green-400">Gratis</span>
              </div>
              <div className="flex justify-between text-white font-medium text-lg pt-2 border-t border-gray-800">
                <span>Total</span>
                <span className="text-[#d4af37]">{formatCOP(subtotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#c5a028] disabled:bg-gray-700 disabled:text-gray-500 text-black font-medium py-4 rounded-xl transition-colors tracking-wide"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Confirmar Pedido
                  <ChevronRight size={20} />
                </>
              )}
            </button>

            <p className="text-xs text-gray-600 text-center mt-4 font-light">
              Al confirmar serás redirigido a WhatsApp para coordinar tu envío.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
