import type { CollectionConfig } from 'payload'
import { hideFromStaff } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email', hidden: hideFromStaff, group: 'Settings' },
  auth: { maxLoginAttempts: 5, lockTime: 10 * 60 * 1000 },
  access: {
    create: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
    read: ({ req }) => Boolean(req.user),
    update: ({ req, id }) => req.user?.role === 'admin' || req.user?.id === id,
  },
  fields: [
    { name: 'name', type: 'text' },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      options: [
        { label: 'Admin (everything)', value: 'admin' },
        { label: 'Staff (leads only)', value: 'staff' },
      ],
      access: { update: ({ req }) => req.user?.role === 'admin' },
    },
  ],
}
