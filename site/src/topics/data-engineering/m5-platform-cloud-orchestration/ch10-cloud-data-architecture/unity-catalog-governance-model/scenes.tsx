import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every behaviour here traces to Databricks' own current documentation or the Delta Sharing
// protocol's own specification (SOURCES.md), or to examples.py's local simulation of
// privilege inheritance and tag-based ABAC. No real Unity Catalog metastore runs in this
// sandbox (disclosed in OUTLINE.md). Any array cycled by a time-derived index uses an explicit
// Number.isFinite guard (see project memory on this bug class).

// 1 · Hook: a table governed before anyone writes a rule for it.
export function TableGovernedInstantly({ t }: StepCtx) {
  const created = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A new table created inside an already-tagged schema, inheriting its policy instantly" h={280}>
        <T x={300} y={24} s={14} a="middle" f={C.taupe} serif>A schema already tagged restricted</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte} serif>schema: row filter + column mask active</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={created > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={created > 0.5 ? C.second : C.latte} serif>{created > 0.5 ? 'new table: governed the instant it exists' : 'new table: not yet created'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: what has to be true for a rule to cover a table that doesn't exist yet?
export function PredictTagMechanism({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="A policy checking a tag at query time instead of a fixed list of table names" h={260}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>What is the policy actually checking?</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={13} a="middle" f={C.latte}>a fixed table list: misses anything new</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={13} a="middle" f={revealed ? C.caramel : C.latte}>a tag, checked live: catches anything new</T>
        <T x={300} y={210} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? 'the tag is the rule' : '?'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · Three levels deep, and the extra level is the point.
export function ThreeLevelNamespace({ t }: StepCtx) {
  const extra = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A two-level namespace against the three-level catalog.schema.object namespace" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>schema.object vs catalog.schema.object</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte}>two levels: one namespace per account</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={extra > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={extra > 0.5 ? C.second : C.latte}>{extra > 0.5 ? 'three levels: prod and staging, same metastore' : 'three levels: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 4 · Four kinds of securable, one card at a time.
export function FourSecurableTypes({ t }: StepCtx) {
  const kinds = [
    { name: 'Tables', trait: 'rows and columns, the familiar case' },
    { name: 'Volumes', trait: 'governed access to non-tabular files' },
    { name: 'Functions', trait: 'individually permissioned, not just data' },
    { name: 'Models', trait: 'ML models, governed the same way' },
  ];
  const raw = Math.floor((t / 4.4) * kinds.length);
  const active = Number.isFinite(raw) ? Math.min(kinds.length - 1, Math.max(0, raw)) : 0;
  const kind = kinds[active];
  return (
    <Stack>
      <Svg label="One securable type at a time, each individually permissioned" h={240}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>Not just tables</T>
        <rect x={80} y={62} width={440} height={56} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={300} y={94} s={15} a="middle" f={C.caramel} serif w={700}>{kind.name}</T>
        <T x={300} y={150} s={12} a="middle" f={C.latte} w={420}>{kind.trait}</T>
      </Svg>
    </Stack>
  );
}

// 5 · The worked payoff: one grant, inherited down, before and after.
export function InheritanceTreeReal({ t }: StepCtx) {
  const after = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A schema-level grant reaching a table that existed before it and one created after" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>SELECT granted once, at the schema</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.second}>orders (existed before): SELECT, yes</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={after > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={after > 0.5 ? C.second : C.latte}>{after > 0.5 ? 'returns (created after): SELECT, yes' : 'returns: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 6 · A rule written once, checked by a tag.
export function TagPolicyReal({ t }: StepCtx) {
  const tagged = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="A tag policy missing a table before tagging and covering it right after" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>profiles, a table just created</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={13} a="middle" f={C.latte}>no tag yet: policy does not apply</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={tagged > 0.5 ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={13} a="middle" f={tagged > 0.5 ? C.caramel : C.latte}>{tagged > 0.5 ? 'tag inherited: policy applies now' : 'tag: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 7 · Lineage and audit as queryable system tables.
export function LineageAuditTables({ t }: StepCtx) {
  const audit = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="Column-level lineage and audit logs both living as ordinary queryable tables" h={260}>
        <T x={300} y={26} s={13} a="middle" f={C.taupe} serif>Not a separate dashboard</T>
        <rect x={100} y={60} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={88} s={12} a="middle" f={C.latte} w={400}>lineage: tracked down to the column</T>
        <rect x={100} y={128} width={400} height={48} rx={8} fill="none" stroke={audit > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={156} s={12} a="middle" f={audit > 0.5 ? C.second : C.latte} w={400}>{audit > 0.5 ? 'audit log: just another system table' : 'audit log: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 8 · Federation and Delta Sharing.
export function FederationAndSharing({ t }: StepCtx) {
  const sharing = clamp(seg(t, 0.4, 0.8));
  return (
    <Stack>
      <Svg label="Lakehouse Federation querying another system live against Delta Sharing's own bearer-token protocol" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Reaching data you didn't have to copy</T>
        <rect x={100} y={56} width={400} height={44} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={82} s={12} a="middle" f={C.latte} w={400}>Federation: a foreign catalog, governed like a native one</T>
        <rect x={100} y={126} width={400} height={44} rx={8} fill="none" stroke={sharing > 0.5 ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={152} s={12} a="middle" f={sharing > 0.5 ? C.second : C.latte} w={400}>{sharing > 0.5 ? 'Delta Sharing: a bearer token, no account needed' : 'Delta Sharing: pending'}</T>
      </Svg>
    </Stack>
  );
}

// 9 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['three levels, four securable types', 'one grant or tag, never repeated', 'a recipient needs only a bearer token'];
  return (
    <Stack>
      <Svg label="The three-part recap of this topic's point" h={260} fill>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>Governance that applies itself</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.15 * i, 0.15 * i + 0.25));
          return (
            <T key={label} x={300} y={86 + i * 36} s={13} a="middle" f={C.latte} o={show} serif>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 10 · Prove it.
export function ProveIt({ answer }: StepCtx) {
  const revealed = answer !== null;
  return (
    <Stack>
      <Svg label="A partner with no Databricks account reading a shared table via a bearer token" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>No account, no platform in common</T>
        <rect x={100} y={56} width={400} height={48} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
        <T x={300} y={84} s={12} a="middle" f={C.latte}>partner: has never used your platform</T>
        <rect x={100} y={120} width={400} height={48} rx={8} fill="none" stroke={revealed ? C.second : C.mocha} strokeWidth={2} />
        <T x={300} y={148} s={12} a="middle" f={revealed ? C.second : C.latte} w={revealed ? 700 : 400}>{revealed ? 'bearer token + pre-signed URLs: enough' : 'can they read the table?'}</T>
      </Svg>
    </Stack>
  );
}
