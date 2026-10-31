import type { Access, FieldAccess } from 'payload'

/** Admin = owner. Staff = leads only. */
export const isAdmin: Access = ({ req }) => req.user?.role === 'admin'
export const isAdminOrStaff: Access = ({ req }) => Boolean(req.user)
export const adminOnlyField: FieldAccess = ({ req }) => req.user?.role === 'admin'
export const hideFromStaff = ({ user }: { user?: unknown }) => (user as { role?: string } | undefined)?.role !== 'admin'

/** Public sees published only; logged-in users see everything. */
export const publishedOrUser: Access = ({ req }) =>
  req.user ? true : { status: { equals: 'published' } }
