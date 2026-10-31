# Sources: GDPR by design in pipelines

## GDPR, Article 5 — Principles relating to processing of personal data

> collected for specified, explicit and legitimate purposes and not further processed in a manner that is incompatible with those purposes

> ('purpose limitation');

> adequate, relevant and limited to what is necessary in relation to the purposes for which they are processed ('data minimisation');

> kept in a form which permits identification of data subjects for no longer than is necessary for the purposes for which the personal data are processed

> ('storage limitation');

> The controller shall be responsible for, and be able to demonstrate compliance with, paragraph 1 ('accountability').

URL: https://gdpr-info.eu/art-5-gdpr/
Version: fetched 2026-10-31

## GDPR, Article 30 — Records of processing activities

> Each controller and, where applicable, the controller's representative, shall maintain a record of processing activities under its responsibility.

> the purposes of the processing;

> a description of the categories of data subjects and of the categories of personal data;

> where possible, the envisaged time limits for erasure of the different categories of data;

> The records referred to in paragraphs 1 and 2 shall be in writing, including in electronic form.

> The controller or the processor and, where applicable, the controller's or the processor's representative, shall make the record available to the supervisory authority on request.

> The obligations referred to in paragraphs 1 and 2 shall not apply to an enterprise or an organisation employing fewer than 250 persons unless the processing it carries out is likely to result in a risk to the rights and freedoms of data subjects, the processing is not occasional, or the processing includes special categories of data as referred to in Article 9(1) or personal data relating to criminal convictions and offences referred to in Article 10.

URL: https://gdpr-info.eu/art-30-gdpr/
Version: fetched 2026-10-31

## GDPR, Article 33 — Notification of a personal data breach to the supervisory authority

> In the case of a personal data breach, the controller shall without undue delay and, where feasible, not later than 72 hours after having become aware of it, notify the personal data breach to the supervisory authority competent in accordance with Article 55, unless the personal data breach is unlikely to result in a risk to the rights and freedoms of natural persons.

> Where the notification to the supervisory authority is not made within 72 hours, it shall be accompanied by reasons for the delay.

> The controller shall document any personal data breaches, comprising the facts relating to the personal data breach, its effects and the remedial action taken.

> That documentation shall enable the supervisory authority to verify compliance with this Article.

URL: https://gdpr-info.eu/art-33-gdpr/
Version: fetched 2026-10-31

## GDPR, Article 35 — Data protection impact assessment

> Where a type of processing in particular using new technologies, and taking into account the nature, scope, context and purposes of the processing, is likely to result in a high risk to the rights and freedoms of natural persons, the controller shall, prior to the processing, carry out an assessment of the impact of the envisaged processing operations on the protection of personal data.

> a systematic and extensive evaluation of personal aspects relating to natural persons which is based on automated processing, including profiling, and on which decisions are based that produce legal effects concerning the natural person or similarly significantly affect the natural person;

> processing on a large scale of special categories of data referred to in Article 9(1), or of personal data relating to criminal convictions and offences referred to in Article 10; or

> a systematic monitoring of a publicly accessible area on a large scale.

URL: https://gdpr-info.eu/art-35-gdpr/
Version: fetched 2026-10-31

## OpenLineage: Object Model

> OpenLineage was designed to enable large-scale observation of datasets as they move through a complex pipeline.

> A Job is a process that consumes or produces Datasets.

> A Dataset is an abstract representation of data. This can refer to a small amount or large amount of data, as long as it's discrete. For databases, this should be a table.

> sourceCodeLocation: Captures the source code location and version (e.g., the git SHA) of the job.

> lifecycleStateChange: Captures the lifecycle states of the Dataset (e.g., alter, create, drop, overwrite, rename, truncate)

URL: https://openlineage.io/docs/spec/object-model
Version: fetched 2026-10-31 (v1.55.0)
