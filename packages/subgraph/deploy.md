# Deploy Instructions

Once you have your deploy key from Graph Studio:

## Authenticate
```bash
graph auth --studio YOUR_DEPLOY_KEY_HERE
```

## Deploy
```bash
graph deploy --studio microloan
```

## Update Frontend
After successful deployment, you'll get a Query URL like:
`https://api.studio.thegraph.com/query/YOUR_ID/microloan/VERSION`

Update the frontend environment variable:
```
NEXT_PUBLIC_SUBGRAPH_URL=https://api.studio.thegraph.com/query/YOUR_ID/microloan/VERSION
```

## Test Queries
You can test with queries like:
```graphql
{
  loans(first: 10) {
    id
    loanAmount
    totalFunded
    fundingActive
    borrower {
      name
      address
    }
  }

  globalStats(id: "global") {
    totalLoansCreated
    totalAmountLent
    totalLenders
  }
}
```