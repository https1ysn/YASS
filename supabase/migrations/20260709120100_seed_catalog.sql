-- ============================================================================
-- Yasso Store — catalog seed
-- Mirrors the placeholder catalog the frontend shipped with.
-- Image URLs point at the app's bundled placeholders in /public; swap them for
-- Storage URLs (bucket "products") when real photography is uploaded.
-- ============================================================================

-- ---------------------------------------------------------------- categories
insert into public.categories (slug, name, description, image_url, is_coming_soon, sort_order) values
  ('women',          'Women',            'Ready-to-wear, shoes and accessories in warm neutral tones.', '/images/categories/women.jpg',       false, 1),
  ('men',            'Men',              'Tailoring and refined essentials, cut to last.',              '/images/categories/men.jpg',         false, 2),
  ('accessories',    'Accessories',      'Leather goods, silk and jewelry — the quiet finish.',         '/images/categories/accessories.jpg', false, 3),
  ('fragrance',      'Fragrance',        'Santal, amber and cedar — signature scents of the maison.',   '/images/categories/fragrance.jpg',   false, 4),
  ('summer-capsule', 'Summer Capsule',   'Effortless silhouettes for warmer days, in silk and linen.',  '/images/instagram/i5.jpg',           false, 5),
  ('atelier',        'The Atelier Line', 'Hand-finished, numbered pieces — arriving this autumn.',      '/images/instagram/i4.jpg',           true,  6)
on conflict (slug) do nothing;

-- ------------------------------------------------------------------ products
insert into public.products
  (slug, name, description, price, compare_at_price, category_id, badge, colors, sizes, availability, collection_slugs, rating, review_count)
values
  ('silk-wrap-dress', 'Silk Wrap Dress', 'Fluid mulberry silk with a self-tie waist, cut for movement.',
    420, null, (select id from public.categories where slug = 'women'), 'New',
    '{sand,chocolate}', '{XS,S,M,L}', 'in-stock', '{summer-capsule}', 4.9, 9),

  ('pleated-midi-skirt', 'Pleated Midi Skirt', 'Knife pleats in crepe de chine that catch light as you walk.',
    310, null, (select id from public.categories where slug = 'women'), 'Best Seller',
    '{camel,noir}', '{XS,S,M,L,XL}', 'in-stock', '{}', 4.7, 22),

  ('cashmere-cardigan', 'Cashmere Cardigan', 'Grade-A Mongolian cashmere with corozo buttons.',
    480, null, (select id from public.categories where slug = 'women'), null,
    '{ivory,sand}', '{S,M,L}', 'made-to-order', '{}', 4.8, 35),

  ('linen-shirt-dress', 'Linen Shirt Dress', 'Washed European linen, relaxed through the body.',
    290, 360, (select id from public.categories where slug = 'women'), null,
    '{ivory,camel}', '{XS,S,M,L}', 'in-stock', '{summer-capsule}', 4.6, 48),

  ('silk-camisole', 'Silk Camisole', 'Bias-cut sandwashed silk with adjustable straps.',
    180, null, (select id from public.categories where slug = 'women'), null,
    '{ivory,noir}', '{XS,S,M,L}', 'in-stock', '{summer-capsule}', 4.9, 21),

  ('cashmere-crewneck', 'Cashmere Crewneck', 'Twelve-gauge knit with saddle shoulders and ribbed trims.',
    340, null, (select id from public.categories where slug = 'men'), null,
    '{chocolate,noir,sand}', '{S,M,L,XL}', 'in-stock', '{}', 4.7, 34),

  ('wool-overcoat', 'Wool Overcoat', 'Double-faced Italian wool, half-canvassed and unlined.',
    890, null, (select id from public.categories where slug = 'men'), 'Best Seller',
    '{camel,noir}', '{S,M,L,XL}', 'made-to-order', '{}', 4.8, 47),

  ('oxford-shirt', 'Oxford Shirt', 'Garment-washed oxford cotton with mother-of-pearl buttons.',
    165, null, (select id from public.categories where slug = 'men'), null,
    '{ivory,sand}', '{S,M,L,XL}', 'in-stock', '{}', 4.6, 20),

  ('suede-loafers', 'Suede Loafers', 'Unstructured calf suede on a hand-stitched leather sole.',
    450, null, (select id from public.categories where slug = 'men'), null,
    '{chocolate,camel}', '{40,41,42,43,44}', 'in-stock', '{}', 4.9, 33),

  ('leather-tote', 'Leather Tote', 'Vegetable-tanned leather that deepens with every year.',
    580, 690, (select id from public.categories where slug = 'accessories'), null,
    '{chocolate,noir}', '{One size}', 'in-stock', '{}', 4.7, 46),

  ('silk-scarf-dune', 'Silk Scarf — Dune', 'Hand-rolled twill silk in the maison''s dune print.',
    160, null, (select id from public.categories where slug = 'accessories'), 'Best Seller',
    '{sand,camel}', '{One size}', 'in-stock', '{}', 4.8, 19),

  ('gold-signet-ring', 'Gold Signet Ring', 'Recycled 18k gold, polished by hand in our atelier.',
    620, null, (select id from public.categories where slug = 'accessories'), null,
    '{camel}', '{6,7,8}', 'made-to-order', '{}', 4.6, 32),

  ('santal-parfum', 'Santal Eau de Parfum', 'Australian sandalwood, amber and a trace of sea salt.',
    185, null, (select id from public.categories where slug = 'fragrance'), 'New',
    '{noir}', '{50ml,100ml}', 'in-stock', '{}', 4.9, 45)
on conflict (slug) do nothing;

-- ------------------------------------------------------------ product_images
-- Four views per product, mirroring the app's derived placeholder gallery.
insert into public.product_images (product_id, url, alt, sort_order)
select p.id, v.url, p.name, v.sort_order
from public.products p
join (values
  ('silk-wrap-dress',    '/images/products/p1.jpg', 0), ('silk-wrap-dress',    '/images/products/p2.jpg', 1),
  ('silk-wrap-dress',    '/images/products/p3.jpg', 2), ('silk-wrap-dress',    '/images/products/p4.jpg', 3),
  ('pleated-midi-skirt', '/images/products/p7.jpg', 0), ('pleated-midi-skirt', '/images/products/p8.jpg', 1),
  ('pleated-midi-skirt', '/images/products/p1.jpg', 2), ('pleated-midi-skirt', '/images/products/p2.jpg', 3),
  ('cashmere-cardigan',  '/images/products/p5.jpg', 0), ('cashmere-cardigan',  '/images/products/p6.jpg', 1),
  ('cashmere-cardigan',  '/images/products/p7.jpg', 2), ('cashmere-cardigan',  '/images/products/p8.jpg', 3),
  ('linen-shirt-dress',  '/images/products/p3.jpg', 0), ('linen-shirt-dress',  '/images/products/p4.jpg', 1),
  ('linen-shirt-dress',  '/images/products/p5.jpg', 2), ('linen-shirt-dress',  '/images/products/p6.jpg', 3),
  ('silk-camisole',      '/images/products/p6.jpg', 0), ('silk-camisole',      '/images/products/p7.jpg', 1),
  ('silk-camisole',      '/images/products/p8.jpg', 2), ('silk-camisole',      '/images/products/p1.jpg', 3),
  ('cashmere-crewneck',  '/images/products/p2.jpg', 0), ('cashmere-crewneck',  '/images/products/p3.jpg', 1),
  ('cashmere-crewneck',  '/images/products/p4.jpg', 2), ('cashmere-crewneck',  '/images/products/p5.jpg', 3),
  ('wool-overcoat',      '/images/products/p4.jpg', 0), ('wool-overcoat',      '/images/products/p5.jpg', 1),
  ('wool-overcoat',      '/images/products/p6.jpg', 2), ('wool-overcoat',      '/images/products/p7.jpg', 3),
  ('oxford-shirt',       '/images/products/p8.jpg', 0), ('oxford-shirt',       '/images/products/p1.jpg', 1),
  ('oxford-shirt',       '/images/products/p2.jpg', 2), ('oxford-shirt',       '/images/products/p3.jpg', 3),
  ('suede-loafers',      '/images/products/p8.jpg', 0), ('suede-loafers',      '/images/products/p1.jpg', 1),
  ('suede-loafers',      '/images/products/p2.jpg', 2), ('suede-loafers',      '/images/products/p3.jpg', 3),
  ('leather-tote',       '/images/products/p3.jpg', 0), ('leather-tote',       '/images/products/p4.jpg', 1),
  ('leather-tote',       '/images/products/p5.jpg', 2), ('leather-tote',       '/images/products/p6.jpg', 3),
  ('silk-scarf-dune',    '/images/products/p6.jpg', 0), ('silk-scarf-dune',    '/images/products/p7.jpg', 1),
  ('silk-scarf-dune',    '/images/products/p8.jpg', 2), ('silk-scarf-dune',    '/images/products/p1.jpg', 3),
  ('gold-signet-ring',   '/images/products/p1.jpg', 0), ('gold-signet-ring',   '/images/products/p2.jpg', 1),
  ('gold-signet-ring',   '/images/products/p3.jpg', 2), ('gold-signet-ring',   '/images/products/p4.jpg', 3),
  ('santal-parfum',      '/images/products/p4.jpg', 0), ('santal-parfum',      '/images/products/p5.jpg', 1),
  ('santal-parfum',      '/images/products/p6.jpg', 2), ('santal-parfum',      '/images/products/p7.jpg', 3)
) as v(slug, url, sort_order) on v.slug = p.slug
where not exists (
  select 1 from public.product_images pi where pi.product_id = p.id
);
