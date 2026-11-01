# Pre-notes: IT/OT integration without blocking production

- **ISA-95 level.** One of the Purdue Reference Model's layers, from the physical process up through field devices, supervisory control, manufacturing operations, business systems and the corporate layer.
- **Purdue model.** The five-level hierarchy ISA-95 levels are organized into, widely used to draw network-segmentation zones around industrial systems.
- **OT DMZ.** An industrial demilitarized zone sitting between the OT and IT networks, its own zone where every exchange is brokered rather than direct.
- **Data diode.** A hardware device using separate physical transmit and receive paths to physically enforce one-way data flow.
- **OPC UA.** A vendor-neutral, platform-independent protocol for reading from and writing to industrial systems, with its own built-in security model.
- **Sparkplug B.** A specification defining an MQTT topic namespace, payload format and session-state management for real-time industrial telemetry.
- **Unified namespace.** A single, structured topic hierarchy every plant system publishes to and every consumer reads from, replacing point-to-point integrations.
