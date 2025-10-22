# ADR: Use of Binary Encoding for Inter-Service Communication

**Status**: Proposed
**Date**: 2025-10-22
**Context**:
Our distributed system consists of a BFF and multiple backend microservices (10+). Services communicate primarily through HTTP and Kafka events. Currently, payloads are exchanged using plain JSON. The team is considering introducing binary serialization (e.g., Avro, MessagePack) for internal communication to reduce payload size and enforce schema validation.


## Decision
Adopt a hybrid strategy:

Frontend ↔ BFF: Continue using JSON (or optionally MessagePack for performance).

BFF ↔ Backend Services & Service ↔ Service: Use a binary serialization format (Avro or MessagePack) for efficiency and schema enforcement.


## Comparison
Ease of debugging:

| Criteria                          | JSON (No Encoding)                       | Binary Encoding |
| :-------------------------------- |:----------------------------------------:| ----------------------:|
| Ease of debugging                 | Human-readable; easy to log and inspect. | Harder to debug; needs decoding tools. |
| Tooling & observability           | Simple with existing HTTP tools.         | Requires specific decoding middleware and monitoring. |
| Cross-language support            | Universal.                               | Requires schema management and codegen. |
| Schema enforcement                | Optional                                 | Strong schema validation. |
| Network efficiency                | Larger payload size.                     | Requires schema management and codegen. |
| Performance (serialization/deserialization)  | Slower due to string parsing. | Much faster; binary formats use efficient codecs. |

// TODO:
## Pros of Encoding (Avro/MsgPack)
- Smaller payloads: Reduces bandwidth usage and latency, especially beneficial for high-throughput Kafka or gRPC streams.
- Stronger contracts: Avro/Protobuf enforce schemas → safer deployments.
- Performance boost: Binary serialization/deserialization can be 3–5× faster.
- Forward/backward compatibility: With Avro schema evolution, old consumers keep working.
- Standardization: Enables typed code generation and eliminates manual JSON mapping.


## Cons of Encoding
- Complexity overhead: Requires middleware for encoding/decoding in every service.
- Reduced transparency: Debugging logs or inspecting messages on the wire becomes harder.
- Schema governance: Requires a central schema registry and strict version control.
- Increased onboarding cost: Developers must learn schema management and tools.
- Monitoring integration: Observability tools (e.g., Datadog, ELK) need adapters for binary payloads.

