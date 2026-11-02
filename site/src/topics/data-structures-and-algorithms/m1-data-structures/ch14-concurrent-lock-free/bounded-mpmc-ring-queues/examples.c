/* Real, compiled benchmarks for dsa.bounded-mpmc-ring-queues (CHAPTER.md's own instruction: a
 * pure-Python thread benchmark would be dominated by the interpreter's own global lock, so any
 * throughput or scaling figure for this topic's post-notes Lab comes from here, compiled on the
 * builder's own machine, never from examples.py. Run via examples.sh; machine/compiler/flags are
 * recorded in OUTLINE.md. Two independent benchmarks:
 *   1. Vyukov's bounded MPMC queue (CAS-based, per-slot sequence number) vs. a mutex-protected
 *      ring buffer of the same capacity, at 1/2/4/8 producer-and-consumer threads each.
 *   2. False sharing: two atomic counters incremented by two threads, padded (own cache line
 *      each) vs. unpadded (adjacent, sharing a line).
 */
#include <stdatomic.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <time.h>

static double now_sec(void) {
  struct timespec ts;
  clock_gettime(CLOCK_MONOTONIC, &ts);
  return (double)ts.tv_sec + (double)ts.tv_nsec / 1e9;
}

/* ---------- Vyukov's bounded MPMC queue ---------- */

typedef struct { _Atomic size_t sequence; long data; } vcell_t;

typedef struct {
  char pad0[64];
  vcell_t *buffer;
  size_t mask;
  char pad1[64];
  _Atomic size_t enqueue_pos;
  char pad2[64];
  _Atomic size_t dequeue_pos;
  char pad3[64];
} vqueue_t;

static void vqueue_init(vqueue_t *q, size_t capacity /* power of two */) {
  q->buffer = calloc(capacity, sizeof(vcell_t));
  q->mask = capacity - 1;
  for (size_t i = 0; i < capacity; i++) atomic_store_explicit(&q->buffer[i].sequence, i, memory_order_relaxed);
  atomic_store_explicit(&q->enqueue_pos, 0, memory_order_relaxed);
  atomic_store_explicit(&q->dequeue_pos, 0, memory_order_relaxed);
}

static int vqueue_enqueue(vqueue_t *q, long data) {
  vcell_t *cell;
  size_t pos = atomic_load_explicit(&q->enqueue_pos, memory_order_relaxed);
  for (;;) {
    cell = &q->buffer[pos & q->mask];
    size_t seq = atomic_load_explicit(&cell->sequence, memory_order_acquire);
    intptr_t dif = (intptr_t)seq - (intptr_t)pos;
    if (dif == 0) {
      if (atomic_compare_exchange_weak_explicit(&q->enqueue_pos, &pos, pos + 1, memory_order_relaxed, memory_order_relaxed)) break;
    } else if (dif < 0) {
      return 0; /* full */
    } else {
      pos = atomic_load_explicit(&q->enqueue_pos, memory_order_relaxed);
    }
  }
  cell->data = data;
  atomic_store_explicit(&cell->sequence, pos + 1, memory_order_release);
  return 1;
}

static int vqueue_dequeue(vqueue_t *q, long *out) {
  vcell_t *cell;
  size_t pos = atomic_load_explicit(&q->dequeue_pos, memory_order_relaxed);
  for (;;) {
    cell = &q->buffer[pos & q->mask];
    size_t seq = atomic_load_explicit(&cell->sequence, memory_order_acquire);
    intptr_t dif = (intptr_t)seq - (intptr_t)(pos + 1);
    if (dif == 0) {
      if (atomic_compare_exchange_weak_explicit(&q->dequeue_pos, &pos, pos + 1, memory_order_relaxed, memory_order_relaxed)) break;
    } else if (dif < 0) {
      return 0; /* empty */
    } else {
      pos = atomic_load_explicit(&q->dequeue_pos, memory_order_relaxed);
    }
  }
  *out = cell->data;
  atomic_store_explicit(&cell->sequence, pos + q->mask + 1, memory_order_release);
  return 1;
}

/* ---------- Mutex-protected ring buffer baseline ---------- */

typedef struct {
  pthread_mutex_t lock;
  long *buffer;
  size_t mask, head, tail, count;
} mqueue_t;

static void mqueue_init(mqueue_t *q, size_t capacity) {
  pthread_mutex_init(&q->lock, NULL);
  q->buffer = calloc(capacity, sizeof(long));
  q->mask = capacity - 1;
  q->head = q->tail = q->count = 0;
}

static int mqueue_enqueue(mqueue_t *q, long data) {
  pthread_mutex_lock(&q->lock);
  int ok = q->count <= q->mask;
  if (ok) { q->buffer[q->tail & q->mask] = data; q->tail++; q->count++; }
  pthread_mutex_unlock(&q->lock);
  return ok;
}

static int mqueue_dequeue(mqueue_t *q, long *out) {
  pthread_mutex_lock(&q->lock);
  int ok = q->count > 0;
  if (ok) { *out = q->buffer[q->head & q->mask]; q->head++; q->count--; }
  pthread_mutex_unlock(&q->lock);
  return ok;
}

/* ---------- Benchmark harness: N producers, N consumers, OPS_PER_THREAD each ---------- */

#define OPS_PER_THREAD 200000
#define CAPACITY 4096

typedef struct { vqueue_t *vq; mqueue_t *mq; long ops; } worker_arg_t;

static void *vqueue_producer(void *a) {
  worker_arg_t *w = a;
  for (long i = 0; i < w->ops; i++) while (!vqueue_enqueue(w->vq, i)) {}
  return NULL;
}
static void *vqueue_consumer(void *a) {
  worker_arg_t *w = a;
  long v;
  for (long i = 0; i < w->ops; i++) while (!vqueue_dequeue(w->vq, &v)) {}
  return NULL;
}
static void *mqueue_producer(void *a) {
  worker_arg_t *w = a;
  for (long i = 0; i < w->ops; i++) while (!mqueue_enqueue(w->mq, i)) {}
  return NULL;
}
static void *mqueue_consumer(void *a) {
  worker_arg_t *w = a;
  long v;
  for (long i = 0; i < w->ops; i++) while (!mqueue_dequeue(w->mq, &v)) {}
  return NULL;
}

static double bench_vqueue(int n_threads_each_side) {
  vqueue_t q;
  vqueue_init(&q, CAPACITY);
  pthread_t producers[32], consumers[32];
  worker_arg_t arg = { .vq = &q, .ops = OPS_PER_THREAD };
  double t0 = now_sec();
  for (int i = 0; i < n_threads_each_side; i++) pthread_create(&producers[i], NULL, vqueue_producer, &arg);
  for (int i = 0; i < n_threads_each_side; i++) pthread_create(&consumers[i], NULL, vqueue_consumer, &arg);
  for (int i = 0; i < n_threads_each_side; i++) pthread_join(producers[i], NULL);
  for (int i = 0; i < n_threads_each_side; i++) pthread_join(consumers[i], NULL);
  double t1 = now_sec();
  free(q.buffer);
  long total_ops = (long)n_threads_each_side * OPS_PER_THREAD * 2;
  return total_ops / (t1 - t0);
}

static double bench_mqueue(int n_threads_each_side) {
  mqueue_t q;
  mqueue_init(&q, CAPACITY);
  pthread_t producers[32], consumers[32];
  worker_arg_t arg = { .mq = &q, .ops = OPS_PER_THREAD };
  double t0 = now_sec();
  for (int i = 0; i < n_threads_each_side; i++) pthread_create(&producers[i], NULL, mqueue_producer, &arg);
  for (int i = 0; i < n_threads_each_side; i++) pthread_create(&consumers[i], NULL, mqueue_consumer, &arg);
  for (int i = 0; i < n_threads_each_side; i++) pthread_join(producers[i], NULL);
  for (int i = 0; i < n_threads_each_side; i++) pthread_join(consumers[i], NULL);
  double t1 = now_sec();
  pthread_mutex_destroy(&q.lock);
  free(q.buffer);
  long total_ops = (long)n_threads_each_side * OPS_PER_THREAD * 2;
  return total_ops / (t1 - t0);
}

/* ---------- False sharing: two counters, padded vs. unpadded ---------- */

#define INCREMENTS 50000000L

typedef struct { _Atomic long a; _Atomic long b; } unpadded_pair_t;
typedef struct { _Atomic long a; char pad[56]; _Atomic long b; char pad2[56]; } padded_pair_t;

static void *bump_a_unpadded(void *p) { unpadded_pair_t *u = p; for (long i = 0; i < INCREMENTS; i++) atomic_fetch_add_explicit(&u->a, 1, memory_order_relaxed); return NULL; }
static void *bump_b_unpadded(void *p) { unpadded_pair_t *u = p; for (long i = 0; i < INCREMENTS; i++) atomic_fetch_add_explicit(&u->b, 1, memory_order_relaxed); return NULL; }
static void *bump_a_padded(void *p) { padded_pair_t *u = p; for (long i = 0; i < INCREMENTS; i++) atomic_fetch_add_explicit(&u->a, 1, memory_order_relaxed); return NULL; }
static void *bump_b_padded(void *p) { padded_pair_t *u = p; for (long i = 0; i < INCREMENTS; i++) atomic_fetch_add_explicit(&u->b, 1, memory_order_relaxed); return NULL; }

static double bench_false_sharing_unpadded(void) {
  unpadded_pair_t u = {0, 0};
  pthread_t ta, tb;
  double t0 = now_sec();
  pthread_create(&ta, NULL, bump_a_unpadded, &u);
  pthread_create(&tb, NULL, bump_b_unpadded, &u);
  pthread_join(ta, NULL);
  pthread_join(tb, NULL);
  return now_sec() - t0;
}

static double bench_false_sharing_padded(void) {
  padded_pair_t u = {0};
  pthread_t ta, tb;
  double t0 = now_sec();
  pthread_create(&ta, NULL, bump_a_padded, &u);
  pthread_create(&tb, NULL, bump_b_padded, &u);
  pthread_join(ta, NULL);
  pthread_join(tb, NULL);
  return now_sec() - t0;
}

int main(void) {
  printf("sizeof(unpadded_pair_t) = %zu bytes; sizeof(padded_pair_t) = %zu bytes\n", sizeof(unpadded_pair_t), sizeof(padded_pair_t));

  double unpadded_s = bench_false_sharing_unpadded();
  double padded_s = bench_false_sharing_padded();
  printf("false sharing: unpadded %.3fs, padded %.3fs, ratio %.2fx\n", unpadded_s, padded_s, unpadded_s / padded_s);

  printf("\nqueue throughput (ops/sec, producers=consumers=N):\n");
  printf("%-4s %14s %14s\n", "N", "vyukov", "mutex");
  int sides[] = {1, 2, 4, 8};
  for (int i = 0; i < 4; i++) {
    double v = bench_vqueue(sides[i]);
    double m = bench_mqueue(sides[i]);
    printf("%-4d %14.0f %14.0f\n", sides[i], v, m);
  }
  return 0;
}
