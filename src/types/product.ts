export type Product = {
  id: string;
  slug: string;
  tag: string | null;
  name: string;
  body: string | null;
  price: number;
  image?: string | null;
  icon?: string | null;
  narrative?: string | null;
  specs?: string[] | null;
  stock: number;
  active: boolean;
};
