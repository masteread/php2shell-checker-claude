const assert = require('node:assert/strict')
const { spawn } = require('node:child_process')
const { once } = require('node:events')
const { cp, mkdtemp, rm } = require('node:fs/promises')
const http = require('node:http')
const { tmpdir } = require('node:os')
const path = require('node:path')
const { test } = require('node:test')

function run(args, script = path.join(__dirname, '..', 'phpcheck.js')) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args])
    let stdout = '', stderr = ''
    child.stdout.on('data', chunk => { stdout += chunk })
    child.stderr.on('data', chunk => { stderr += chunk })
    child.on('error', reject)
    child.on('close', code => resolve({ code, stdout, stderr }))
  })
}

async function serve(t, handler) {
  const server = http.createServer(handler)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => new Promise(resolve => {
    server.close(resolve)
    server.closeAllConnections()
  }))
  return `http://127.0.0.1:${server.address().port}/`
}

function check(result, status, version) {
  const code = { ok: 0, vulnerable: 1, unknown: 3 }[status]
  assert.equal(result.stderr, '')
  assert.equal(result.code, code, result.stdout)
  const report = JSON.parse(result.stdout)
  assert.equal(report.patch_status, status)
  assert.equal(report.php_version, version)
  assert.equal(report.exit_code, code)
  return report
}

for (const header of ['X-Powered-By', 'x-PoWeReD-bY', 'Server']) {
  for (const [version, status] of [['8.4.26', 'vulnerable'], ['8.4.27', 'ok'], ['8.4.100', 'ok']]) {
    test(`${header}: PHP/${version} => ${status}`, async t => {
      const methods = []
      const url = await serve(t, (req, res) => {
        methods.push(req.method)
        res.setHeader(header, header === 'Server' ? `Apache/2.4.62 (Unix) PHP/${version}` : `PHP/${version}`)
        res.end()
      })
      check(await run([url, '--json']), status, version)
      assert.deepEqual(methods, ['HEAD'])
    })
  }
}

test('each configured branch has an inclusive vulnerable boundary and a newer OK version', async t => {
  // Explicit fixtures: these assert the CLI contract without importing its classifier.
  const boundaries = ['5.4.45', '5.5.38', '5.6.40', '7.0.33', '7.1.33', '7.2.34', '7.3.33', '7.4.33',
    '8.0.30', '8.1.34', '8.2.34', '8.3.35', '8.4.26', '8.5.11']
  let header
  const url = await serve(t, (req, res) => { res.setHeader('X-Powered-By', header); res.end() })
  for (const version of boundaries) {
    header = `PHP/${version}`
    check(await run([url, '--json']), 'vulnerable', version)
    const [major, minor, patch] = version.split('.').map(Number)
    const newer = `${major}.${minor}.${patch + 1}`
    header = `PHP/${newer}`
    check(await run([url, '--json']), 'ok', newer)
  }
})

for (const version of ['8.6.0', '9.0.0', '8.4', 'not-a-version', '8.4.27RC1', '8.4.27-rc1', '8.4.27~beta1']) {
  test(`unrecognized or prerelease PHP/${version} => unknown`, async t => {
    const url = await serve(t, (req, res) => { res.setHeader('X-Powered-By', `PHP/${version}`); res.end() })
    check(await run([url, '--json']), 'unknown', version)
  })
}

for (const [version, status] of [['8.4.26-1ubuntu1', 'vulnerable'], ['8.4.27-1ubuntu1', 'ok']]) {
  test(`distribution suffix PHP/${version} => ${status}`, async t => {
    const url = await serve(t, (req, res) => { res.setHeader('X-Powered-By', `PHP/${version}`); res.end() })
    check(await run([url, '--json']), status, version)
  })
}

test('no PHP headers => unknown, even if the body mentions a PHP version', async t => {
  const url = await serve(t, (req, res) => {
    res.setHeader('Server', 'nginx')
    res.setHeader('X-Powered-By', 'Express')
    res.end('PHP/8.4.27')
  })
  const report = check(await run([url, '--json']), 'unknown', null)
  assert.equal(report.reason, 'PHP version not found')
  const text = await run([url])
  assert.equal(text.code, 3)
  assert.equal(text.stdout, 'UNKNOWN: PHP version not found\n')
})

test('empty HTTP response headers => unknown', async t => {
  const url = await serve(t, (req, res) => { res.sendDate = false; res.end() })
  check(await run([url, '--json']), 'unknown', null)
})

test('connection closes without any HTTP response => unknown', async t => {
  const url = await serve(t, req => { req.socket.destroy() })
  const report = check(await run([url, '--json']), 'unknown', null)
  assert.ok(report.reason)
})

test('a response timeout => unknown', async t => {
  const url = await serve(t, () => {})
  const report = check(await run([url, '--timeout', '0.1', '--json']), 'unknown', null)
  assert.match(report.reason, /timeout/i)
})

for (const statusCode of [405, 501]) {
  test(`HEAD ${statusCode} falls back to GET and reads PHP headers`, async t => {
    const methods = []
    const url = await serve(t, (req, res) => {
      methods.push(req.method)
      if (req.method === 'HEAD') res.writeHead(statusCode)
      else res.setHeader('X-Powered-By', 'PHP/8.4.27')
      res.end()
    })
    check(await run([url, '--json']), 'ok', '8.4.27')
    assert.deepEqual(methods, ['HEAD', 'GET'])
  })
}

for (const [server, poweredBy, expectedVersion, status] of [
  ['8.4.26', '8.4.27', '8.4.26', 'vulnerable'],
  ['8.4.27', '8.4.26', '8.4.26', 'vulnerable'],
  ['9.0.0', '8.4.27', '9.0.0', 'unknown'],
  ['8.4.27', '9.0.0', '9.0.0', 'unknown'],
]) {
  test(`conflicting headers ${server} / ${poweredBy} => ${status}`, async t => {
    const url = await serve(t, (req, res) => {
      res.setHeader('Server', `Apache/2.4.62 PHP/${server}`)
      res.setHeader('X-Powered-By', `PHP/${poweredBy}`)
      res.end()
    })
    check(await run([url, '--json']), status, expectedVersion)
  })
}

test('plain text output for a newer version is OK with exit code 0', async t => {
  const url = await serve(t, (req, res) => { res.setHeader('X-Powered-By', 'PHP/8.4.27'); res.end() })
  const result = await run([url])
  assert.equal(result.stderr, '')
  assert.equal(result.code, 0)
  assert.equal(result.stdout, 'OK: PHP 8.4.27\n')
})

test('the URL skill runs independently with its bundled checker', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'phpcheck-url-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  await cp(path.join(__dirname, '..', 'skills/url'), directory, { recursive: true })
  const methods = []
  const url = await serve(t, (req, res) => {
    methods.push(req.method)
    res.setHeader('X-Powered-By', 'PHP/8.4.27')
    res.end()
  })
  const result = await run([url, '--json'], path.join(directory, 'scripts/phpcheck.js'))
  check(result, 'ok', '8.4.27')
  assert.deepEqual(methods, ['HEAD'])
})
