import { REDUCER_ACTION_TYPE } from "@/lib/constant";
import { DexIdTypes, QuoteResponse } from "@deserialize/swap-sdk";
//
type Token = {
  ca: string;
  ticker: string;
  name: string;
  image: string;
};

type TokenType = {
  address: string;
  chainId?: number;
  decimals?: number;
  name: string;
  symbol: string;
  logoURI: string;
  tokenProgram: string;
};

type FormInputState = {
  token: TokenType;
  amount: number | string;
  balance: number | string;
};

type FormState = {
  buy: FormInputState;
  sell: FormInputState;
  dex: string;
  swap_quote?: QuoteResponse;
  swap_tx?: string;
};

type FormAction =
  | { type: REDUCER_ACTION_TYPE.SWAP }
  | { type: REDUCER_ACTION_TYPE.SELL_AMOUNT; payload: number | string }
  | { type: REDUCER_ACTION_TYPE.BUY_AMOUNT; payload: number | string }
  | { type: REDUCER_ACTION_TYPE.SELL_TOKEN; payload: TokenType }
  | { type: REDUCER_ACTION_TYPE.BUY_TOKEN; payload: TokenType }
  | { type: REDUCER_ACTION_TYPE.SWAP_TX; payload: string }
  | { type: REDUCER_ACTION_TYPE.SWAP_QUOTE; payload: QuoteResponse }
  | { type: REDUCER_ACTION_TYPE.UPDATE_BUY_BALANCE; payload: string }
  | { type: REDUCER_ACTION_TYPE.UPDATE_SELL_BALANCE; payload: string }
  | { type: REDUCER_ACTION_TYPE.SELECT_DEX_ROUTE; payload: DexIdTypes };

type InputActionButtonType = "clear" | "max" | "50%";

type TokenData = {
  ca: string;
  ticker: string;
  name: string;
  image: string;
  hasExternalId: boolean;
  isExtraIdSupported: boolean;
  isFiat: boolean;
  featured: boolean;
  isStable: boolean;
  supportsFixedRate: boolean;
  network: string;
  tokenContract: number;
  buy: boolean;
  sell: boolean;
  legacyTicker: string;
};
