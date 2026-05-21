import { CustomerWorkLogsClient } from './CustomerWorkLogsClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CustomerWorkLogsPage({ params }: Props) {
  const { id } = await params
  return <CustomerWorkLogsClient customerId={id} />
}
