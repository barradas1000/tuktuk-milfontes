export {};

interface AdminConductor {
  id: string;
  name: string;
  whatsapp?: string;
}

declare global {
  interface Window {
    __ADMIN_CONDUCTORS__: AdminConductor[] | undefined;
  }
}