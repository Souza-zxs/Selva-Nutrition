-- Seed inicial: os 7 produtos que já existiam hardcoded em src/data/content.ts

insert into public.products (slug, tag, name, body, price, image, stock, active) values
  ('tallow-texana', 'OURO LÍQUIDO', 'Manteiga Tallow (Texana)',
   'A gordura mais estável e nutritiva do mundo para elevar sua performance na cozinha e na vida.',
   79.90, '/products/tallow-texana.webp', 100, true),
  ('tallow-ervas-finas', 'GASTRONOMIA ANCESTRAL', 'Manteiga Tallow de Ervas Finas',
   'Sabor gastronômico com densidade nutricional ancestral.',
   89.90, '/products/tallow-ervas-finas.webp', 100, true),
  ('ghee-tradicional', 'AYURVEDA CORE', 'Manteiga Ghee Tradicional',
   'O combustível puro para o seu cérebro e a cura para o seu intestino.',
   69.90, '/products/ghee-tradicional.svg', 100, true),
  ('ghee-ervas-finas', 'AYURVEDA REFINADO', 'Manteiga Ghee Ervas Finas',
   'Digestibilidade máxima e sabor refinado em cada colherada.',
   79.90, '/products/ghee-ervas-finas.svg', 100, true),
  ('hidratante-facial-tallow', 'SKINCARE BIOLÓGICO', 'Hidratante Facial Tallow, Vitamina E + Cacau e Baunilha',
   'Nutrição biológica profunda para um rosto rejuvenescido e livre de químicos.',
   99.90, '/products/hidratante-facial-tallow.webp', 100, true),
  ('hidratante-aloe-vera', 'REGENERAÇÃO BOTÂNICA', 'Hidratante Tallow + Aloe Vera',
   'O equilíbrio perfeito entre regeneração animal e hidratação botânica.',
   89.90, '/products/hidratante-aloe-vera.svg', 100, true),
  ('desodorante-barra', 'SAÚDE HORMONAL', 'Desodorante sem Alumínio',
   'Proteção real contra o odor sem comprometer sua saúde hormonal.',
   49.90, '/products/desodorante-barra.webp', 100, true)
on conflict (slug) do nothing;
