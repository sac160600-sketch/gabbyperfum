import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = [
    {
      name: 'Oud Nuit',
      description: 'Una fragancia misteriosa con notas profundas de madera de agar (oud), incienso ahumado y un toque de azafrán que evoca las noches estrelladas en el desierto.',
      price: 320000,
      volume_ml: 100,
      category: 'Unisex',
      image_url: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=600&auto=format&fit=crop'
    },
    {
      name: 'Rose Éternelle',
      description: 'Un bouquet sofisticado de rosas de Grasse, peonías frescas y un fondo sutil de almizcle blanco. La esencia pura de la elegancia femenina.',
      price: 280000,
      volume_ml: 100,
      category: 'Dama',
      image_url: 'https://images.unsplash.com/photo-1594034183955-3dc07e1586bd?q=80&w=600&auto=format&fit=crop'
    },
    {
      name: 'Vetiver Intense',
      description: 'La fuerza terrenal del vetiver haitiano combinada con la frescura cítrica de la bergamota y un toque seco de madera de cedro para el hombre moderno.',
      price: 295000,
      volume_ml: 100,
      category: 'Caballero',
      image_url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?q=80&w=600&auto=format&fit=crop'
    },
    {
      name: 'Fleur de Nectar',
      description: 'Una explosión vibrante de flores blancas, jazmín sambac y un dulzor adictivo de vainilla de Madagascar. Sensual y luminosa.',
      price: 310000,
      volume_ml: 100,
      category: 'Dama',
      image_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop'
    },
    {
      name: 'Noir Absolu',
      description: 'Poderoso y magnético. Pimienta negra, cuero puro y notas de tabaco rubio que dejan una estela inolvidable y sofisticada.',
      price: 340000,
      volume_ml: 100,
      category: 'Caballero',
      image_url: 'https://images.unsplash.com/photo-1523293111606-d70375a060cc?q=80&w=600&auto=format&fit=crop'
    },
    {
      name: 'Santal Doré',
      description: 'Madera de sándalo cremosa, cardamomo especiado y un suave abrazo de ámbar. Una creación perfectamente equilibrada que trasciende géneros.',
      price: 360000,
      volume_ml: 100,
      category: 'Unisex',
      image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop'
    }
  ];

  for (const p of products) {
    await prisma.product.create({
      data: p
    });
  }

  console.log('Seeded 6 real perfumes.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
