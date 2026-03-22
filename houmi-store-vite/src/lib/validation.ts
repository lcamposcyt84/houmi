import { z } from "zod";

// ============================================
// ORDER VALIDATION SCHEMAS
// ============================================

export const CreateOrderItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().positive().max(1000),
});

export const CreateOrderSchema = z.object({
  customerName: z.string().min(2).max(200),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().min(10).max(20),
  customerAddress: z.string().max(500).optional(),
  items: z.array(CreateOrderItemSchema).min(1).max(100),
  paymentMethod: z.enum(["debit_card", "c2p", "p2c", "manual"]).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// ============================================
// MERCANTIL WEBHOOK VALIDATION SCHEMAS
// ============================================

export const MercantilInfoMsgSchema = z.object({
  guId: z.string(),
  channel: z.string(),
  subchannel: z.string(),
  applId: z.string(),
  personId: z.string(),
  userId: z.string().optional(),
  token: z.string().optional(),
  action: z.string().optional(),
});

export const MercantilWebhookNotificationSchema = z.object({
  codigo: z.string(),
  mensajeCliente: z.string(),
  mensajeSistema: z.string(),
  referenciaBancoOrdenante: z.string(),
  referenciaBancoBeneficiario: z.string().optional(),
  tipo: z.string(), // "R" o "E"
  bancoOrdenante: z.string(),
  bancoBeneficiario: z.string(),
  idCliente: z.string(),
  tipoDatoCliente: z.string().optional(),
  numeroProductoCliente: z.string(),
  idComercio: z.string(),
  tipoDatoComercio: z.string().optional(),
  numeroProductoComercio: z.string(),
  fecha: z.string().regex(/^\d{8}$/), // YYYYMMDD
  hora: z.string().regex(/^\d{4}$/), // HHMM
  codigoMoneda: z.string(),
  monto: z.string().regex(/^\d+\.\d{2}$/), // Formato decimal
  numeroFactura: z.string(),
  numeroContrato: z.string(),
  concepto: z.string(),
});

export const MercantilDecryptedPayloadSchema = z.object({
  infoMsg: MercantilInfoMsgSchema,
  webhookNotificationIn: MercantilWebhookNotificationSchema,
});

export const MercantilEncryptedRequestSchema = z.object({
  data: z.string().min(100), // Base64 encrypted data
});

export type MercantilDecryptedPayload = z.infer<typeof MercantilDecryptedPayloadSchema>;

// ============================================
// ADMIN AUTH VALIDATION SCHEMAS
// ============================================

export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const AdminCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(100),
  name: z.string().min(2).max(100).optional(),
  role: z.enum(["admin", "superadmin"]).default("admin"),
});

export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
export type AdminCreateInput = z.infer<typeof AdminCreateSchema>;
