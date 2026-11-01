import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py against this sandbox's
// own PostgreSQL cluster: a stalled slot's retained-WAL gap measured before and after a real
// write load, a hand-written confirming consumer standing in for a heartbeat, and a real
// `max_slot_wal_keep_size` set via ALTER SYSTEM, driving a real slot from reserved to lost and
// then back out again once the setting is reset. The AWS RDS and multi-database variants
// Debezium names are quoted, not reproduced, since this sandbox has one database.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A connector's own dashboard shows green all weekend. By Monday the primary's disk is
          nearly full. The connector never stopped. The database it watches is quiet. The
          slot's own position marker sat frozen the entire time.
        </>
      ),
      duration: 4.8,
      fig: "the connector shows healthy all weekend; the primary's disk climbs to nearly full; the slot's own marker sat frozen the whole time.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: can a healthy connector still be the cause',
      body: (
        <>
          That connector never crashed and never disconnected. Can a connector that looks
          completely healthy still be the reason WAL keeps growing?
        </>
      ),
      duration: 2.8,
      fig: 'that connector never crashed and never disconnected. Can a connector that looks healthy still be the reason WAL keeps growing?',
      predict: {
        options: [
          { label: 'No — a healthy, connected connector is, by definition, confirming its own progress' },
          { label: 'Yes — a slot only advances when its consumer confirms a new position, and a quiet captured table gives it nothing to confirm', correct: true },
        ],
        explain: (
          <>
            A connector can be alive and connected while never emitting anything that lets it
            confirm a new position, if nothing it's watching has changed. Being healthy and
            being the reason a slot advances are two separate facts.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: "Reveal: a slot doesn't know or care if anyone's listening",
      body: (
        <>
          A replication slot persists across crashes and knows nothing about the state of its
          consumer. With no reader at all, nothing tells the server it can ever reclaim the WAL
          that slot might still need.
        </>
      ),
      duration: 4.8,
      fig: "a slot persists across crashes and knows nothing about its consumer; with no reader, nothing tells the server it can reclaim anything.",
      Visual: S.RevealSlotIndifference,
    },
    {
      title: 'Reveal: stalled growth, measured',
      body: (
        <>
          Run directly against this sandbox's real PostgreSQL: a slot with no reader, a real
          write load against a scratch table, the retained-WAL gap read before and after.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: a slot with no reader, a real write load, the retained gap read before and after.',
      takeaway: 'A slot with no reader pins WAL exactly as hard as one whose consumer crashed.',
      Visual: S.RevealGrowthMeasured,
    },
    {
      title: 'Reveal: confirming, not merely running, moves the marker',
      body: (
        <>
          The identical write volume, split into pieces. One slot's consumer never confirms
          between pieces. The other's confirms after every one — mimicking a heartbeat.
        </>
      ),
      duration: 4.8,
      fig: "the identical write volume, split into pieces; one consumer never confirms between pieces, the other confirms after every one.",
      Visual: S.RevealConfirmationMatters,
    },
    {
      title: 'Reveal: confirmation, measured',
      body: (
        <>
          Run directly against the real database: the same total write volume, one slot's gap
          left unconfirmed, the other's gap left after confirming every piece.
        </>
      ),
      duration: 4.8,
      fig: "the real run: the same total volume, one slot's gap left unconfirmed, the other's gap left after confirming every piece.",
      takeaway: "What shrinks the gap is a confirmed read, not connector uptime — that is the entire reason a heartbeat exists.",
      Visual: S.RevealConfirmationMeasured,
    },
    {
      title: 'Reveal: the safety valve trades disk for the stream',
      body: (
        <>
          A real limit set on how much WAL a slot may keep. Past that limit, the server is
          allowed to remove WAL the slot still needed.
        </>
      ),
      duration: 4.8,
      fig: 'a real limit set on how much WAL a slot may keep; past it, the server may remove WAL the slot still needed.',
      Visual: S.RevealSafetyValveTrade,
    },
    {
      title: 'Reveal: the lost slot, measured',
      body: (
        <>
          Run directly against the real database: the limit set, enough writes made to exceed
          it, the slot's own status read before and after, and the exact error PostgreSQL
          raises the moment something tries to read from it afterward.
        </>
      ),
      duration: 4.8,
      fig: "the real run: the limit set, enough writes to exceed it, the slot's own status read before and after.",
      takeaway: 'Past the limit the slot turns lost, not merely behind — reading from it afterward is simply refused.',
      Visual: S.RevealLostSlotMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          A stalled slot pinning WAL regardless of connector health, a confirmed read as the
          only thing that actually moves the marker, and the safety valve's own trade between
          disk and stream.
        </>
      ),
      duration: 4.8,
      fig: "a slot pinning WAL regardless of connector health, confirmation as the only thing that moves the marker, and the valve's own trade.",
      takeaway: "A slot protects its stream by pinning disk — the valve protects disk by giving up the stream.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          None of the steps so far produced a single number worth alerting on before the disk
          was already in trouble. What should actually trigger the alarm?
        </>
      ),
      duration: 2.8,
      fig: "none of this gave a number worth alerting on before the disk was already in trouble. What should trigger the alarm?",
      predict: {
        options: [
          { label: "Connector status, since that's what every monitoring dashboard already shows" },
          { label: "The retained-WAL gap itself, read directly from pg_replication_slots, since that number is exactly what's filling the disk", correct: true },
        ],
        explain: (
          <>
            The hook's own connector reported healthy the entire time the disk was filling, so
            connector status alone could never have caught this. The retained-WAL gap is the
            exact number actually consuming space, and it can be read and alerted on directly.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
