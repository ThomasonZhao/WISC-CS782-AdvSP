# WISC-CS782-AdvSP
UW-Madison CS782 advanced security privacy project

In this project, we implemented and evaluated two Password Authenticated Key Exchange (PAKE) protocols - Secure Remote Password (SRP) and OPAQUE - compared against a baseline Password Over TLS authentication mechanism.

The goal was to assess the usability of PAKE protocols in terms of performance, scalability, and user experience. PAKE protocols offer enhanced security by establishing a secure session key between client and server without directly exposing the user's password.

## Implementation  

We implemented web applications using the following stack:

- Front-end: React.js
- Back-end: Node.js
- Database: MongoDB  

Separate implementations were created for SRP, OPAQUE, and the Password Over TLS baseline for comparison.

## Evaluation

The evaluation consisted of two main parts:

1. **Server-side Performance Tests**: Benchmarks measured server CPU usage, memory consumption, and storage requirements when handling concurrent user registration and login load.

2. **User Experience Study**: A survey gathered feedback from 136 participants on the usability, trustworthiness, and perceived safety of the PAKE protocol implementations compared to Password Over TLS.

## Findings

The key findings include:

- PAKE protocols like SRP and OPAQUE provide stronger security guarantees but incur higher computational overhead on the server compared to basic Password Over TLS authentication.
- PAKE protocols require more server-side storage space to store additional cryptographic data.
- Client-side response times were noticeably longer for PAKE protocols versus Password Over TLS, but participants generally felt more secure with PAKE despite the increased latency.

The insights from this project can inform decision-makers on adopting PAKE protocols by understanding the tradeoffs between security benefits, performance impact, and user experience.
