## ISA-95 Standard: Enterprise-Control System Integration

URL: https://www.isa.org/standards-and-publications/isa-standards/isa-95-standard
Version: ISA.org standard page, retrieved 2026-10-30

The five levels, in ISA's own words.

> Level 0: Physical production processes

> Level 0 describes the physical processes of running a plant. It refers to machinery and other assets in the field or on the floor.

> Level 1: Sensing and manipulating the production process

> Level 1 describes the collection of data and the manipulation of physical processes. It refers to sensors, smart devices, valves and other devices that sense or affect production.

> Level 2: Monitoring and supervising control

> Level 2 describes the monitoring and supervising of physical processes in the manufacturing environment. It refers to programmable logic controllers (PLCs), distributed control systems (DCSs) and other control devices.

> Level 3: Manufacturing operations management

> Level 3 describes manufacturing execution systems (MES) and other systems such as supervisory control and data acquisition (SCADA) that manage manufacturing operations. The ISA-95 standard primarily deals with the interface between levels 3 and 4.

> Level 4: Business planning and logistics

> Level 4 describes all the activities related to running a business. It includes enterprise resource planning (ERP) systems.

Contents: the five levels (0-4) with their systems of record; the part structure (Part 1 models and terminology, Part 2 the level 3/4 interface, Part 3 MOM activity models); the Purdue Reference Model as ISA-95's origin; the Industry 4.0 section on the pyramid versus distributed data flows.

## Beyond the Pyramid: Using ISA95 for Industry 4.0 and Smart Manufacturing

URL: https://www.isa.org/intech-home/2021/october-2021/features/beyond-the-pyramid-using-isa95-for-industry-4-0-an
Version: ISA InTech, October 2021 (Brandl & Johnsson), republished Automation.com January 2022

The "time horizon" framing the levels actually rest on, and that the pyramid is one implementation choice, not the standard itself.

> The ISA95 functional model (figure 2) divides the activities required by a manufacturing system into five levels depending on the time horizon of the functionalities—without consideration of the systems supporting the functionality. Some functions are time critical, such as real-time control with cycles in micro- or milliseconds, and others are less time critical with resolution in weeks or days.

> Even though it is not imposed by the ISA95 standard, one traditional implementation of the ISA95 functional model into a physical architecture is a pyramidal network-and-system architectural structure.

> The hierarchy indicates the relative time horizons for the activities but gives no indications of how they should be implemented nor what architectural structure should be used.

> Traditionally, the activities have been implemented through a hierarchical pyramid architecture, but this could be changed for another architectural design, such a modern network-structured architecture, without losing compliance to ISA95.

Contents: the functional model's five time-horizon bands; the pyramid as one traditional physical implementation, not a requirement; the argument for a network-structured architecture that stays ISA95-compliant.

## NIST SP 800-82 Rev. 3: Guide to Operational Technology (OT) Security

URL: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-82r3.pdf
Version: September 2023

NIST's own statement that the Purdue model is the origin of, and maps onto, the ISA-95 levels.

> The ISA95 standard grew from the Purdue Enterprise Reference Architecture (PERA), first published by ISA in 1992.

Contents: the Purdue model and ISA-95 levels used side by side throughout as the standard reference hierarchy for OT network segmentation (used here only to confirm the Purdue/ISA-95 relationship topic 1 names; the segmentation detail itself belongs to topic 6, which cites this document for its own quotes).
