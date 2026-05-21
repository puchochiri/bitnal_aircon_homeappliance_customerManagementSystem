import { AppliancesClient } from './AppliancesClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AppliancesPage({ params }: Props) {
  const { id } = await params
  return <AppliancesClient customerId={id} />
}
