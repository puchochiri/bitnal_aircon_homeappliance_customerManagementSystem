import { CustomerDetailClient } from './CustomerDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params
  return <CustomerDetailClient customerId={id} />
}
