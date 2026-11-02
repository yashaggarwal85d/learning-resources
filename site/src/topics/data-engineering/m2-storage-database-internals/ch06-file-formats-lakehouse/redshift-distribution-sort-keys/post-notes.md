<section data-section="outcomes">

## Outcomes

This topic is sourced entirely from Amazon's own current Redshift documentation, with no account
reachable from this sandbox: leader/compute node and slice architecture, the four distribution
styles and the real redistribution cost a join imposes, compound vs. interleaved sort keys and
the block-skipping mechanism they enable, RA3 managed storage and Serverless RPUs as two routes
to the same storage/compute decoupling, automatic WLM and concurrency scaling, and Spectrum and
automatic table optimization as two independent self-tuning automations.

</section>

<section data-section="deep-dive">

## Deep-dive

Topics 37 and 38 both split storage from compute from the ground up -- a proprietary immutable
layer, and a disaggregated Capacitor/Colossus/Borg design. Redshift's classic shared-nothing
architecture starts from the opposite assumption, tying compute and storage to the same nodes.
RA3 and Serverless are Redshift's own, later route back to the same decoupling idea those earlier
two topics already showed, reached from a genuinely different starting point.

</section>

<section data-section="production">

## Production

Amazon's own docs are explicit that choosing the wrong distribution style forces a real, often
expensive redistribution step at join time -- a production schema decision with a measurable
query-plan cost, not just a performance nicety. Automatic table optimization and automatic WLM
both exist specifically to take that tuning decision away from an administrator by default.

</section>

<section data-section="frontier">

## Frontier

Serverless RPUs remove the node entirely from the capacity question -- a newer model than RA3's
still-node-based managed storage, billing compute alone and leaving nothing for an administrator
to size by hand.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Three proprietary engines and the open engines before them have now all been taught on their own
terms. The one question left is the practical one every engineer eventually has to answer:
warehouse or lakehouse, and when.

</section>
