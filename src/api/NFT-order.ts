import axios from "axios";
import { PublicKey } from "@solana/web3.js";
// import { NftOrder } from "../models/Nft";

const getListingsNftOrder = async (nftId: any) => {
  const response = await axios.get(
    "/nft-order/listings?limit=100&nftId=" + nftId
  );
  const data: any = await response;

  return data;
};

export const getNftOrder = async (nftId: string, orderId: string) => {
  if (!orderId) return null;
  return await axios.get(`/nft-order/${nftId}/${orderId}`);
};
export const getTokenBalance = async (
  walletAddress: any,
  tokenMintAddressArray: any
) => {
  const data = tokenMintAddressArray.map((token: any, index: any) => {
    return {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [
        walletAddress,
        {
          mint: token.mintAddress,
        },
        {
          encoding: "jsonParsed",
        },
      ],
    };
  });

  //4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R
  const response = await axios({
    url: `https://api.mainnet-beta.solana.com`,
    method: "post",
    headers: { "Content-Type": "application/json" },
    data: {
      jsonrpc: "2.0",
      id: 1,
      method: "getParsedTokenAccountsByOwner",
      params: [
        walletAddress,
        // {
        //   mint: "E5ndSkaB17Dm7CsD22dvcjfrYSDLCxFcMd6z8ddCk5wp",
        // },
        // {
        //   encoding: "jsonParsed",
        // },
        {
          programId: new PublicKey(
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
        },
        "confirmed",
      ],
    },
  });
  //E5ndSkaB17Dm7CsD22dvcjfrYSDLCxFcMd6z8ddCk5wp
  console.log(response, "ress");
  // return response;
  const dataresult: any = await response;
  return dataresult;
};

export const getTokensSolana = async () => {
  const response = await axios.get(
    `https://api.raydium.io/cache/solana-token-list`
  );
  // return response.json();
  // const data: any = await response.tokens:any;
  const data: any = await response;
  return data;

  // fetch("https://api.raydium.io/cache/solana-token-list")
  //   .then(async (response) => {
  //     addTokensSolanaFunc((await response.json()).tokens);
  //   })
  //   .catch(() => {
  //     fetch(
  //       "https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json"
  //     )
  //       .then(function (response) {
  //         return response.json();
  //       })
  //       .then(function (myJson) {
  //         addTokensSolanaFunc(myJson.tokens);
  //       });
  //   });
};

export const getNftPageCard = async (
  sortBy?: string,
  cardId?: string,
  cardName?: string,
  currency?: string,
  page?: Number,
  limit?: Number,
  type?: any,
  level?: any,
  manaCost?: any,
  rarity?: any,
  priceFilter?: any
): Promise<any> => {
  const [fromPrice, toPrice] = priceFilter;
  const from = parseFloat(fromPrice) || 0;
  const to = parseFloat(toPrice);
  const price = [from];
  if (!isNaN(to)) {
    price.push(to);
  }

  const params: any = {};
  params.sortBy = sortBy;
  params.cardId = cardId;
  params.cardName = cardName;
  params.currency = currency;
  params.page = page;
  params.limit = limit;
  params.type = type;
  params.level = level && level.map((item: any) => Number(item));
  params.manaCost = manaCost && manaCost.map((item: any) => Number(item));
  params.rarity = rarity;
  params.price = price;
  const response = await axios.post("/nft-order", params);
  const data: any = await response;
  return data;
};

export default getListingsNftOrder;
