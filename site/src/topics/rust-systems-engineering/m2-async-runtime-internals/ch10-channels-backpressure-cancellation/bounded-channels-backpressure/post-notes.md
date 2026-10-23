---
title: "Bounded channels and backpressure"
---

## Outcomes

- Measure a bounded `mpsc` channel genuinely applying backpressure: a fast producer sending into a channel of capacity 1 is paced by a slow consumer, not racing ahead of it.
- Measure a `broadcast` channel's real lagging-receiver behavior: a receiver that falls behind reports exactly how many messages were dropped, then resumes cleanly from the oldest value still retained.
- Measure a `watch` channel retaining only the most recently sent value: a receiver that checks in late after many sends sees only the last one.
- Measure `try_send` refusing a full channel immediately, as the real load-shedding hook, distinct from `send`'s backpressure.

## Internals

The four channel kinds this topic measures are not four speeds of the same thing; each one makes a structurally different promise about a message nobody was ready to receive. `mpsc`'s bound is a queue depth the sender waits on — `send` never returns until there's room, which is exactly what makes a producer's total time trackable against a consumer's own pace. `broadcast`'s bound is not a queue the sender waits on at all; `send` never blocks, and the bound instead decides how far behind a receiver can fall before the channel starts overwriting what it hasn't read yet — a fundamentally different kind of capacity decision. `watch` doesn't have a queue depth in any meaningful sense; its single slot means no number of additional sends before a read changes what gets delivered, only the most recent one ever can, which is why the measurement here is deliberately aggressive: 50 sends, zero reads in between, specifically to make the point sharply rather than plausibly. And `oneshot` is the degenerate case of the whole family — a channel whose only meaningful capacity decision is exactly one, needing no backpressure or load-shedding policy of its own because it is used up on its first and only message.

## In production

`try_send` and `send` are not two speeds of the same operation; they are two different decisions a caller makes about what should happen when a channel is full, and conflating them is exactly the mistake that turns a load-shedding design into an accidental backpressure one, or the reverse. The sub-millisecond refusal measured in this topic matters because it proves `try_send` genuinely never blocks, even briefly — a caller using it to shed load under real overload needs that guarantee to be exact, not merely fast in the common case. Choosing a channel's capacity at all, per this chapter's own operating rule, is an application-specific burst-tolerance decision (sized, in production, by something like Little's law) rather than a default pulled from an example.

## The frontier

This topic closes the first half of what Chapter 9 named but didn't prove: a bounded channel's limit is real and enforced, in four genuinely different shapes depending on which channel kind is chosen for the job. The second half — what happens to a task that's cancelled while it's waiting on one of these channels — is deliberately left to the next topic rather than folded in here.

## Where this goes next

A bounded channel can make a producer wait, but the task doing the waiting can also simply be cancelled instead — and that cancellation has exactly one real mechanism, with a sharp edge most code never checks for.
