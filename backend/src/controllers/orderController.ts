import { Request, Response } from 'express';
import supabase from '../supabaseClient';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, payment_method, customerName, customerEmail, customerPhone, shippingAddress, shippingCity } = req.body;

    const total = items.reduce((acc: number, item: { product: { price: number }; quantity: number }) =>
      acc + item.product.price * item.quantity, 0);
    const payment_status = payment_method === 'PSE' ? 'Pagado' : 'Pagar al llegar';

    const { data: newOrder, error: orderError } = await supabase
      .from('Order')
      .insert({ total, payment_method, payment_status, status: 'Pendiente', customerName, customerEmail, customerPhone, shippingAddress, shippingCity })
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map((item: { product: { id: number; price: number }; quantity: number }) => ({
      orderId: newOrder.id,
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const { error: itemsError } = await supabase.from('OrderItem').insert(orderItems);

    if (itemsError) {
      await supabase.from('Order').delete().eq('id', newOrder.id);
      throw itemsError;
    }

    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('Order')
      .select(`*, items:OrderItem(*, product:Product(*))`)
      .eq('id', parseInt(id as string))
      .single();

    if (error || !data) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('Order')
      .select(`*, user:User(name, email)`)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    const updateData: Record<string, string> = {};
    if (status) updateData['status'] = status;
    if (payment_status) updateData['payment_status'] = payment_status;

    const { data, error } = await supabase
      .from('Order')
      .update(updateData)
      .eq('id', parseInt(id as string))
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const markWhatsappSent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('Order')
      .update({ whatsapp_sent: true })
      .eq('id', parseInt(id as string))
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
