declare module "./modules/model/routes/resumes.routes.js" {
  import type { Router } from "express";
  const router: Router;
  export default router;
}

declare module "./config/database.js" {
  import type { Pool } from "pg";
  export const initDatabase: () => Promise<void>;
  const pool: Pool;
  export default pool;
}

declare module "*.js";
