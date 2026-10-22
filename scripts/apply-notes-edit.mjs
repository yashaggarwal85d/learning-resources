// Apply a notes edit sent from the site as a GitHub issue (the panel's "Save via GitHub issue", for a browser without an
// edit token). Run by .github/workflows/notes-edit.yml, only for issues the repository owner opened:
//   node --experimental-strip-types scripts/apply-notes-edit.mjs
// It reads the issue from $GITHUB_EVENT_PATH, checks it and writes the new file; the workflow commits and pushes. Outputs
// (in $GITHUB_OUTPUT): ok=true|false, file=<path>. $RESULT gets the comment for the issue, $MSG the commit message.
// The body format is the one site/src/reels/github-edit.ts (issueBody) writes:
//   Topic: <topic id>   File: <repo path>   Base: <blob sha the edit started from>   Kind: pre|post
//   then the new text in a ~~~~markdown fence.
// An edit is refused, never forced: a file that changed on main since it was opened (the sha differs), a path that is not
// that topic's notes file, or text that breaks the build's notes rules (site/src/lib/notes-rules.ts, the same code).
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NOTES_FILE, problemsFor } from '../site/src/lib/notes-rules.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
const issue = event.issue;
const out = (k, v) => process.env.GITHUB_OUTPUT && appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);
const finish = (ok, comment, file = '') => {
  writeFileSync(process.env.RESULT, comment + '\n');
  out('ok', ok);
  out('file', file);
  console.log(comment);
  process.exit(0);
};
const refuse = (why) => finish(false, `Not applied: ${why}\n\nNothing was changed. Open the panel again, make the edit and send it again.`);

if (issue.user.login !== event.repository.owner.login) refuse('only the repository owner’s issues are applied.');

const body = (issue.body ?? '').replace(/\r\n/g, '\n');
const field = (name) => body.match(new RegExp(`^${name}: *(\\S+) *$`, 'm'))?.[1];
const topicId = field('Topic'), file = field('File'), base = field('Base'), kind = field('Kind');
const fenced = body.match(/^(~{4,})markdown\n([\s\S]*?)\n\1[ \t]*$/m);
if (!topicId || !file || !base || !kind || !fenced) refuse('the issue is not in the format the site writes (Topic, File, Base, Kind and the text in a ~~~~markdown fence).');
if (kind !== 'pre' && kind !== 'post') refuse(`"Kind: ${kind}" must be pre or post.`);

// The topic and its folder come from the registry, never from the issue alone.
const registry = readFileSync(resolve(root, 'site/src/topics/registry.ts'), 'utf8');
const entry = registry
  .split(/\n  \{\n/)
  .slice(1)
  .map((b) => ({ id: b.match(/^\s+id: '([^']+)',$/m)?.[1], slug: b.match(/^\s+slug: '([^']+)',$/m)?.[1], title: b.match(/^\s+title: (['"])(.*?)\1,$/m)?.[2] }))
  .find((e) => e.id === topicId);
if (!entry?.slug) refuse(`there is no topic "${topicId}" in the registry.`);
const expected = `site/src/topics/${entry.slug}/${NOTES_FILE[kind]}`;
if (file !== expected) refuse(`the file "${file}" is not ${topicId}’s ${kind}-notes (${expected}).`);
const path = resolve(root, expected);
if (!existsSync(path)) refuse(`${expected} does not exist on main.`);

const now = execFileSync('git', ['hash-object', expected], { cwd: root, encoding: 'utf8' }).trim();
if (now !== base) refuse(`${expected} changed on main after you opened it (it was ${base.slice(0, 7)}, it is now ${now.slice(0, 7)}), so your edit could overwrite that change.`);

const text = fenced[2] + '\n';
if (text === readFileSync(path, 'utf8')) refuse('the text is the same as the file on main.');
const problems = problemsFor(kind, text);
if (problems.length) refuse(`the build would reject it. This file:\n${problems.map((p) => `- ${p}`).join('\n')}`);

writeFileSync(path, text);
writeFileSync(process.env.MSG, `Edit ${kind}-notes: ${entry.title?.replace(/\\'/g, "'") ?? topicId}\n\nEdited in the page by the owner (issue #${issue.number}).\nUnlock: ${topicId}\n`);
finish(true, `Applied to \`${expected}\`. The site rebuilds in a few minutes.`, expected);
