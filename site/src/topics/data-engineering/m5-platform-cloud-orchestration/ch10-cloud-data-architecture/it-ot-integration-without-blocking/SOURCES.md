# Sources: IT/OT integration without blocking production

## Process Control Guide: ISA-95 Explained: Purdue Model, Levels and IEC 62264

URL: https://processcontrolguide.com/isa-95-enterprise-integration/
Version: fetched 2026-10-31

> The standard is built around the Purdue Reference Model — a five-level hierarchy from the physical process (Level 0) up through controllers (Level 1), operator stations (Level 2), plant operations (Level 3), and enterprise systems (Level 4).

> The actual process being controlled — the chemistry happening in a reactor, the separation happening in a distillation column, the combustion happening in a furnace. This is the physical reality that everything above exists to manage. Sensors measure it; final elements (valves, motors, heaters) act on it.

> The field devices and the controllers that execute the actual control logic. Pressure transmitters, temperature sensors, flow meters, control valves, motor starters, gas detectors.

> The operator stations, engineering workstations, and supervisory systems that humans interact with directly.

> The plant-level systems that manage manufacturing operations as a whole — Manufacturing Execution Systems (MES), batch management systems, plant historians, production scheduling, quality management, maintenance management, document management, advanced process control coordination.

> The site-level business systems — Enterprise Resource Planning (ERP) systems, production planning, materials management, financial reporting, regulatory reporting, supply chain integration.

> The corporate-level systems above any single site — multi-site planning, corporate financial systems, strategic planning, executive reporting. Level 5 wasn't always explicitly in the Purdue model; it was added as multi-site enterprises and corporate cloud systems became more prominent.

## Software Toolbox: Industrial DMZ (iDMZ): Design, Data Flows & Common Mistakes

URL: https://softwaretoolbox.com/resources/what-is-industrial-dmz
Version: fetched 2026-10-31

> An industrial DMZ (iDMZ) is a dedicated network zone between the OT (operational technology) network and the IT (enterprise) network. Its one rule: no traffic crosses the IT/OT boundary without terminating in the iDMZ first.

> The iDMZ sits at Level 3.5 of the Purdue Model, between Level 4 (site business/IT) and Level 3 (manufacturing operations). It is not part of the OT network and not part of the IT network. It is a third zone with its own security policy, its own servers, and its own responsibility assignment.

> The defining rule of an iDMZ: traffic from the enterprise network is not allowed to go directly to the industrial side. It has to land in the iDMZ first. And OT systems should never initiate connections toward the enterprise network.

> An MQTT broker in the iDMZ receives Sparkplug B publications from edge nodes or OPC servers in the OT zone (outbound connections from OT) and exposes topic subscriptions to IT-side consumers. The broker is the single controlled egress point for OT data.

## Network Critical: Top 6 Data Diodes for IEC 62443 OT Segmentation in 2026

URL: https://www.networkcritical.com/blogs/data-diodes-for-iec-62443-ot-segmentation
Version: fetched 2026-10-31

> A data diode is a hardware device that physically enforces one-way data flow between networks of differing trust levels. IEC 62443 cares because it requires strict segmentation between OT zones and lower-trust networks. A diode provides that segmentation at the hardware level rather than through software policy that can be misconfigured.

> A data diode enforces one-way communication using separate physical transmit and receive paths. Reverse traffic is not possible regardless of configuration. A firewall is a software-based control that filters traffic according to rules, and those rules can be misconfigured or bypassed.

> IEC 62443 defines security zones connected by conduits. Each conduit carrying data from a higher-trust OT zone to a lower-trust IT zone is a candidate for diode enforcement.

## OPC Foundation: OPC Unified Architecture – Part 1: Overview and Concepts

URL: https://reference.opcfoundation.org/specs/OPC-10000-1/full
Version: fetched 2026-10-31

> OPC Unified Architecture (OPC UA) is a platform-independent standard designed to facilitate seamless information exchange in industrial automation and other domains. It provides a comprehensive framework for modelling information, secure communication, and ensuring interoperability between diverse systems and devices.

> OPC UA is a platform-independent standard that enables various systems and devices to communicate securely and reliably. It employs mechanisms for authentication, encryption, and integrity checks to ensure the identity of OPC UA Applications as well as identification of users and protect against attacks.

> Rather, OPC UA provides a security model, described in OPC 10000-2, in which security measures can be selected and configured to meet the security needs of a given installation.

## Eclipse Foundation: The Sparkplug Specification

URL: https://sparkplug.eclipse.org/specification/
Version: fetched 2026-10-31

> Sparkplug is an open-source specification hosted at the Eclipse Foundation that provides MQTT clients the framework to seamlessly integrate data from their applications, sensors, devices, and gateways within the MQTT Infrastructure.

> The aim of the Sparkplug Specification is to define an MQTT Topic Namespace, payload, and session state management that can be applied generically to the overall IIoT market sector but specifically meets the requirements of real-time SCADA/Control HMI solutions.

## Software Toolbox: What is Sparkplug B?

URL: https://softwaretoolbox.com/resources/what-is-sparkplug-b
Version: fetched 2026-10-31

> The birth and death certificate mechanism is Sparkplug B's most important contribution to industrial MQTT deployments. It solves a fundamental problem: in a pub/sub architecture, consumers have no inherent knowledge of what devices exist, what they publish, or whether they are currently connected.

> The NDEATH message is pre-configured as the MQTT Last Will and Testament when the node connects. If the node disconnects without sending an explicit DISCONNECT, the broker publishes NDEATH automatically. Subscribers instantly know the node and all devices behind it are offline.

> When the EoN node loses communication with a connected device, it publishes DDEATH for that device. Subscribers know the device is offline and should treat its last known values as stale.

> The result: a fully self-maintaining namespace. With birth and death certificates, the Sparkplug B namespace is always current.

## HiveMQ: Smart Manufacturing Using ISA95, MQTT Sparkplug and the Unified Namespace

URL: https://www.hivemq.com/resources/smart-manufacturing-using-isa95-mqtt-sparkplug-and-uns/
Version: fetched 2026-10-31

> Instead, they publish information about themselves to a central repository of information, in this case, a Unified Namespace. Other participants can then go on to pull the information that they are interested in from the Unified Namespace. All direct communication is totally removed, thus making it easy to merge control systems with IT systems without them knowing about each other's implementation details.

> Essentially, a Unified Namespace is a middleware solution that allows you to collect data from various industrial systems, add context to it, and transform it into a format that other systems can understand.

> However, ISA 95 does not impose a pyramidal network-and-system architectural approach for its implementation, as it is purely a functional modeling standard, not an inter-networking one.

> As it turns out, the Unified Namespace architecture and ISA 95 are actually complementary to each other. Meaning that you could design your smart manufacturing system based on a Unified Namespace architecture and then use ISA 95 standard for modeling the data objects that get pushed to your Unified Namespace.
