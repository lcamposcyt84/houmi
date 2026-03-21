# Publicar cambios en Vercel (modo 2 – C2P con credenciales)

Los cambios ya están en el código. Para que estén en Vercel haz lo siguiente.

## Opción A: Si tu proyecto está conectado a Git (GitHub/GitLab)

1. **Sube los cambios a tu repositorio**
   - Si trabajas en otra carpeta con Git, copia estos archivos modificados/creados:
     - `prisma/schema.prisma`
     - `prisma/migrations/` (carpeta completa)
     - `src/app/admin/settings/SettingsForm.tsx`
     - `src/app/api/admin/settings/route.ts`
     - `src/app/api/payments/c2p/route.ts`
   - En la carpeta donde tengas el repo:
     ```bash
     git add .
     git commit -m "C2P: API Key y API Secret en admin, migración Settings"
     git push
     ```
   - Vercel desplegará solo al hacer **push**.

2. **Base de datos MySQL (producción en Hostinger)**
   - El storefront PHP usa `api/db.php` contra la MySQL del hosting; las tablas deben existir ahí. Si la BD está vacía, importa en phpMyAdmin el archivo **`all_tables_utf8.sql`**, luego cualquier SQL incremental que uses (columnas nuevas, etc.).
   - Si Next.js usa Prisma contra la misma MySQL, en tu máquina:
     ```bash
     cd houmi-store
     set DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DATABASE
     npx prisma migrate deploy
     ```
     (Sin carpeta `prisma/migrations`, valorar `npx prisma db push` solo si el esquema local y producción deben coincidir.)
   - En Vercel → Environment Variables: **`NEXT_PUBLIC_API_URL=https://api.houmi.shop`** (sin barra final, salvo que la API esté bajo `/api/`).

## Opción B: Si usas Vercel CLI (sin Git)

1. **Instala la CLI** (si no la tienes):
   ```bash
   npm i -g vercel
   ```

2. **Desde la carpeta del proyecto**:
   ```bash
   cd c:\Users\Baddo\Desktop\Houmi\houmi-store
   vercel login
   vercel --prod
   ```

3. **Migración / esquema en producción** (igual que en Opción A, paso 2):  
   Importa o sincroniza el esquema MySQL en Hostinger; si usas Prisma, `migrate deploy` o `db push` con la URL de producción.

---

## Después del deploy

1. Entra a **https://houmi-store.vercel.app/admin** (o tu URL) → **Configuración**.
2. En **Banco Mercantil** guarda:
   - **Clave API (API Key):** `fe56cd2339d31fabc58f117f0656e0bb`
   - **Secreto API (API Secret):** `e1e3f4ceb7763eb5487f71982ea56fc6`
3. Para **modo 2** (llamada real al banco), en Vercel → **Settings → Environment Variables** añade:
   - `MERCANTIL_API_URL` = URL base de la API del banco (te la da el banco o la documentación).

Con eso puedes probar el modo 2 en Vercel.
