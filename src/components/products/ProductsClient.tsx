"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { deleteProduct } from "@/app/actions/products";
import { Badge } from "@/components/ui/badge";
import { ProductForm } from "./ProductForm";

export default function ProductsClient({ initialProducts }: { initialProducts: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini? Transaksi lama tidak akan terhapus.")) {
      await deleteProduct(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[32px] leading-[1.16] tracking-[-0.96px] font-semibold">Produk</h1>
          <p className="text-steel text-[16px] mt-1">Kelola katalog Logam Mulia dan Barang</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Table */}
      <div className="bg-paper-white rounded-[24px] border border-sand overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-parchment text-steel border-b border-sand uppercase tracking-wider text-[12px] font-medium">
              <tr>
                <th className="px-6 py-4">Nama Produk</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4 text-right">Harga Base (Jual)</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {initialProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-steel">
                    Belum ada produk. Silakan tambah produk baru.
                  </td>
                </tr>
              ) : (
                initialProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-parchment/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-ink-black">{product.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant={product.tipe === "LM" ? "default" : "outline"}>
                        {product.tipe}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums">
                      {formatCurrency(product.hargaBase)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(product)} className="h-8 px-2 text-electric-blue hover:text-electric-blue/80 hover:bg-electric-blue/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="h-8 px-2 text-ember-orange hover:text-ember-orange/80 hover:bg-ember-orange/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simple Modal overlay for Form (Fallback for shadcn Dialog) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/50 backdrop-blur-sm">
          <div className="bg-paper-white rounded-[24px] shadow-md w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-sand">
              <h2 className="text-[20px] font-semibold tracking-[-0.46px]">
                {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
              </h2>
            </div>
            <div className="p-6">
              <ProductForm
                initialData={editingProduct}
                onSuccess={closeModal}
                onCancel={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
