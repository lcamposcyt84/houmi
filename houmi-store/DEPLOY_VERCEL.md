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

2. **Aplicar la migración en la base de datos de producción**
   - En tu máquina, con la `DATABASE_URL` de producción (la de Vercel):
     ```bash
     cd houmi-store
     set DATABASE_URL=postgresql://...   # la URL de Vercel
     set DIRECT_URL=postgresql://...     # si la usas
     npx prisma migrate deploy
     ```
   - O en Vercel → proyecto → Settings → Environment Variables, copia `DATABASE_URL` y `DIRECT_URL`, crea un `.env.production` local solo para esto y ejecuta:
     ```bash
     npx prisma migrate deploy
     ```
   - Si prefieres no usar migraciones, puedes aplicar solo las columnas nuevas:
     ```bash
     npx prisma db push
     ```
     (con `DATABASE_URL` y `DIRECT_URL` apuntando a la base de producción).

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

3. **Migración en producción** (igual que en Opción A, paso 2):  
   Ejecuta `npx prisma migrate deploy` o `npx prisma db push` contra la base de datos de Vercel.

---

## Después del deploy

1. Entra a **https://houmi-store.vercel.app/admin** (o tu URL) → **Configuración**.
2. En **Banco Mercantil** guarda:
   - **Clave API (API Key):** `fe56cd2339d31fabc58f117f0656e0bb`
   - **Secreto API (API Secret):** `e1e3f4ceb7763eb5487f71982ea56fc6`
3. Para **modo 2** (llamada real al banco), en Vercel → **Settings → Environment Variables** añade:
   - `MERCANTIL_API_URL` = URL base de la API del banco (te la da el banco o la documentación).

Con eso puedes probar el modo 2 en Vercel.
