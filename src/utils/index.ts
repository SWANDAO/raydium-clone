import Big from "big.js";
import { DateTime, Settings } from "luxon";
import { toFormat, toFormatString } from "./big";
import BigNumber from "bignumber.js";
Settings.defaultLocale = "en";

export const thousandSeprator = (amount: string) => {
  try {
    return toFormatString(Big(amount), 4);
  } catch (err) {
    return "";
  }
};

export const roundingNumber = (
  amount: string,
  currency?: string,
  isAfter = true
) => {
  try {
    const value = toFormat(Big(amount), 4, true);
    if (!currency) return value;
    return isAfter ? `${value}${currency}` : `${currency}${value}`;
  } catch (err) {
    return "";
  }
};

export const showTime = (time: Date | number) => {
  let datetime;
  if (time instanceof Date) {
    datetime = DateTime.fromJSDate(time);
  } else {
    datetime = DateTime.fromSeconds(time);
  }
  return datetime?.toRelative();
};

export const formatTime = (time: Date | number) => {
  let datetime;
  if (time instanceof Date) {
    datetime = DateTime.fromJSDate(time);
  } else {
    datetime = DateTime.fromSeconds(time);
  }
  return datetime?.toFormat("MMMM dd yyyy, h:mm a");
};

export const shortAddress = (address: string) => {
  if (!address) return "";
  if (address.length > 14) {
    return address.substr(0, 8) + "..." + address.substr(-6);
  }
  return address;
};
export const shortTxs = (txs: string) => {
  if (!txs) return "";
  if (txs.length > 20) {
    return txs.substr(0, 10) + "..." + txs.substr(-10);
  }
  return txs;
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "");
  } catch (e) {
    return null;
  }
};

export const getRefreshToken = () => {
  const user = getCurrentUser();
  if (user && user.tokens && user.tokens.refresh && user.tokens.refresh.token) {
    return user.tokens.refresh;
  }
  return null;
};

export const getAccessToken = () => {
  const user = getCurrentUser();
  if (user && user.tokens && user.tokens.access && user.tokens.access.token) {
    return user.tokens.access;
  }
  return null;
};

export const setAccount = (account: string, typeWallet: string) => {
  sessionStorage.setItem(
    "account",
    JSON.stringify({
      account,
      typeWallet,
    })
  );
};

export const getAccount = () => {
  try {
    return JSON.parse(sessionStorage.getItem("account") || "");
  } catch (e) {
    return null;
  }
};

export const parseIpfs = (url: string) => {
  if (!url) return "";
  return url
    .replace("ipfs://ipfs/", "https://ipfs.io/ipfs/")
    .replace("ipfs://", "https://ipfs.io/ipfs/");
};

// convert number
export function convertBigNumberToNormal(bigNumber: any, decimals = 18) {
  const result = new BigNumber(bigNumber?._hex).dividedBy(
    new BigNumber(Math.pow(10, decimals))
  );
  return result.toFixed();
}

export function convertBigNumberStringToNormal(bigNumber: any, decimals = 18) {
  const result = new BigNumber(bigNumber).dividedBy(
    new BigNumber(Math.pow(10, decimals))
  );
  return result.toFixed();
}

export function convertNormalToBigNumber(
  number: number,
  decimals = 18,
  fix = 0
) {
  return new BigNumber(number)
    .multipliedBy(new BigNumber(Math.pow(10, decimals)))
    .minus(fix)
    .toFixed(0);
}

export function compareBigNumber(target: string, other: string) {
  try {
    return new Big(target).cmp(new Big(other));
  } catch {
    return false;
  }
}

export function convertArrayURI(uri: string, arrayId: any[]) {
  const x = uri.split("");
  let a = "";
  const length = x.length;
  for (let i = length - 1; i >= 0; i--) {
    if (x[i] === "/") {
      a = x.splice(0, i).join("");
      break;
    }
  }
  return arrayId.map((item) => `${a}/${item}.json`);
}

export function calcTokenToUsd(
  amount: any,
  quanity: any,
  serviceFee: any,
  typeAmount: any,
  tokenPriceType: any
) {
  const { priceBnb, priceBusd, priceEth } = tokenPriceType;
  const quanityMock = quanity || 1;
  let priceType = priceBnb;
  if (typeAmount === "BNB") {
    priceType = priceBnb;
  } else if (typeAmount === "BUSD") {
    priceType = priceBusd;
  } else if (typeAmount === "ETH") {
    priceType = priceEth;
  }
  const price = amount ? amount * (quanityMock || 1) * priceType : 0;
  return serviceFee !== 0
    ? (price - (price * serviceFee) / 100).toFixed(4)
    : price.toFixed(4);
}
export async function delay(ms: number) {
  // return await for better async stack trace support in case of errors.
  return await new Promise((resolve) => setTimeout(resolve, ms));
}
