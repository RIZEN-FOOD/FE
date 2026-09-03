export type WishlistItem = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  thumbnailUrl: string | null;
  soldOut: boolean;
  addedAt: string;
};
