import { Request, Response } from 'express';
import prisma from '../prismaClient';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, payment_method, customerName, customerEmail, customerPhone, shippingAddress, shippingCity } = req.body;
    
    const total = items.reduce((acc: number, item: any) => acc + (item.product.price * item.quantity), 0);
    const payment_status = payment_method === 'PSE' ? 'Pagado' : 'Pagar al llegar';

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          total,
          payment_method,
          payment_status,
          status: 'Pendiente',
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          shippingCity
        }
      });
      
      const orderItems = items.map((item: any) => ({
        orderId: newOrder.id,
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price
      }));
      
      await tx.orderItem.createMany({ data: orderItems });
      
      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: { items: { include: { product: true } } }
    });
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;
    
    const updateData: any = {};
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;
    
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const markWhatsappSent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { whatsapp_sent: true }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
