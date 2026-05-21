import { create } from 'zustand'

interface AppStore {
  selectedCustomerId: string | null
  setSelectedCustomer: (id: string | null) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppStore>((set) => ({
  selectedCustomerId: null,
  setSelectedCustomer: (id) => set({ selectedCustomerId: id }),
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
