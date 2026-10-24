# Sources — Tower Service and poll_ready backpressure

## `tower::Service`

URL: https://docs.rs/tower/latest/tower/trait.Service.html
Fetched: 2026-10-24, cached at `sources/tower-service.txt`.

> Calling a Service which is at capacity (i.e., it is temporarily unable to process a request) should result in an error. The caller is responsible for ensuring that the service is ready to receive the request before calling it.

> Service provides a mechanism by which the caller is able to coordinate readiness. Service::poll_ready returns Ready if the service expects that it is able to process a request.

> Returns Poll::Ready(Ok(())) when the service is able to process requests.
> If the service is at capacity, then Poll::Pending is returned and the task is notified when the service becomes ready again. This function is expected to be called while on a task. Generally, this can be done with a simple futures::future::poll_fn call.

> Implementations are permitted to panic if call is invoked without obtaining Poll::Ready(Ok(())) from poll_ready.

## `tower::load_shed`

URL: https://docs.rs/tower/latest/tower/load_shed/index.html
Fetched: 2026-10-24, cached at `sources/tower-load-shed.txt`.

> Middleware for shedding load when inner services aren't ready.

> A Service that sheds load when the inner service isn't ready.

## `tower::buffer`

URL: https://docs.rs/tower/latest/tower/buffer/index.html
Fetched: 2026-10-24, cached at `sources/tower-buffer.txt`.

> Middleware that provides a buffered mpsc channel to a service.

> This module allows you to do that by placing the service behind a multi-producer, single-consumer buffering channel.

## `tower::timeout`

URL: https://docs.rs/tower/latest/tower/timeout/index.html
Fetched: 2026-10-24, cached at `sources/tower-timeout.txt`.

> Middleware that applies a timeout to requests.

> If the response does not complete within the specified timeout, the response will be aborted.
