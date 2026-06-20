"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { deleteCustomer } from "@/app/actions/customers";
import { CustomerForm } from "./CustomerForm";

export default function CustomersClient({ initialCustomers }: { initialCustomers: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);

  const handleCreate = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus customer ini? Transaksi dan rekap lama tidak akan hilang.")) {
      await deleteCustomer(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const formatDiscountString = (discounts: any[], type: "LM" | "BR") => {
    if (!discounts) return "-";
    const filtered = discounts.filter((d) => d.productType === type);
    if (filtered.length === 0) return "-";
    return filtered.map((d) => `${d.discountPercent}%`).join(" + ");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[32px] leading-[1.16] tracking-[-0.96px] font-semibold">Customers</h1>
          <p className="text-steel text-[16px] mt-1">Kelola data pelanggan dan skema diskon bertingkat</p>
        </div>
        <Button variant="primary" onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Customer
        </Button>
      </div>

      {/* Table */}
      <div className="bg-paper-white rounded-[24px] border border-sand overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-parchment text-steel border-b border-sand uppercase tracking-wider text-[12px] font-medium">
              <tr>
                <th className="px-6 py-4">Nama Customer</th>
                <th className="px-6 py-4">Diskon LM</th>
                <th className="px-6 py-4">Diskon BR</th>
                <th className="px-6 py-4 text-right">Ambang Bonus</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {initialCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-steel">
                    Belum ada customer. Silakan tambah customer baru.
                  </td>
                </tr>
              ) : (
                initialCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-parchment/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-ink-black">{customer.name}</td>
                    <td className="px-6 py-4 text-steel">
                      {formatDiscountString(customer.discounts, "LM")}
                    </td>
                    <td className="px-6 py-4 text-steel">
                      {formatDiscountString(customer.discounts, "BR")}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums">
                      {formatCurrency(customer.bonusThreshold)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)} className="h-8 px-2 text-electric-blue hover:text-electric-blue/80 hover:bg-electric-blue/10">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(customer.id)} className="h-8 px-2 text-ember-orange hover:text-ember-orange/80 hover:bg-ember-orange/10">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/50 backdrop-blur-sm">
          <div className="bg-paper-white rounded-[24px] shadow-md w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-sand shrink-0">
              <h2 className="text-[20px] font-semibold tracking-[-0.46px]">
                {editingCustomer ? "Edit Customer" : "Tambah Customer Baru"}
              </h2>
            </div>
            <div className="p-6 overflow-y-auto">
              <CustomerForm
                initialData={editingCustomer}
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
