import { Snapshot } from './snapshots'
import snapshotDiff from 'snapshot-diff'

function redentSnapshot(input: string) {
  let minSpaces = Infinity
  let lines = input.split('\n')
  for (let line of lines) {
    if (line.trim() === '---') continue
    let spacesInLine = (line.match(/^[+-](\s+)/g) || []).pop()!.length - 1
    minSpaces = Math.min(minSpaces, spacesInLine)
  }

  let replacer = new RegExp(`^([+-])\\s{${minSpaces}}(.*)`, 'g')

  return input
    .split('\n')
    .map((line) =>
      line.trim() === '---' ? line : line.replace(replacer, (_, sign, rest) => `${sign}  ${rest}`)
    )
    .join('\n')
}

export function diffSnapshots(a: Snapshot, b: Snapshot) {
  if (a.toString() === b.toString()) {
    return ''
  }

  let diff = snapshotDiff(a.toString(), b.toString(), {
    aAnnotation: '__REMOVE_ME__',
    bAnnotation: '__REMOVE_ME__',
    contextLines: 0,
  })

  // Just to do some cleanup
  diff = diff
    .replace(/\n\n@@([^@@]*)@@/g, '') // Top level @@ signs
    .replace(/@@([^@@]*)@@/g, '---') // In between @@ signs
    .replace(/[-+] __REMOVE_ME__\n/g, '')
    .replace(/Snapshot Diff:\n/g, '')

  return redentSnapshot(diff)
    .split('\n')
    .map((line) => `    ${line}`)
    .join('\n')
}
