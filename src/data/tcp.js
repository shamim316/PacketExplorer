// ---------------------------------------------------------------------------
// TCP segment model: geometry layout + educational content for every field.
// The header is modelled exactly like the RFC 9293 / RFC 793 diagram: rows of
// 32 bits, stacked top-to-bottom, followed by the payload.
// ---------------------------------------------------------------------------

export const BIT_W = 0.22 // world units per bit → a 32-bit row is 7.04 wide
export const DEPTH = 2.1 // slab depth (z)
export const GAP = 0.07 // visual gap carved between adjacent blocks

// One entry per stacked row: six 32-bit header rows, then the payload slab.
export const ROW_HEIGHTS = [0.74, 0.74, 0.74, 0.74, 0.74, 0.74, 1.7]
export const STACK_H = ROW_HEIGHTS.reduce((a, b) => a + b, 0)

/** Center position + size of a block from its row / bit-range. */
export function blockLayout(block) {
  const W = 32 * BIT_W
  const x = (block.bitStart + block.bits / 2) * BIT_W - W / 2
  const yTop =
    STACK_H / 2 - ROW_HEIGHTS.slice(0, block.row).reduce((a, b) => a + b, 0)
  const h = ROW_HEIGHTS[block.row]
  return { x, y: yTop - h / 2, w: block.bits * BIT_W, h, d: DEPTH }
}

// Bit order of the control flags inside header row 3 (bits 10–15).
export const FLAG_IDS = ['URG', 'ACK', 'PSH', 'RST', 'SYN', 'FIN']

// ---------------------------------------------------------------------------
// Visual blocks (what gets rendered in 3D)
// ---------------------------------------------------------------------------
export const BLOCKS = [
  { id: 'srcPort', label: 'Source Port', row: 0, bitStart: 0, bits: 16, color: '#e5484d' },
  { id: 'dstPort', label: 'Destination Port', row: 0, bitStart: 16, bits: 16, color: '#f76b15' },
  { id: 'seq', label: 'Sequence Number', row: 1, bitStart: 0, bits: 32, color: '#ffb224' },
  { id: 'ack', label: 'Acknowledgment Number', row: 2, bitStart: 0, bits: 32, color: '#8db654' },
  { id: 'dataOffset', label: 'Offset', row: 3, bitStart: 0, bits: 4, color: '#30a46c' },
  { id: 'reserved', label: 'Rsvd', row: 3, bitStart: 4, bits: 6, color: '#5a6169' },
  { id: 'URG', label: 'URG', row: 3, bitStart: 10, bits: 1, color: '#9b5de5', flag: true },
  { id: 'ACK', label: 'ACK', row: 3, bitStart: 11, bits: 1, color: '#0091ff', flag: true },
  { id: 'PSH', label: 'PSH', row: 3, bitStart: 12, bits: 1, color: '#f78c6b', flag: true },
  { id: 'RST', label: 'RST', row: 3, bitStart: 13, bits: 1, color: '#ffd166', flag: true },
  { id: 'SYN', label: 'SYN', row: 3, bitStart: 14, bits: 1, color: '#06d6a0', flag: true },
  { id: 'FIN', label: 'FIN', row: 3, bitStart: 15, bits: 1, color: '#ef476f', flag: true },
  { id: 'window', label: 'Window Size', row: 3, bitStart: 16, bits: 16, color: '#3e63dd' },
  { id: 'checksum', label: 'Checksum', row: 4, bitStart: 0, bits: 16, color: '#6e56cf' },
  { id: 'urgentPtr', label: 'Urgent Pointer', row: 4, bitStart: 16, bits: 16, color: '#ab4aba' },
  { id: 'options', label: 'Options (variable)', row: 5, bitStart: 0, bits: 32, color: '#889096' },
  { id: 'payload', label: 'Payload — Application Data', row: 6, bitStart: 0, bits: 32, color: '#12a594' },
]

// ---------------------------------------------------------------------------
// Educational content (shown in the info panel)
// ---------------------------------------------------------------------------
export const FIELD_INFO = {
  overview: {
    name: 'The TCP Segment',
    size: 'Header: 20–60 bytes · Payload: up to one MSS',
    definition:
      'TCP (Transmission Control Protocol) provides a reliable, ordered, ' +
      'connection-oriented byte stream between two applications. The unit it ' +
      'sends is called a segment: a header of at least 20 bytes followed by ' +
      'the payload. Each segment is handed to IP, which wraps it in a packet ' +
      'and routes it across the network.',
    details:
      'Use the Explode slider to pull the segment apart, drag to orbit, and ' +
      'click any block — or any name in the field list — to learn what it ' +
      'does. Try the scenarios on the left to see which control flags light ' +
      'up during a connection’s life cycle.',
  },
  srcPort: {
    name: 'Source Port',
    size: '16 bits · bytes 0–1',
    definition:
      'Identifies the sending application on the source host. Together with ' +
      'the source IP, destination IP, and destination port it forms the ' +
      '4-tuple that uniquely names this connection.',
    details:
      'Clients usually pick an ephemeral port (typically 49152–65535) chosen ' +
      'by the operating system. Replies from the server are addressed back ' +
      'to this port. Example value: 51334.',
  },
  dstPort: {
    name: 'Destination Port',
    size: '16 bits · bytes 2–3',
    definition:
      'Identifies the receiving application on the destination host — the ' +
      'service the sender wants to talk to.',
    details:
      'Well-known ports (0–1023) are reserved for standard services: 80 for ' +
      'HTTP, 443 for HTTPS, 22 for SSH, 25 for SMTP, 53 for DNS-over-TCP. A ' +
      'server "listens" on a port; the OS demultiplexes arriving segments to ' +
      'the right socket using this field.',
  },
  seq: {
    name: 'Sequence Number',
    size: '32 bits · bytes 4–7',
    definition:
      'The position, in the sender’s byte stream, of the first data byte in ' +
      'this segment. TCP numbers every byte, not every segment — this is how ' +
      'the receiver reassembles data in order and detects duplicates.',
    details:
      'Each side picks a random Initial Sequence Number (ISN) during the ' +
      'handshake, for security and to avoid confusion with old connections. ' +
      'The SYN and FIN flags each consume one sequence number even though ' +
      'they carry no data. Wraps around modulo 2³².',
  },
  ack: {
    name: 'Acknowledgment Number',
    size: '32 bits · bytes 8–11',
    definition:
      'The next byte the sender of this segment expects to receive — i.e. ' +
      '"I have everything up to byte N−1, send me N next." Only meaningful ' +
      'when the ACK flag is set.',
    details:
      'TCP acknowledgments are cumulative: acknowledging byte 5000 confirms ' +
      'every byte before it. Because connections are full-duplex, a single ' +
      'segment can carry data one way and acknowledge data flowing the other ' +
      'way ("piggybacking").',
  },
  dataOffset: {
    name: 'Data Offset (Header Length)',
    size: '4 bits · byte 12 (high nibble)',
    definition:
      'The length of the TCP header measured in 32-bit words, which tells ' +
      'the receiver where the payload begins.',
    details:
      'Minimum value 5 → 20-byte header with no options. Maximum value 15 → ' +
      '60-byte header, leaving room for up to 40 bytes of options. Needed ' +
      'because the Options field makes the header variable-length.',
  },
  reserved: {
    name: 'Reserved',
    size: '6 bits · byte 12–13',
    definition:
      'Bits set aside by the original specification (RFC 793) for future ' +
      'use; senders set them to zero.',
    details:
      'Later standards did claim some of these bits: RFC 3168 defined CWR ' +
      'and ECE for Explicit Congestion Notification (ECN), letting routers ' +
      'signal congestion without dropping packets. A good example of how a ' +
      'protocol evolves within a fixed header layout.',
  },
  flags: {
    name: 'Control Flags',
    size: '6 bits · bytes 12–13',
    definition:
      'Single-bit switches that control the state of the connection. They ' +
      'are the "verbs" of TCP: they open connections, acknowledge data, ' +
      'push it to applications, and close or abort the conversation.',
    details:
      'Flags are often combined — a SYN-ACK sets both SYN and ACK; most ' +
      'data segments set ACK (and often PSH). Click an individual flag ' +
      'block, or run a scenario, to see each one in action.',
  },
  URG: {
    name: 'URG — Urgent',
    size: '1 bit',
    definition:
      'Signals that the Urgent Pointer field is significant: part of this ' +
      'segment’s data is "urgent" and should be expedited to the receiving ' +
      'application ahead of the normal stream.',
    details:
      'Historically used by protocols like Telnet to interrupt a remote ' +
      'process (e.g. Ctrl-C). Rarely used today — modern applications use ' +
      'out-of-band channels instead, and RFC 6093 discourages new use.',
  },
  ACK: {
    name: 'ACK — Acknowledgment',
    size: '1 bit',
    definition:
      'Indicates that the Acknowledgment Number field is valid — this ' +
      'segment confirms receipt of data from the peer.',
    details:
      'Set on every segment after the very first SYN of a connection. Its ' +
      'ubiquity is the heart of TCP reliability: unacknowledged data is ' +
      'retransmitted after a timeout or duplicate-ACK signal.',
  },
  PSH: {
    name: 'PSH — Push',
    size: '1 bit',
    definition:
      'Asks the receiving TCP stack to deliver buffered data to the ' +
      'application immediately rather than waiting to accumulate a full ' +
      'buffer.',
    details:
      'Typically set on the last segment of an application write — e.g. the ' +
      'end of an HTTP request — so interactive protocols aren’t delayed. ' +
      'It is a hint: receivers may honor it loosely.',
  },
  RST: {
    name: 'RST — Reset',
    size: '1 bit',
    definition:
      'Aborts the connection immediately. Tells the peer "something is ' +
      'wrong — tear this down now," with no graceful goodbye.',
    details:
      'Sent when a segment arrives for a port with no listener (this is the ' +
      '"connection refused" error), when a half-open connection is ' +
      'detected, or when a stack wants to kill a broken conversation. ' +
      'Unlike FIN, a reset is not acknowledged.',
  },
  SYN: {
    name: 'SYN — Synchronize',
    size: '1 bit',
    definition:
      'Requests a connection and synchronizes sequence numbers. It appears ' +
      'only in the first segment from each side — the opening two steps of ' +
      'the three-way handshake.',
    details:
      'A SYN consumes one sequence number, so the first data byte is ' +
      'ISN + 1. SYN segments carry no payload but do carry options such as ' +
      'MSS, Window Scale, and SACK-Permitted, which negotiate the ' +
      'connection’s capabilities.',
  },
  FIN: {
    name: 'FIN — Finish',
    size: '1 bit',
    definition:
      'Announces that the sender has no more data to send, beginning a ' +
      'graceful close of its half of the connection.',
    details:
      'Because TCP is full-duplex, each direction closes independently: ' +
      'each side sends a FIN and receives an ACK for it (four steps, often ' +
      'compressed to three). Like SYN, a FIN consumes one sequence number.',
  },
  window: {
    name: 'Window Size',
    size: '16 bits · bytes 14–15',
    definition:
      'Flow control: the number of bytes, beyond the acknowledged byte, ' +
      'that the sender of this segment is currently willing to receive. It ' +
      'advertises free space in the receiver’s buffer.',
    details:
      'A window of 0 tells the peer to stop sending entirely. Sixteen bits ' +
      'caps the window at 65,535 bytes — far too small for fast networks — ' +
      'so the Window Scale option (RFC 7323) multiplies it by up to 2¹⁴, ' +
      'allowing windows up to 1 GiB.',
  },
  checksum: {
    name: 'Checksum',
    size: '16 bits · bytes 16–17',
    definition:
      'Error detection over the entire segment: header plus payload, plus a ' +
      '"pseudo-header" of IP fields (source address, destination address, ' +
      'protocol, and TCP length).',
    details:
      'Computed as the one’s-complement of the one’s-complement sum of all ' +
      '16-bit words. Including the pseudo-header catches misdelivered ' +
      'packets, not just corrupted ones. Segments failing verification are ' +
      'silently dropped and later retransmitted. Mandatory in TCP (unlike ' +
      'UDP over IPv4). Modern NICs usually compute it in hardware ' +
      '("checksum offload").',
  },
  urgentPtr: {
    name: 'Urgent Pointer',
    size: '16 bits · bytes 18–19',
    definition:
      'An offset from the sequence number that marks where the urgent data ' +
      'ends. Only interpreted when the URG flag is set.',
    details:
      'Everything from the start of the segment up to this point is treated ' +
      'as urgent, to be rushed to the application. Ignored (and normally ' +
      'zero) when URG is clear — which, in modern traffic, is almost ' +
      'always.',
  },
  options: {
    name: 'Options',
    size: '0–40 bytes · from byte 20',
    definition:
      'Optional, variable-length extensions that negotiate and tune the ' +
      'connection. Their presence is what the Data Offset field accounts ' +
      'for; they are padded to a 32-bit boundary.',
    details:
      'Common options: MSS (maximum segment size, exchanged in SYNs), ' +
      'Window Scale (bigger windows), SACK-Permitted / SACK (acknowledge ' +
      'non-contiguous blocks so one loss doesn’t force resending ' +
      'everything), and Timestamps (better RTT measurement and protection ' +
      'against wrapped sequence numbers).',
  },
  payload: {
    name: 'Payload — Application Data',
    size: 'Variable · after the header',
    definition:
      'The actual bytes the application handed to TCP: an HTTP request, a ' +
      'TLS record, an SSH keystroke. TCP treats it as an opaque byte stream ' +
      '— it neither knows nor cares about message boundaries.',
    details:
      'Its size is bounded by the negotiated MSS (commonly 1460 bytes on ' +
      'Ethernet: 1500 MTU − 20 IP − 20 TCP). Segments may carry no payload ' +
      'at all — pure ACKs and handshake segments are header-only. The ' +
      'stream abstraction means one application write may span several ' +
      'segments, or several writes may share one.',
  },
}

// ---------------------------------------------------------------------------
// Interactive scenarios: which flags light up during a connection's life
// ---------------------------------------------------------------------------
export const SCENARIOS = [
  {
    id: 'syn',
    label: '1 · Handshake: SYN',
    flags: ['SYN'],
    title: 'Three-way handshake — step 1: SYN',
    description:
      'The client opens the connection: it sends a segment with SYN set and ' +
      'a random Initial Sequence Number (say seq = x). No payload, but ' +
      'options like MSS and Window Scale ride along to negotiate ' +
      'capabilities.',
  },
  {
    id: 'synack',
    label: '2 · Handshake: SYN-ACK',
    flags: ['SYN', 'ACK'],
    title: 'Three-way handshake — step 2: SYN-ACK',
    description:
      'The server answers with both SYN and ACK set: it synchronizes its ' +
      'own sequence number (seq = y) and acknowledges the client’s ' +
      '(ack = x + 1). Both directions of the stream are now being set up in ' +
      'one segment.',
  },
  {
    id: 'ack',
    label: '3 · Handshake: ACK',
    flags: ['ACK'],
    title: 'Three-way handshake — step 3: ACK',
    description:
      'The client acknowledges the server’s sequence number (ack = y + 1). ' +
      'The connection is now ESTABLISHED on both ends and data can flow in ' +
      'either direction.',
  },
  {
    id: 'data',
    label: '4 · Data transfer: PSH-ACK',
    flags: ['PSH', 'ACK'],
    title: 'Data transfer — PSH + ACK',
    description:
      'A typical data segment: ACK is set (as on every post-handshake ' +
      'segment) and PSH asks the receiver to hand the data straight to the ' +
      'application — e.g. the final segment of an HTTP request.',
  },
  {
    id: 'fin',
    label: '5 · Graceful close: FIN-ACK',
    flags: ['FIN', 'ACK'],
    title: 'Connection teardown — FIN + ACK',
    description:
      'One side finishes sending and transmits FIN (with ACK). The peer ' +
      'ACKs it, then later sends its own FIN, which is ACKed in turn — each ' +
      'half of the full-duplex connection closes independently.',
  },
  {
    id: 'rst',
    label: '✕ · Abort: RST',
    flags: ['RST'],
    title: 'Connection reset — RST',
    description:
      'Something went wrong: the port has no listener, or the stack wants ' +
      'the conversation gone. RST tears the connection down instantly with ' +
      'no handshake and no acknowledgment — this is what "connection ' +
      'refused" looks like on the wire.',
  },
]
