// Shared TypeScript types
export type * from '@prisma/client';

// Plan names
export type PlanName = 'starter' | 'growth' | 'pro' | 'enterprise';

// Feature flags
export type FeatureFlag = 
  | 'rental_pack'
  | 'hoa_pack'
  | 'accounting_pro_pack'
  | 'enterprise_pack';

// Quota resources
export type QuotaResource = 
  | 'max_units'
  | 'max_properties'
  | 'max_users'
  | 'max_outbound_messages'
  | 'max_api_rpm';

// Permissions/Capabilities
export type Permission = 
  | 'properties.read'
  | 'properties.write'
  | 'properties.delete'
  | 'units.read'
  | 'units.write'
  | 'contacts.read'
  | 'contacts.write'
  | 'charges.read'
  | 'charges.create'
  | 'charges.write'
  | 'payments.read'
  | 'payments.create'
  | 'work_orders.read'
  | 'work_orders.create'
  | 'work_orders.assign'
  | 'work_orders.close'
  | 'documents.read'
  | 'documents.write'
  | 'communications.send'
  | 'reports.view'
  | 'settings.read'
  | 'settings.write'
  | 'users.invite'
  | 'roles.manage';

