# NITW Verification Architecture & Flow

This document details the technical implementation of the NITW (National Institute of Technology, Warangal) verification flow within the Crediq protocol.

## 1. System Architecture

The verification system is composed of three main layers:

1.  **Frontend Client (Next.js)**: Handles user interaction, visualization, and initiates the verification request.
2.  **Verification Engine (Node.js/Express)**: A trusted execution environment that orchestrates the browser automation, data scraping, and ZK proof generation.
3.  **Blockchain Layer (zkVerify)**: The settlement layer where the Zero-Knowledge proofs are verified and attested.

## 2. Detailed Process Flow

### Phase 1: Secure Session Initialization
*   **Trigger**: The client connects via `Socket.IO` to the Verification Engine and emits a `start_verification` event with the user's portal credentials.
*   **Browser Launch**: The engine uses `Puppeteer` to launch a headless Chrome instance (`--headless="new"`) with a specific viewport (1280x720).
*   **Secure Streaming (CDP)**: Instead of a static waiting screen, the engine establishes a **Chrome DevTools Protocol (CDP)** session. It enables `Page.startScreencast` to stream JPEG frames of the headless browser back to the client in real-time. This allows the user to visually verify that the agent is accessing the correct portal without the server storing the video feed.

### Phase 2: Authentic Data Retrieval
*   **Navigation**: The agent navigates to the official portal: `https://wsdc.nitw.ac.in`.
*   **Credential Injection**: The agent simulates human typing (`page.type` with delay) to enter the Username and Password into the login form.
*   **Portal Access**: The agent submits the form and waits for navigation to complete (`networkidle0` or fallback timeout).
*   **Scraping**:
    *   The agent navigates to the results endpoint: `https://wsdc.nitw.ac.in/results/`.
    *   It evaluates the DOM to find the specific text pattern: `Cumulative Grade Point Average (CGPA): [value]`.
    *   The value is parsed and validated.

### Phase 3: Zero-Knowledge Proof Generation
*   **Condition Check**: The system validates if the scraped CGPA meets the requirement (currently `> 6.0`).
*   **Circuit Execution**:
    *   The system loads pre-compiled ZK artifacts:
        *   `circuit.wasm`: The WebAssembly binary of the circuit logic.
        *   `circuit_0000.zkey`: The proving key.
    *   **Proving**: Using `snarkjs`, a cryptographic proof is generated via `groth16.fullProve`.
    *   *Note*: In the current iteration, the circuit accepts dummy inputs (Signal A and Signal B) to demonstrate the proving pipeline, while the actual scalar condition is checked in the trusted execution environment.

### Phase 4: On-Chain Attestation
*   **ZK-Verify Submission**:
    *   The system initializes a session with the **zkVerify** network (Volta Testnet).
    *   The generated proof, along with the verification key (`vk`) and public signals, is submitted to the chain.
*   **Finality**:
    *   The system subscribes to the transaction status.
    *   Once included in a block, a `txHash` and `attestationId` are returned.
*   **Record Creation**: A robust verification record is created containing the Transaction Hash, Attestation ID, and the outcome, which is then returned to the client.

## Technical Stack
*   **Automation**: Puppeteer, Chrome DevTools Protocol
*   **Cryptography**: SnarkJS, Groth16, Circom
*   **Blockchain**: zkVerifyJS, Volta Testnet
*   **Transport**: Socket.IO, Express

## Security Implications
*   **Data Privacy**: Credentials are transmitted directly to the execution engine and used explicitly for the session. The screencast is ephemeral and meant for user assurance.
*   **Integrity**: The proof generation happens immediately after data scraping within the same trusted process, ensuring that the proven data corresponds to the scraped session.
