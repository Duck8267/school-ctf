const test = require('node:test')
const assert = require('node:assert')
const fs = require('node:fs')
const path = require('node:path')

test('dashboard challenges do not show unlocked badge', () => {
  const dashboardPath = path.join(__dirname, '..', 'app', 'dashboard', 'page.tsx')
  const source = fs.readFileSync(dashboardPath, 'utf8')

  assert.ok(
    !source.includes('Unlocked'),
    'Dashboard challenge cards should not include the unlocked label'
  )
})

test('layout footer references Adel ElZemity and adelsamir.com', () => {
  const layoutPath = path.join(__dirname, '..', 'app', 'layout.tsx')
  const source = fs.readFileSync(layoutPath, 'utf8')

  assert.ok(source.includes('Adel ElZemity'), 'Footer should credit Adel ElZemity')
  assert.ok(
    source.includes('adelsamir.com'),
    'Footer should link to adelsamir.com'
  )
})

test('web-basics-challenge and ctfs exist', () => {
  const baseDir = path.join(__dirname, '..', 'challenges', 'web-basics-challenge')
  const challengeConfigPath = path.join(baseDir, 'config.json')
  const challengeConfig = JSON.parse(fs.readFileSync(challengeConfigPath, 'utf8'))

  assert.strictEqual(challengeConfig.id, 'web-basics-challenge')
  assert.strictEqual(typeof challengeConfig.description, 'string')

  const ctfs = ['cookie-clue', 'robot-rules', 'console-secret', 'element-inspector']
  ctfs.forEach((ctfId) => {
    const ctfConfigPath = path.join(baseDir, 'ctfs', ctfId, 'config.json')
    const ctfConfig = JSON.parse(fs.readFileSync(ctfConfigPath, 'utf8'))

    assert.strictEqual(ctfConfig.id, ctfId)
    assert.ok(ctfConfig.title.length > 0, `${ctfId} should have a title`)
    assert.ok(ctfConfig.flag.startsWith('FLAG{'), `${ctfId} should define a flag`)
  })
})

test('team deletion API uses requireSuperuser from auth module', () => {
  const apiPath = path.join(__dirname, '..', 'app', 'api', 'teams', '[teamId]', 'route.ts')
  const source = fs.readFileSync(apiPath, 'utf8')

  assert.ok(
    source.includes('requireSuperuser'),
    'DELETE /api/teams/[teamId] should use requireSuperuser from auth module'
  )
})

test('dashboard includes remove button handler for superuser team', () => {
  const dashboardPath = path.join(__dirname, '..', 'app', 'dashboard', 'page.tsx')
  const source = fs.readFileSync(dashboardPath, 'utf8')

  assert.ok(
    source.includes('handleRemoveTeam'),
    'Dashboard should have a handler for removing teams'
  )
  assert.ok(
    source.includes('`Remove ${t.name}`'),
    'Dashboard should render a remove control with accessible label'
  )
})

test('leaderboard fullscreen toggle exists for superuser team', () => {
  const dashboardPath = path.join(__dirname, '..', 'app', 'dashboard', 'page.tsx')
  const source = fs.readFileSync(dashboardPath, 'utf8')

  assert.ok(
    source.includes('Enter fullscreen leaderboard'),
    'Dashboard should include control to enter fullscreen leaderboard mode'
  )
  assert.ok(
    source.includes('Exit fullscreen leaderboard'),
    'Dashboard should include control to exit fullscreen leaderboard mode'
  )
  assert.ok(
    source.includes('setIsLeaderboardFullScreen'),
    'Dashboard should toggle fullscreen state with setIsLeaderboardFullScreen'
  )
})

test('leaderboard API exposes completedCtfs data', () => {
  const apiPath = path.join(
    __dirname,
    '..',
    'app',
    'api',
    'teams',
    'leaderboard',
    'route.ts'
  )
  const source = fs.readFileSync(apiPath, 'utf8')

  assert.ok(
    source.includes('completedCtfs'),
    'Leaderboard API should include completedCtfs for solved questions'
  )
  assert.ok(
    source.includes('getEmojiForKey'),
    'Leaderboard API should map solved questions to emoji order'
  )
  assert.ok(
    source.includes('timer:'),
    'Leaderboard API should include timer payload'
  )
})

test('leaderboard total_time merges overlapping CTF intervals', () => {
  const apiPath = path.join(
    __dirname,
    '..',
    'app',
    'api',
    'teams',
    'leaderboard',
    'route.ts'
  )
  const source = fs.readFileSync(apiPath, 'utf8')

  assert.ok(
    source.includes('Merge overlapping intervals'),
    'Leaderboard total_time should merge overlapping intervals to avoid double-counting'
  )
  assert.ok(
    source.includes('curStart') && source.includes('curEnd'),
    'Leaderboard total_time merge logic should track a current interval'
  )
  assert.ok(
    source.includes('totalMs'),
    'Leaderboard total_time should sum merged intervals in milliseconds'
  )
})

test('ctf emoji mapping includes all circle colors', () => {
  const emojiPath = path.join(__dirname, '..', 'lib', 'ctfEmojis.ts')
  const source = fs.readFileSync(emojiPath, 'utf8')
  const requiredEmojis = ['🔴', '⚪️', '🔵', '🟡', '🟣', '🟢', '⚫️', '🟠']

  requiredEmojis.forEach((emoji) => {
    assert.ok(source.includes(emoji), `Emoji map should include ${emoji}`)
  })
})

test('leaderboard timer route restricts to superuser via auth module', () => {
  const timerPath = path.join(
    __dirname,
    '..',
    'app',
    'api',
    'leaderboard',
    'timer',
    'route.ts'
  )
  const source = fs.readFileSync(timerPath, 'utf8')

  assert.ok(
    source.includes('requireSuperuser'),
    'Timer route should use requireSuperuser from auth module'
  )
  assert.ok(
    source.includes('Minutes must be a positive number'),
    'Timer route should validate minutes input'
  )
  assert.ok(
    source.includes('PATCH'),
    'Timer route should support extending timer through PATCH'
  )
})

test('dashboard renders countdown UI with emojis', () => {
  const dashboardPath = path.join(__dirname, '..', 'app', 'dashboard', 'page.tsx')
  const source = fs.readFileSync(dashboardPath, 'utf8')

  assert.ok(
    source.includes('No active countdown'),
    'Dashboard should mention countdown status'
  )
  assert.ok(source.includes('⏱️'), 'Dashboard should include timer emoji display')
  assert.ok(
    source.includes('Start Timer'),
    'Dashboard should include a Start Timer control for superuser'
  )
  assert.ok(
    source.includes('aria-label="Refresh leaderboard"'),
    'Dashboard should provide a refresh control for superuser'
  )
  assert.ok(source.includes('+5'), 'Dashboard should provide a +5 time control')
  assert.ok(
    source.includes('aria-label="Add five minutes"'),
    'Dashboard should describe the add time control for accessibility'
  )
})

// --- Security-specific tests ---

test('auth module exists with HMAC signing and path sanitization', () => {
  const authPath = path.join(__dirname, '..', 'lib', 'auth.ts')
  const source = fs.readFileSync(authPath, 'utf8')

  assert.ok(source.includes('createHmac'), 'Auth should use HMAC for signing')
  assert.ok(source.includes('timingSafeEqual'), 'Auth should use timing-safe comparison')
  assert.ok(source.includes('AUTH_SECRET'), 'Auth should support AUTH_SECRET env var')
  assert.ok(source.includes('safePath'), 'Auth should export safePath for path sanitization')
  assert.ok(source.includes('requireTeam'), 'Auth should export requireTeam')
  assert.ok(source.includes('requireSuperuser'), 'Auth should export requireSuperuser')
  assert.ok(source.includes('requireEventId'), 'Auth should export requireEventId')
  assert.ok(source.includes('setSignedCookie'), 'Auth should export setSignedCookie')
  assert.ok(source.includes('getSignedCookie'), 'Auth should export getSignedCookie')
})

test('all API routes use signed cookies from auth module (no raw cookies())', () => {
  const apiRoutes = [
    'app/api/teams/register/route.ts',
    'app/api/teams/login/route.ts',
    'app/api/teams/me/route.ts',
    'app/api/teams/signout/route.ts',
    'app/api/teams/leaderboard/route.ts',
    'app/api/teams/[teamId]/route.ts',
    'app/api/events/verify/route.ts',
    'app/api/events/current/route.ts',
    'app/api/challenges/route.ts',
    'app/api/challenges/[id]/unlock/route.ts',
    'app/api/challenges/[id]/ctfs/route.ts',
    'app/api/ctfs/[ctfId]/submit/route.ts',
    'app/api/ctfs/[ctfId]/status/route.ts',
    'app/api/ctfs/[ctfId]/start/route.ts',
    'app/api/ctfs/[ctfId]/hints/route.ts',
    'app/api/ctfs/[ctfId]/hints/purchase/route.ts',
    'app/api/leaderboard/timer/route.ts',
  ]

  for (const route of apiRoutes) {
    const filePath = path.join(__dirname, '..', route)
    const source = fs.readFileSync(filePath, 'utf8')

    // Routes that need auth should import from @/lib/auth
    // The only raw cookies() usage that's still okay is inside the auth module itself
    assert.ok(
      source.includes('@/lib/auth'),
      `${route} should import from @/lib/auth`
    )
  }
})

test('CTF routes validate path segments with safePath', () => {
  const routes = [
    'app/api/ctfs/[ctfId]/submit/route.ts',
    'app/api/ctfs/[ctfId]/status/route.ts',
    'app/api/ctfs/[ctfId]/start/route.ts',
    'app/api/ctfs/[ctfId]/hints/route.ts',
    'app/api/ctfs/[ctfId]/hints/purchase/route.ts',
    'app/api/challenges/[id]/unlock/route.ts',
    'app/api/challenges/[id]/ctfs/route.ts',
  ]

  for (const route of routes) {
    const filePath = path.join(__dirname, '..', route)
    const source = fs.readFileSync(filePath, 'utf8')

    assert.ok(
      source.includes('safePath'),
      `${route} should use safePath to sanitize path parameters`
    )
  }
})

test('no API route exposes raw error.message to clients', () => {
  const apiDir = path.join(__dirname, '..', 'app', 'api')
  const routeFiles = []

  function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walkDir(full)
      } else if (entry.name === 'route.ts') {
        routeFiles.push(full)
      }
    }
  }
  walkDir(apiDir)

  for (const filePath of routeFiles) {
    const source = fs.readFileSync(filePath, 'utf8')
    const relative = path.relative(path.join(__dirname, '..'), filePath)

    assert.ok(
      !source.includes('error.message'),
      `${relative} should not expose raw error.message to clients`
    )
  }
})

test('register route requires 4-digit PIN and passes it to create', () => {
  const registerPath = path.join(__dirname, '..', 'app', 'api', 'teams', 'register', 'route.ts')
  const source = fs.readFileSync(registerPath, 'utf8')
  assert.ok(source.includes('pin') && (source.includes('PIN_REGEX') || source.includes('4-digit')), 'Register should validate 4-digit PIN')
  assert.ok(source.includes('create(') && source.includes('eventId,') && (source.includes('pinStr') || source.includes('superuserPin')), 'Register should call teams.create with pin')
})

test('login route exists and authenticates by team name and PIN', () => {
  const loginPath = path.join(__dirname, '..', 'app', 'api', 'teams', 'login', 'route.ts')
  const source = fs.readFileSync(loginPath, 'utf8')
  assert.ok(source.includes('findByEventNameAndPin'), 'Login should use findByEventNameAndPin')
  assert.ok(source.includes('setSignedCookie'), 'Login should set team_id cookie on success')
  assert.ok(source.includes('Invalid team name or PIN') || source.includes('401'), 'Login should reject invalid credentials')
})

test('join page has PIN field and log in to existing team', () => {
  const joinPath = path.join(__dirname, '..', 'app', 'join', 'page.tsx')
  const source = fs.readFileSync(joinPath, 'utf8')
  assert.ok(source.includes('4-digit PIN') || source.includes('pin'), 'Join page should ask for PIN')
  assert.ok(source.includes('Log in to existing team'), 'Join page should offer login to existing team')
  assert.ok(source.includes('/api/teams/login'), 'Join page should call login API')
})
