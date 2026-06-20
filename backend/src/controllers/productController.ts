import { Request, Response } from 'express';
import supabase from '../supabaseClient';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;

    let query = supabase.from('Product').select('*');
    if (category) query = query.eq('category', String(category));

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('Product')
      .select('*')
      .eq('id', parseInt(id as string))
      .single();

    if (error || !data) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('Product')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('Product')
      .update(req.body)
      .eq('id', parseInt(id as string))
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('Product')
      .delete()
      .eq('id', parseInt(id as string));

    if (error) throw error;

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
