import 'dotenv/config'
import compression from 'compression'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { database, findAccounts, getDashboardData } from './database.js'

const app = express()
const PORT = Number(process.env.PORT ?? 8787)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173'
const serveClient = process.env.NODE_ENV === 'production' || process.env.SERVE_CLIENT === 'true'
const serverDirectory = path.dirname(fileURLToPath(import.meta.url))
const clientDirectory = path.resolve(serverDirectory, '../dist')
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServerKey = process.env.SUPABASE_SERVER_KEY ?? process.env.SUPABASE_ANON_KEY
const requireAuth = process.env.NODE_ENV === 'production' || process.env.REQUIRE_AUTH === 'true'
const supabase = supabaseUrl && supabaseServerKey
  ? createClient(supabaseUrl, supabaseServerKey)
  : null

if (requireAuth && !supabase) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVER_KEY are required when API authentication is enabled')
}

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: ALLOWED_ORIGIN }))
app.use(compression())
app.use(express.json({ limit: '32kb' }))
app.use(morgan('tiny'))

if (serveClient) {
  app.use(express.static(clientDirectory, { maxAge: '1d', index: false }))
}

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'pulseboard-api',
    environment: process.env.NODE_ENV ?? 'development',
    uptime: Math.round(process.uptime()),
  })
})

async function authenticateRequest(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  if (!requireAuth) {
    next()
    return
  }

  if (!supabase) {
    res.status(503).json({ message: 'Supabase authentication is not configured' })
    return
  }

  const authorization = req.header('Authorization')
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null

  if (!token) {
    res.status(401).json({ message: 'Authentication required' })
    return
  }

  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data.user) {
      res.status(401).json({ message: 'Invalid or expired session' })
      return
    }
    next()
  } catch (error) {
    next(error)
  }
}

app.use('/api', (req, res, next) => {
  if (req.path === '/health') {
    next()
    return
  }
  void authenticateRequest(req, res, next)
})

app.get('/api/dashboard', async (_req, res, next) => {
  try {
    res.status(200).json(await getDashboardData())
  } catch (error) {
    next(error)
  }
})

const filterSchema = z.object({
  q: z.string().trim().min(1).max(80),
})

app.get('/api/accounts', async (req, res, next) => {
  const parse = filterSchema.safeParse(req.query)
  if (!parse.success) {
    res.status(400).json({ message: 'Invalid query parameter q' })
    return
  }

  try {
    res.status(200).json(await findAccounts(parse.data.q))
  } catch (error) {
    next(error)
  }
})

app.get('/api/users', async (_req, res, next) => {
  const result = await database
    .from('workspace_users')
    .select('id,name,email,role,status,last_active_at')
    .order('name')
  if (result.error) {
    next(result.error)
    return
  }
  res.status(200).json((result.data ?? []).map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    lastActive: user.last_active_at ?? 'Never',
  })))
})

const userUpdateSchema = z
  .object({
    role: z.enum(['Owner', 'Admin', 'Analyst', 'Viewer']).optional(),
    status: z.enum(['active', 'invited', 'suspended']).optional(),
  })
  .refine((payload) => payload.role !== undefined || payload.status !== undefined, {
    message: 'At least one field must be provided',
  })

app.patch('/api/users/:id', async (req, res, next) => {
  const parse = userUpdateSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ message: 'Invalid user update payload' })
    return
  }

  const result = await database
    .from('workspace_users')
    .update(parse.data)
    .eq('id', req.params.id)
    .select('id,name,email,role,status,last_active_at')
    .maybeSingle()
  if (result.error) {
    next(result.error)
    return
  }
  if (!result.data) {
    res.status(404).json({ message: 'User not found' })
    return
  }
  res.status(200).json({ ...result.data, lastActive: result.data.last_active_at ?? 'Never' })
})

app.get('/api/security', async (_req, res, next) => {
  const result = await database
    .from('security_settings')
    .select('sso_required,mfa_required,session_timeout_minutes,api_key_last_rotated')
    .eq('id', 1)
    .maybeSingle()
  if (result.error) {
    next(result.error)
    return
  }
  res.status(200).json(result.data
    ? {
        ssoRequired: result.data.sso_required,
        mfaRequired: result.data.mfa_required,
        sessionTimeoutMinutes: result.data.session_timeout_minutes,
        apiKeyLastRotated: result.data.api_key_last_rotated,
      }
    : null)
})

const securityUpdateSchema = z
  .object({
    ssoRequired: z.boolean().optional(),
    mfaRequired: z.boolean().optional(),
    sessionTimeoutMinutes: z.number().int().min(15).max(240).optional(),
  })
  .refine(
    (payload) =>
      payload.ssoRequired !== undefined ||
      payload.mfaRequired !== undefined ||
      payload.sessionTimeoutMinutes !== undefined,
    {
      message: 'At least one field must be provided',
    },
  )

app.patch('/api/security', async (req, res, next) => {
  const parse = securityUpdateSchema.safeParse(req.body)
  if (!parse.success) {
    res.status(400).json({ message: 'Invalid security payload' })
    return
  }

  const result = await database
    .from('security_settings')
    .upsert({
      id: 1,
      sso_required: parse.data.ssoRequired,
      mfa_required: parse.data.mfaRequired,
      session_timeout_minutes: parse.data.sessionTimeoutMinutes,
    })
    .select('sso_required,mfa_required,session_timeout_minutes,api_key_last_rotated')
    .single()
  if (result.error) {
    next(result.error)
    return
  }
  res.status(200).json({
    ssoRequired: result.data.sso_required,
    mfaRequired: result.data.mfa_required,
    sessionTimeoutMinutes: result.data.session_timeout_minutes,
    apiKeyLastRotated: result.data.api_key_last_rotated,
  })
})

app.get('/api/notifications', async (_req, res, next) => {
  const result = await database
    .from('notifications')
    .select('id,title,message,created_at,read')
    .order('created_at', { ascending: false })
  if (result.error) {
    next(result.error)
    return
  }
  res.status(200).json((result.data ?? []).map((notification) => ({
    id: notification.id,
    title: notification.title,
    message: notification.message,
    createdAt: notification.created_at,
    read: notification.read,
  })))
})

app.post('/api/notifications/:id/read', async (req, res, next) => {
  const result = await database
    .from('notifications')
    .update({ read: true })
    .eq('id', req.params.id)
    .select('id,title,message,created_at,read')
    .maybeSingle()
  if (result.error) {
    next(result.error)
    return
  }
  if (!result.data) {
    res.status(404).json({ message: 'Notification not found' })
    return
  }
  res.status(200).json({
    id: result.data.id,
    title: result.data.title,
    message: result.data.message,
    createdAt: result.data.created_at,
    read: result.data.read,
  })
})

app.post('/api/notifications/read-all', async (_req, res, next) => {
  const result = await database.from('notifications').update({ read: true }).neq('read', true)
  if (result.error) {
    next(result.error)
    return
  }
  res.status(200).json({ ok: true })
})

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ message: 'Route not found' })
    return
  }

  if (serveClient) {
    res.sendFile(path.join(clientDirectory, 'index.html'))
    return
  }

  res.status(404).json({ message: 'Route not found' })
})

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  void _next
  const message = error instanceof Error ? error.message : 'Internal server error'
  console.error(message)

  if (error instanceof SyntaxError) {
    res.status(400).json({ message: 'Malformed JSON request' })
    return
  }

  res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : message,
  })
})

const server = app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`)
})

function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`)
  server.close(() => process.exit(0))
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
