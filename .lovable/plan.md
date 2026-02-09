

# BitShares Blockchain Explorer

A clean, minimal blockchain explorer that connects to a live BitShares API node for real-time data lookup.

## Pages & Features

### 1. Home / Search Page
- Prominent search bar in the center with auto-detection of input type (block number, transaction ID, account name, or asset symbol)
- Quick stats overview: latest block number, total accounts, recent activity
- List of the latest blocks with block number, timestamp, and transaction count

### 2. Block Detail Page
- Block number, timestamp, witness, and previous block hash
- List of all transactions within the block
- Navigation to previous/next block

### 3. Transaction Detail Page
- Transaction ID, block number, and timestamp
- List of operations within the transaction (transfers, limit orders, etc.) with readable descriptions
- Links to related accounts and assets

### 4. Account Detail Page
- Account name, ID, and registration date
- Balances (core token + other assets held)
- Recent transaction/operation history

### 5. Asset Detail Page
- Asset symbol, name, issuer, and supply info
- Basic asset properties (precision, max supply)

## Design
- Clean, minimal light theme with clear typography
- Responsive layout that works on desktop and mobile
- Breadcrumb navigation for easy backtracking
- Loading skeletons while data is being fetched

## Technical Approach
- Connect to a public BitShares WebSocket/REST API node (e.g., `wss://api.bitshares.ws`) for live data
- No backend needed — all queries go directly from the browser to the BitShares public node
- Client-side routing with React Router for each detail page

