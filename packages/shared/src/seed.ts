import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create plans
  const starterPlan = await prisma.plan.upsert({
    where: { name: 'starter' },
    update: {},
    create: {
      name: 'starter',
      displayName: 'Starter',
      price: 99,
      interval: 'month',
      quotas: {
        create: [
          { resource: 'max_units', limit: 10 },
          { resource: 'max_properties', limit: 2 },
          { resource: 'max_users', limit: 3 },
          { resource: 'max_outbound_messages', limit: 500 },
          { resource: 'max_api_rpm', limit: 60 },
        ],
      },
      featureFlags: {
        create: [],
      },
    },
  });

  const growthPlan = await prisma.plan.upsert({
    where: { name: 'growth' },
    update: {},
    create: {
      name: 'growth',
      displayName: 'Growth',
      price: 299,
      interval: 'month',
      quotas: {
        create: [
          { resource: 'max_units', limit: 100 },
          { resource: 'max_properties', limit: 10 },
          { resource: 'max_users', limit: 10 },
          { resource: 'max_outbound_messages', limit: 2000 },
          { resource: 'max_api_rpm', limit: 120 },
        ],
      },
      featureFlags: {
        create: [
          { feature: 'rental_pack', enabled: true },
        ],
      },
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: 'pro' },
    update: {},
    create: {
      name: 'pro',
      displayName: 'Pro',
      price: 799,
      interval: 'month',
      quotas: {
        create: [
          { resource: 'max_units', limit: 1000 },
          { resource: 'max_properties', limit: 50 },
          { resource: 'max_users', limit: 25 },
          { resource: 'max_outbound_messages', limit: 10000 },
          { resource: 'max_api_rpm', limit: 300 },
        ],
      },
      featureFlags: {
        create: [
          { feature: 'rental_pack', enabled: true },
          { feature: 'hoa_pack', enabled: true },
        ],
      },
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { name: 'enterprise' },
    update: {},
    create: {
      name: 'enterprise',
      displayName: 'Enterprise',
      price: 0, // Custom pricing
      interval: 'month',
      quotas: {
        create: [
          { resource: 'max_units', limit: 999999 },
          { resource: 'max_properties', limit: 999999 },
          { resource: 'max_users', limit: 999999 },
          { resource: 'max_outbound_messages', limit: 999999 },
          { resource: 'max_api_rpm', limit: 1000 },
        ],
      },
      featureFlags: {
        create: [
          { feature: 'rental_pack', enabled: true },
          { feature: 'hoa_pack', enabled: true },
          { feature: 'accounting_pro_pack', enabled: true },
          { feature: 'enterprise_pack', enabled: true },
        ],
      },
    },
  });

  // Create permissions
  const permissions = [
    'properties.read',
    'properties.write',
    'properties.delete',
    'units.read',
    'units.write',
    'contacts.read',
    'contacts.write',
    'charges.read',
    'charges.create',
    'charges.write',
    'payments.read',
    'payments.create',
    'work_orders.read',
    'work_orders.create',
    'work_orders.assign',
    'work_orders.close',
    'documents.read',
    'documents.write',
    'communications.send',
    'reports.view',
    'settings.read',
    'settings.write',
    'users.invite',
    'roles.manage',
  ];

  for (const capability of permissions) {
    await prisma.permission.upsert({
      where: { capability },
      update: {},
      create: {
        capability,
        description: `Permission to ${capability.replace('.', ' ')}`,
      },
    });
  }

  // Create demo org
  const demoOrg = await prisma.org.upsert({
    where: { slug: 'demo-property-management' },
    update: {},
    create: {
      name: 'Demo Property Management',
      slug: 'demo-property-management',
      planId: starterPlan.id,
    },
  });

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@dwello.com' },
    update: {},
    create: {
      email: 'demo@dwello.com',
      name: 'Demo User',
      emailVerified: new Date(),
    },
  });

  // Create admin role with all permissions
  const adminRole = await prisma.role.create({
    data: {
      orgId: demoOrg.id,
      name: 'Admin',
      description: 'Full access to all features',
      isSystem: true,
      permissions: {
        create: permissions.map((capability) => ({
          permission: {
            connect: { capability },
          },
        })),
      },
    },
  });

  // Create membership
  await prisma.membership.create({
    data: {
      orgId: demoOrg.id,
      userId: demoUser.id,
      roleId: adminRole.id,
    },
  });

  // Create properties
  const rentalProperty = await prisma.property.create({
    data: {
      orgId: demoOrg.id,
      name: 'Sunset Apartments',
      address: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
      propertyType: 'rental',
    },
  });

  const hoaProperty = await prisma.property.create({
    data: {
      orgId: demoOrg.id,
      name: 'Oceanview Condos',
      address: '456 Beach Blvd',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103',
      propertyType: 'hoa',
    },
  });

  // Create buildings
  const building1 = await prisma.building.create({
    data: {
      propertyId: rentalProperty.id,
      name: 'Building A',
      address: '123 Main St, Building A',
    },
  });

  // Create units
  const units = [];
  for (let i = 1; i <= 20; i++) {
    const unit = await prisma.unit.create({
      data: {
        propertyId: i <= 10 ? rentalProperty.id : hoaProperty.id,
        buildingId: i <= 10 ? building1.id : null,
        unitNumber: `${i}`,
        bedrooms: i % 3 === 0 ? 2 : 1,
        bathrooms: 1,
        squareFeet: 800 + (i * 50),
      },
    });
    units.push(unit);
  }

  // Create contacts
  const contacts = [];
  for (let i = 0; i < 10; i++) {
    const contact = await prisma.contact.create({
      data: {
        orgId: demoOrg.id,
        type: i < 5 ? 'resident' : 'owner',
        firstName: `Contact${i + 1}`,
        lastName: 'Demo',
        email: `contact${i + 1}@demo.com`,
        phone: `555-000-${String(i + 1).padStart(4, '0')}`,
      },
    });
    contacts.push(contact);
  }

  // Link contacts to units
  for (let i = 0; i < 10; i++) {
    await prisma.contactLink.create({
      data: {
        contactId: contacts[i].id,
        propertyId: i < 5 ? rentalProperty.id : hoaProperty.id,
        unitId: units[i].id,
        role: i < 5 ? 'tenant' : 'owner',
      },
    });
  }

  // Create sample charges
  for (let i = 0; i < 5; i++) {
    await prisma.charge.create({
      data: {
        orgId: demoOrg.id,
        propertyId: rentalProperty.id,
        unitId: units[i].id,
        contactId: contacts[i].id,
        type: 'rent',
        description: 'Monthly Rent',
        amount: 1500 + (i * 100),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    });
  }

  // Create sample work orders
  for (let i = 0; i < 3; i++) {
    await prisma.workOrder.create({
      data: {
        orgId: demoOrg.id,
        propertyId: rentalProperty.id,
        unitId: units[i].id,
        contactId: contacts[i].id,
        title: `Work Order ${i + 1}`,
        description: `Sample work order description ${i + 1}`,
        priority: i === 0 ? 'urgent' : 'normal',
        status: i === 0 ? 'open' : 'in_progress',
      },
    });
  }

  // Create board members for HOA
  const boardMember = await prisma.contact.create({
    data: {
      orgId: demoOrg.id,
      type: 'board',
      firstName: 'Board',
      lastName: 'Member',
      email: 'board@demo.com',
      phone: '555-000-9999',
    },
  });

  await prisma.contactLink.create({
    data: {
      contactId: boardMember.id,
      propertyId: hoaProperty.id,
      role: 'board_member',
    },
  });

  // Create vendor
  const vendor = await prisma.contact.create({
    data: {
      orgId: demoOrg.id,
      type: 'vendor',
      firstName: 'Maintenance',
      lastName: 'Company',
      email: 'vendor@demo.com',
      phone: '555-000-8888',
    },
  });

  // Create sample violations for HOA property
  const violation = await prisma.violation.create({
    data: {
      orgId: demoOrg.id,
      propertyId: hoaProperty.id,
      unitId: units[15].id,
      contactId: contacts[6].id,
      type: 'Noise Complaint',
      description: 'Excessive noise after hours',
      status: 'open',
    },
  });

  // Add violation step
  await prisma.violationStep.create({
    data: {
      violationId: violation.id,
      type: 'warning',
      description: 'First warning issued',
    },
  });

  // Create sample architectural request
  await prisma.architecturalRequest.create({
    data: {
      orgId: demoOrg.id,
      propertyId: hoaProperty.id,
      unitId: units[12].id,
      contactId: contacts[7].id,
      title: 'Deck Addition Request',
      description: 'Request to add a deck to unit 13',
      status: 'pending',
    },
  });

  // Create sample communication
  await prisma.communication.create({
    data: {
      orgId: demoOrg.id,
      propertyId: hoaProperty.id,
      type: 'email',
      subject: 'Monthly HOA Meeting',
      body: 'Reminder: Monthly HOA meeting scheduled for next week.',
      status: 'sent',
      sentAt: new Date(),
    },
  });

  console.log('✅ Seeding completed!');
  console.log(`   Org: ${demoOrg.slug}`);
  console.log(`   User: ${demoUser.email}`);
  console.log(`   Properties: 2 (rental + HOA)`);
  console.log(`   Units: 20`);
  console.log(`   Contacts: 13 (residents, owners, board, vendor)`);
  console.log(`   Charges: 5`);
  console.log(`   Work Orders: 3`);
  console.log(`   Violations: 1`);
  console.log(`   Architectural Requests: 1`);
  console.log(`   Communications: 1`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

