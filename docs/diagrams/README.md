# SmartMatch Diagrams

This folder contains architecture diagram sources for the SmartMatch project.

## Deployment Diagram

`smartmatch_deployment_diagram.puml` is the UML deployment diagram for the target production-intent architecture described in the software architecture PDF.

It shows:

- client and provider mobile devices running the Expo app
- an admin workstation running the React/Vite dashboard in the browser
- a consolidated Node.js/Express backend application server
- a separate FastAPI AI matching engine
- a MongoDB operational database with geospatial indexing support
- external notification providers for push and email delivery

## Scope And Assumptions

This is intentionally a core-nodes-only deployment view:

- it represents the intended target architecture, not the current mock-only repo state
- it excludes Redis, load balancers, replicas, CDN hosting, monitoring, and failover nodes
- it keeps the backend as one deployment node for readability, even though it contains multiple logical services
- it keeps the AI matching engine as a separate deployed node because the architecture document defines a dedicated prediction API

## Validation Checklist

Use the diagram to verify these scenarios:

- a client creates a service request and the backend calls the matching engine before returning ranked providers
- a provider receives push or email notifications only through the external notification providers
- a provider accepts or rejects a request through backend-managed APIs and real-time channels
- a client tracks request progress through backend-managed request state
- an admin verifies provider profiles only through the admin dashboard and backend APIs
- all persistence flows terminate at MongoDB
- no client-facing node connects directly to MongoDB or the AI matching engine
