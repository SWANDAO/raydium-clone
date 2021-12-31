import { PublicKey } from "@solana/web3.js";

import { WalletAdapter } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolongWalletAdapter } from "@solana/wallet-adapter-solong";
import { MathWalletWalletAdapter } from "@solana/wallet-adapter-mathwallet";
import { SolletWalletAdapter } from "@solana/wallet-adapter-sollet";
import {
  LedgerWalletAdapter,
  getDerivationPath,
} from "@solana/wallet-adapter-ledger";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { Coin98WalletAdapter } from "@solana/wallet-adapter-coin98";
import { SlopeWalletAdapter } from "@solana/wallet-adapter-slope";
import { SafePalWalletAdapter } from "@solana/wallet-adapter-safepal";
import { BloctoWalletAdapter } from "@solana/wallet-adapter-blocto";
import { BitpieWalletAdapter } from "@solana/wallet-adapter-bitpie";

interface WalletInfo {
  // official website
  website: string;
  // provider url for web wallet
  providerUrl?: string;
  // chrome extension install url
  chromeUrl?: string;
  // firefox extension install url
  firefoxUrl?: string;
  name: string;

  // isExtension: boolean
  getAdapter: (providerUrl?: string) => WalletAdapter;
}

export const wallets: { [key: string]: WalletInfo } = {
  Phantom: {
    name: "Phantom",
    website: "https://phantom.app",
    chromeUrl:
      "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa",
    getAdapter() {
      return new PhantomWalletAdapter();
    },
  },
  // "Solflare Extension": {
  //   name: "Solflare Extension",
  //   website: "https://solflare.com",
  //   firefoxUrl:
  //     "https://addons.mozilla.org/en-US/firefox/addon/solflare-wallet",
  //   getAdapter() {
  //     return new SolflareWalletAdapter();
  //   },
  // },
  "Sollet Web": {
    name: "Sollet Web",
    website: "https://www.sollet.io",
    providerUrl: "https://www.sollet.io",
    getAdapter(providerUrl) {
      return new SolletWalletAdapter({ provider: providerUrl });
    },
  },
  "Sollet Extension": {
    name: "Sollet Extension",
    website: "https://www.sollet.io",
    chromeUrl:
      "https://chrome.google.com/webstore/detail/sollet/fhmfendgdocmcbmfikdcogofphimnkno",
    getAdapter() {
      return new SolletWalletAdapter({ provider: (window as any).sollet });
    },
  },
  Ledger: {
    name: "Ledger",
    website: "https://www.ledger.com",
    getAdapter() {
      return new LedgerWalletAdapter({ derivationPath: getDerivationPath() });
    },
  },
  MathWallet: {
    name: "MathWallet",
    website: "https://mathwallet.org",
    chromeUrl:
      "https://chrome.google.com/webstore/detail/math-wallet/afbcbjpbpfadlkmhmclhkeeodmamcflc",
    getAdapter() {
      return new MathWalletWalletAdapter();
    },
  },
  Solong: {
    name: "Solong",
    website: "https://solongwallet.com",
    chromeUrl:
      "https://chrome.google.com/webstore/detail/solong/memijejgibaodndkimcclfapfladdchj",
    getAdapter() {
      return new SolongWalletAdapter();
    },
  },
  Coin98: {
    name: "Coin98",
    website: "https://www.coin98.com",
    chromeUrl:
      "https://chrome.google.com/webstore/detail/coin98-wallet/aeachknmefphepccionboohckonoeemg",
    getAdapter() {
      return new Coin98WalletAdapter();
    },
  },
  Blocto: {
    name: "Blocto",
    website: "https://blocto.portto.io",
    getAdapter() {
      return new BloctoWalletAdapter();
    },
  },
  Safepal: {
    name: "Safepal",
    website: "https://safepal.io",
    getAdapter() {
      return new SafePalWalletAdapter();
    },
  },
  Slope: {
    name: "Slope",
    website: "https://slope.finance",
    chromeUrl:
      "https://chrome.google.com/webstore/detail/slope-finance-wallet/pocmplpaccanhmnllbbkpgfliimjljgo",
    getAdapter() {
      return new SlopeWalletAdapter();
    },
  },
  Bitpie: {
    name: "Bitpie",
    website: "https://bitpie.com",
    getAdapter() {
      return new BitpieWalletAdapter();
    },
  },
  "Solflare Web": {
    name: "Solflare Web",
    website: "https://solflare.com",
    providerUrl: "https://solflare.com/access-wallet",
    getAdapter(providerUrl) {
      return new SolletWalletAdapter({ provider: providerUrl });
    },
  },
};

export const SYSTEM_PROGRAM_ID = new PublicKey(
  "11111111111111111111111111111111"
);
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
export const MEMO_PROGRAM_ID = new PublicKey(
  "Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo"
);
export const RENT_PROGRAM_ID = new PublicKey(
  "SysvarRent111111111111111111111111111111111"
);
export const CLOCK_PROGRAM_ID = new PublicKey(
  "SysvarC1ock11111111111111111111111111111111"
);
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

export const SERUM_PROGRAM_ID_V2 =
  "EUqojwWA2rd19FZrzeBncJsm38Jm1hEhE3zsmX3bRc2o";
export const SERUM_PROGRAM_ID_V3 =
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin";

export const LIQUIDITY_POOL_PROGRAM_ID_V2 =
  "RVKd61ztZW9GUwhRbbLoYVRE5Xf1B2tVscKqwZqXgEr";
export const LIQUIDITY_POOL_PROGRAM_ID_V3 =
  "27haf8L6oxUeXrHrgEgsexjSY5hbVUWEmvv9Nyxg8vQv";
export const LIQUIDITY_POOL_PROGRAM_ID_V4 =
  "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";

export const STABLE_POOL_PROGRAM_ID =
  "5quBtoiQqxF9Jv6KYKctB59NT3gtJD2Y65kdnB1Uev3h";

export const ROUTE_SWAP_PROGRAM_ID =
  "93BgeoLHo5AdNbpqy9bD12dtfxtA5M2fh3rj72bE35Y3";

export const STAKE_PROGRAM_ID = "EhhTKczWMGQt46ynNeRX1WfeagwwJd7ufHvCDjRxjo5Q";
export const STAKE_PROGRAM_ID_V4 =
  "CBuCnLe26faBpcBP2fktp4rp8abpcAnTWft6ZrP5Q4T";
export const STAKE_PROGRAM_ID_V5 =
  "9KEPoZmtHUrBbhWN1v1KWLMkkvwY6WLtAVUCPRtRjP4z";

export const IDO_PROGRAM_ID = "6FJon3QE27qgPVggARueB22hLvoh22VzJpXv4rBEoSLF";
export const IDO_PROGRAM_ID_V2 = "CC12se5To1CdEuw7fDS27B7Geo5jJyL7t5UK2B44NgiH";
export const IDO_PROGRAM_ID_V3 = "9HzJyW1qZsEiSfMUf6L2jo3CcTKAyBmSyKdwQeYisHrC";

export const AUTHORITY_AMM = "amm authority";
export const AMM_ASSOCIATED_SEED = "amm_associated_seed";
export const TARGET_ASSOCIATED_SEED = "target_associated_seed";
export const WITHDRAW_ASSOCIATED_SEED = "withdraw_associated_seed";
export const OPEN_ORDER_ASSOCIATED_SEED = "open_order_associated_seed";
export const COIN_VAULT_ASSOCIATED_SEED = "coin_vault_associated_seed";
export const PC_VAULT_ASSOCIATED_SEED = "pc_vault_associated_seed";
export const LP_MINT_ASSOCIATED_SEED = "lp_mint_associated_seed";
export const TEMP_LP_TOKEN_ASSOCIATED_SEED = "temp_lp_token_associated_seed";
