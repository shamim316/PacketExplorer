# TCP Packet Explorer 🧊

An interactive, educational 3D website for learning the structure of a **TCP
segment** — built for demonstrating network engineering fundamentals to
college graduates.

The TCP segment is rendered as a 3D object laid out exactly like the
RFC 9293 / RFC 793 header diagram (32-bit rows, top to bottom). An **explode
slider** pulls every field apart into an exploded assembly view, and each
field is clickable with a definition and practical details:

- Source Port · Destination Port
- Sequence Number · Acknowledgment Number
- Data Offset · Reserved bits
- Control Flags — **SYN, ACK, FIN, RST, PSH, URG** (each an individual 3D block)
- Window Size · Checksum · Urgent Pointer
- Options · Payload (application data)

## Features

- **3D exploded view** — drag to orbit, scroll to zoom, slider or one-click
  Explode/Assemble animation
- **Click-to-learn** — select any block (or the field list) for a definition,
  bit size, byte offset, and real-world details
- **Connection life-cycle scenarios** — three-way handshake (SYN → SYN-ACK →
  ACK), data transfer (PSH-ACK), graceful close (FIN-ACK), and reset (RST),
  with the relevant flag blocks pulsing in the model
- **Responsive** — three-panel desktop layout collapses for smaller screens

## Tech stack

- [React 19](https://react.dev) + [Vite](https://vite.dev)
- [Three.js](https://threejs.org) via
  [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) and
  [@react-three/drei](https://github.com/pmndrs/drei)

## Running locally

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build to dist/
npm run preview  # serve the production build
```

The build uses relative asset paths (`base: './'`), so `dist/` can be hosted
from any static host or sub-path (e.g. GitHub Pages).
