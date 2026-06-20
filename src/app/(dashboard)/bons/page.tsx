import { getBons } from "@/app/actions/bons";
import BonsClient from "@/components/bons/BonsClient";

export default async function BonsPage() {
  const result = await getBons();
  const bons = result.data || [];

  return (
    <BonsClient initialBons={bons} />
  );
}
