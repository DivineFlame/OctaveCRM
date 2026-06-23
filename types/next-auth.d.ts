import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id?: string;
  }

  interface Session {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      tenantId?: string;
      tenantName?: string;
      role?: Role;
    };
  }
}
