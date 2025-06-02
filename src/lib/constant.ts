enum REDUCER_ACTION_TYPE {
    SWAP,
    SELL_AMOUNT,
    BUY_AMOUNT,
    SELL_TOKEN,
    BUY_TOKEN,
    SWAP_TX,
    UPDATE_BUY_BALANCE,
    UPDATE_SELL_BALANCE,
    SELECT_DEX_ROUTE,
    SWAP_QUOTE,
  }
  
  const SOLANA_CONTRACT_ADDRESS = "So11111111111111111111111111111111111111112";
  const SOLANA_IMAGE =
    "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628";
  
  export { REDUCER_ACTION_TYPE, SOLANA_CONTRACT_ADDRESS, SOLANA_IMAGE };
  export const NATIVE_ETH_TOKEN = {
    address: SOLANA_CONTRACT_ADDRESS,
    logoURI: SOLANA_IMAGE,
    name: "Ethereum",
    symbol: "ETH",
    tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  };
  
  export const DYNAMIC_POINT_LIST = [
    {
      tokens: [
        "So11111111111111111111111111111111111111112",
        "GU7NS9xCwgNPiAdJ69iusFrRfawjDDPjeMBovhV1d4kn",
      ],
      feeRate: 0,
    },
  ];
  