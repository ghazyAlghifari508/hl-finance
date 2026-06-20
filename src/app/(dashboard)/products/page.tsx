import { getProducts } from "@/app/actions/products";
import ProductsClient from "@/components/products/ProductsClient";

export default async function ProductsPage() {
  // Hanya ambil produk yang tidak di-soft-delete
  const result = await getProducts(false);

  // Jika database belum ter-migrate, return array kosong sebagai fallback sementara
  // agar halaman tidak langsung crash sebelum user setup Supabase.
  const products = result.data || [];

  return (
    <ProductsClient initialProducts={products} />
  );
}
