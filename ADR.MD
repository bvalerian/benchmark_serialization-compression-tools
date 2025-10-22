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

| Left-Aligned  | Center Aligned  | Right Aligned |
| :------------ |:---------------:| -----:|
| col 3 is      | some wordy text | $1600 |
| col 2 is      | centered        |   $12 |
| zebra stripes | are neat        |    $1 |

