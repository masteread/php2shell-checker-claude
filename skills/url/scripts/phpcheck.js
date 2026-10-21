#!/usr/bin/env node
const { execFileSync } = require('node:child_process')
const { parseArgs } = require('node:util')

const VERSION = '1.0.0'
// Vulnerable version cutoffs as of 2026-10-20. A newer stable patch in a
// listed branch is OK by this table; unlisted branches remain unknown.
const VULNERABLE_THROUGH = {
  '5.4': 45, '5.5': 38, '5.6': 40,
  '7.0': 33, '7.1': 33, '7.2': 34, '7.3': 33, '7.4': 33,
  '8.0': 30, '8.1': 34, '8.2': 34, '8.3': 35, '8.4': 26, '8.5': 11,
}
const USAGE = 'Usage: node phpcheck.js URL [--timeout SECONDS] [--json]\n' +
  '       node phpcheck.js --local [--php PATH] [--json]\n' +
  '       node phpcheck.js --version'

function patchStatus(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)([-+~].*)?$/.exec(version || '')
  if (!match) return 'unknown'
  const cutoff = VULNERABLE_THROUGH[`${Number(match[1])}.${Number(match[2])}`]
  if (cutoff === undefined) return 'unknown'
  if (Number(match[3]) <= cutoff) return 'vulnerable'
  // A development build of the next patch is not evidence of a stable fix.
  if (/(?:^|[-+~.])(?:dev|alpha|beta|rc)/i.test(match[4] || '')) return 'unknown'
  return 'ok'
}

async function urlHeaders(address, timeout) {
  if (/[\x00-\x20\x7f]/.test(address)) throw new Error('URL contains spaces or control characters')
  const url = new URL(address)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Use an http:// or https:// URL')
  if (url.username || url.password || url.hash) throw new Error('URL credentials and fragments are not supported')
  const headers = []
  for (const method of ['HEAD', 'GET']) {
    const response = await fetch(url, {
      method, redirect: 'manual', signal: AbortSignal.timeout(Math.ceil(timeout * 1000)),
    })
    headers.push(response.headers.get('server') || '', response.headers.get('x-powered-by') || '')
    await response.body?.cancel()
    if (![405, 501].includes(response.status)) break
  }
  return headers.join('\n')
}

async function main() {
  let values, address, timeout
  try {
    const args = parseArgs({
      allowPositionals: true,
      options: {
        local: { type: 'boolean' },
        php: { type: 'string', default: 'php' },
        timeout: { type: 'string', default: '10' },
        json: { type: 'boolean' },
        version: { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
    })
    values = args.values
    if (values.version) return console.log(VERSION)
    if (values.help) return console.log(USAGE)
    address = args.positionals[0]
    if (args.positionals.length > 1 || (values.local && address) || (!values.local && !address)) {
      throw new Error('Provide a URL or --local, not both')
    }
    timeout = Number(values.timeout)
    if (!values.local && !(timeout > 0 && timeout <= 60)) throw new Error('--timeout must be greater than 0 and at most 60 seconds')
  } catch (error) {
    console.error(error.message + '\n' + USAGE)
    process.exitCode = 2
    return
  }

  let version = null, error = null, status = 'unknown'
  try {
    const text = values.local
      ? execFileSync(values.php, ['-v'], { encoding: 'utf8', timeout: 10000 })
      : await urlHeaders(address, timeout)
    for (const match of text.matchAll(/\bPHP[ /]([^\s,;)]+)/gi)) {
      const candidateStatus = patchStatus(match[1])
      // Do not let an OK banner hide a vulnerable or unrecognized PHP version.
      if (version === null || candidateStatus === 'vulnerable' || status === 'ok') {
        version = match[1]
        status = candidateStatus
      }
      if (status === 'vulnerable') break
    }
  } catch (exc) {
    error = exc.message
  }

  const code = { ok: 0, vulnerable: 1, unknown: 3 }[status]
  const reason = error || (version ? 'PHP ' + version : 'PHP version not found')
  const report = { patch_status: status, php_version: version, reason, exit_code: code }
  console.log(values.json ? JSON.stringify(report) : status.toUpperCase() + ': ' + reason)
  process.exitCode = code
}

main()
