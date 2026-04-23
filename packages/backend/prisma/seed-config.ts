import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaults = [
  { key: 'free_room_limit', value: '10', type: 'NUMBER' as const, group: 'limits', description: 'Max rooms per user (free tier)' },
  { key: 'free_property_limit', value: '1', type: 'NUMBER' as const, group: 'limits', description: 'Max properties per user (free tier)' },
  { key: 'default_due_day', value: '10', type: 'NUMBER' as const, group: 'billing', description: 'Invoice due day of month' },
  { key: 'auto_generate_invoices', value: 'true', type: 'BOOLEAN' as const, group: 'billing', description: 'Auto-generate invoices on 1st of month' },
  { key: 'overdue_notification_days', value: '3', type: 'NUMBER' as const, group: 'billing', description: 'Days after due date to send notification' },
  { key: 'app_name', value: 'Room Manager', type: 'STRING' as const, group: 'app', description: 'Application display name' },
  { key: 'support_email', value: '', type: 'STRING' as const, group: 'app', description: 'Support contact email' },
  { key: 'maintenance_mode', value: 'false', type: 'BOOLEAN' as const, group: 'app', description: 'Enable maintenance mode' },
];

async function main() {
  for (const config of defaults) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      create: config,
      update: {},
    });
  }
  console.log(`Seeded ${defaults.length} system configs`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
