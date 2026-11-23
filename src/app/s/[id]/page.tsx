import { redirect } from "next/navigation";

export default async function ShortShareAliasPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/${encodeURIComponent(id)}`);
}
