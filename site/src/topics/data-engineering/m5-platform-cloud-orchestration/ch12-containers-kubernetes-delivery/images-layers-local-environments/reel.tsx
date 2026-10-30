import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A refresher: the artefact every scheduled pipeline is actually deployed as. No Docker daemon
// is reachable on this build machine, so the lab's size/cold-start/CVE comparison is sourced from
// Docker's and Distroless's own docs (SOURCES.md); the cache-invalidation and whiteout mechanics
// are run for real in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Images, layers and local environments',
      body: (
        <>
          The last chapter ended on the gates a pipeline change must pass before it may ship. A change that passes them still has to run somewhere. The shop's
          nightly PySpark image is large, and one changed line of application code makes CI re-download and re-push almost all of it.
        </>
      ),
      duration: 2.2,
      fig: 'the layer stack',
      Visual: S.Opening,
    },
    {
      title: 'Which layers does a change touch?',
      body: (
        <>
          Six layers; the change lands on the <code>COPY . .</code> instruction, fourth from the base. How many layers does the rebuild actually touch?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [{ label: 'just that one layer' }, { label: 'that layer and everything above it', correct: true }, { label: 'all six layers' }, { label: 'none — the cache survives' }],
        explain: (
          <>
            That layer and everything stacked above it: three layers rebuild, three stay cached. A layer is a snapshot of everything up to that
            instruction, not a diff of just that instruction, so nothing below the change is touched and nothing above it survives.
          </>
        ),
      },
      fig: 'predict: the rebuild wave',
      Visual: S.PredictInvalidation,
    },
    {
      title: 'The wave rebuilds up, never down',
      body: (
        <>
          Layers four, five and six rebuild; one, two and three are reused straight from the build cache. Docker's own build-cache guide states it
          plainly: once a layer changes, every layer after it needs to run again, even if it wouldn't produce anything different.
        </>
      ),
      duration: 2.4,
      fig: 'cache hits below, rebuilds above',
      Visual: S.CacheWave,
    },
    {
      title: 'Order by how often it changes',
      body: (
        <>
          The naive Dockerfile copies source and dependencies together, so any source edit reinstalls every dependency. Reordering it — manifest first,
          install, source last — means the same edit only rebuilds the last two layers instead of four.
        </>
      ),
      duration: 2.6,
      fig: 'naive vs reordered build',
      Visual: S.BuildCacheOrdering,
    },
    {
      title: "A rm doesn't shrink the image",
      body: (
        <>
          Deleting a file in a later instruction is recorded as a whiteout: an empty marker file named <code>.wh.config.old</code>, added on top. The
          OCI image spec is explicit that a whiteout only hides a path from lower layers — it never removes those layers' bytes.
        </>
      ),
      duration: 2.2,
      takeaway: 'Deleting a file in a later layer adds a layer; it never removes one underneath.',
      fig: 'the whiteout marker',
      Visual: S.Whiteout,
    },
    {
      title: 'Multi-stage: ship the runtime stage alone',
      body: (
        <>
          A build stage carries the compiler and its package cache; a multi-stage build copies only the finished artefact into a slim runtime base and
          throws the build stage away. Distroless's own numbers: its smallest static base is about two mebibytes, against alpine's five and debian's one
          hundred twenty-four.
        </>
      ),
      duration: 3.0,
      takeaway: 'A multi-stage build keeps only the runtime stage; the compiler and its cache never ship.',
      fig: 'build stage falls away',
      Visual: S.MultiStage,
    },
    {
      title: 'Volumes, bind mounts and bridge networks',
      body: (
        <>
          A container's writable layer dies with the container. A named volume or a bind mount survives it; a user-defined bridge network lets
          <code>kafka</code>, <code>postgres</code> and <code>minio</code> find each other by name instead of a changing IP address.
        </>
      ),
      duration: 2.4,
      fig: 'what outlives the container',
      Visual: S.VolumesNetworks,
    },
    {
      title: 'Start order by health, not by luck',
      body: (
        <>
          Plain <code>depends_on</code> only orders when containers start, not whether they're ready — Compose's own docs say so. Pairing it with{' '}
          <code>condition: service_healthy</code> waits for each service's own healthcheck before the next one starts, so the orders pipeline never
          greets a Postgres that hasn't finished initializing.
        </>
      ),
      duration: 2.8,
      takeaway: "Plain depends_on orders container start, not readiness; service_healthy waits for it.",
      fig: 'health-gated startup',
      Visual: S.ComposeHealthy,
    },
    {
      title: 'Environment or mounted file?',
      body: (
        <>
          An environment variable is simple, but it's visible to anyone who can run <code>docker inspect</code> on the container. A mounted file keeps a
          secret or a structured config out of that inspection surface, readable only inside the container's own filesystem.
        </>
      ),
      duration: 2.2,
      fig: 'what each setting exposes',
      Visual: S.ConfigEnvFile,
    },
    {
      title: 'Five things to keep',
      body: (
        <>
          An image is a frozen filesystem. Running it is something else: a Linux process in a control group, with a limit written in a kernel file. What
          that limit does when the process asks for more is next.
        </>
      ),
      duration: 2.2,
      fig: 'recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
