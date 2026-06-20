import { getCustomers } from "@/app/actions/customers";
import CustomersClient from "@/components/customers/CustomersClient";

export default async function CustomersPage() {
  const result = await getCustomers(false);
  const customers = result.data || [];

  return (
    <CustomersClient initialCustomers={customers} />
  );
}
