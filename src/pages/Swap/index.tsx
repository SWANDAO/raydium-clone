import { useEffect, useState } from "react";
import {
  Flex,
  Spacer,
  Box,
  Button,
  InputGroup,
  Input,
  Text,
  useDisclosure,
  Icon,
} from "@chakra-ui/react";

import {
  TOKENS,
  TokenInfo,
  LP_TOKENS,
  NATIVE_SOL,
  TOKENS_TAGS,
  addTokensSolana,
  getTokenBySymbol,
} from "../../constants/tokens";

import * as solanaWeb3 from "@solana/web3.js";

import {
  Market,
  OpenOrders,
  Orderbook,
} from "@project-serum/serum/lib/market.js";

import CoinImage from "./CoinImage";

import { cloneDeep, get } from "lodash-es";

import { useSelector, useDispatch } from "react-redux";
import { TOKEN_PROGRAM_ID } from "../../utils/ids";
import { triggerWalletModal, setTokenBalance } from "../../actions";

import { TokenAmount } from "../../utils/safe-math";
import { startMarkets } from "../../utils/serum";

//component
import TokenListModal from "./TokenListModal";
import FunctionButtons from "./FunctionButtons";

import {
  isOfficalMarket,
  LiquidityPoolInfo,
  LIQUIDITY_POOLS,
  getAddressForWhat,
} from "../../utils/pools";

import {
  getOutAmount,
  getSwapOutAmount,
  place,
  swap,
  checkUnsettledInfo,
  settleFund,
  swapRoute,
  getSwapRouter,
  preSwapRoute,
} from "../../utils/swap";
// import { RouterInfo, RouterInfoItem } from "../../types/api";

// import { OpenOrders } from '@project-serum/serum'
import { _MARKET_STATE_LAYOUT_V2 } from "@project-serum/serum/lib/market";
// eslint-disable-next-line import/named
import { AccountInfo, PublicKey } from "@solana/web3.js";
import {
  LIQUIDITY_POOL_PROGRAM_ID_V4,
  SERUM_PROGRAM_ID_V3,
} from "../../utils/ids";
import { ACCOUNT_LAYOUT, getBigNumber, MINT_LAYOUT } from "../../utils/layouts";
import {
  AMM_INFO_LAYOUT,
  AMM_INFO_LAYOUT_STABLE,
  AMM_INFO_LAYOUT_V3,
  AMM_INFO_LAYOUT_V4,
  getLpMintListDecimals,
} from "../../utils/liquidity";
// import logger from './logger'
// import { getAddressForWhat, LIQUIDITY_POOLS, LiquidityPoolInfo } from '../../utils/pools'
// import { TokenAmount } from '@/utils/safe-math'
// import { LP_TOKENS, NATIVE_SOL, TOKENS } from '../../utils/tokens'
import {
  commitment,
  createAmmAuthority,
  getFilteredProgramAccountsAmmOrMarketCache,
  getMultipleAccounts,
  web3Config,
} from "../../utils/web3";

import { Connection } from "@solana/web3.js";

const RAY = getTokenBySymbol("RAY");

function Swap() {
  let amms = [] as LiquidityPoolInfo[];
  let asksAndBidsLoading = true;
  let outToPirceValue = 0;
  let priceImpact = 0;
  let usedAmmId: any;
  let usedRouteInfo: any;
  let endpoint = "";
  // serum
  const market = {} as {
    [marketAddress: string]: {
      market: Market;
      asks?: {};
      bids?: {};
      unSettleConfig?: {
        baseSymbol: string;
        baseUnsettledAmount: number;
        quoteSymbol: string;
        quoteUnsettledAmount: number;
        unsettledOpenOrders: OpenOrders;
      };
    };
  };
  let routeInfos = [] as [LiquidityPoolInfo, LiquidityPoolInfo][];
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [allTokens, setAllTokens] = useState([] as Array<TokenInfo>);
  const [fromCoin, setFromCoin] = useState(RAY as TokenInfo | null);
  const [toCoin, setToCoin] = useState(null as TokenInfo | null);
  const [selectFromCoin, setSelectFromCoin] = useState(true);
  const [userBalance, setUserBalance] = useState([] as any);
  const [fromCoinBalance, setFromCoinInputBalance] = useState(0 as any);
  const [coinRoute, setCoinRoute] = useState("" as String);
  const [finalImpact, setFinalImpact] = useState(0 as number);
  const [toCoinOutputBalance, setToCoinOutputBalance] = useState(0 as any);
  const [infos, setInfos] = useState(null as any);
  const [markets, setMarkets] = useState(null as any);
  const [compareValue, setCompareValue] = useState(0 as number);
  const [miniReceived, setMiniReceived] = useState(null as any);
  const desc = false;
  const { connector, balance } = useSelector((state: any) => {
    return state;
  });
  const { connectStatus, wallet } = connector;
  const dispatch = useDispatch();

  const triggerWalletModalFn = (status: boolean) => {
    dispatch(triggerWalletModal(status));
  };

  const createTokenList = async (keyword = "", userBalance: any) => {
    keyword = keyword.trim();
    let tokenList = [TOKENS] as Array<TokenInfo>;
    let ray = {};
    let nativeSol = cloneDeep(NATIVE_SOL);
    let hasBalance = [];
    let noBalance = [];

    for (const symbol of Object.keys(TOKENS)) {
      let tokenInfo = cloneDeep(TOKENS[symbol]);

      if (tokenInfo) {
        tokenInfo = { ...tokenInfo, key: symbol };

        if (tokenInfo.symbol === "RAY") {
          ray = cloneDeep({ ...tokenInfo, key: symbol });
        } else {
          hasBalance.push({ ...tokenInfo, key: symbol });
        }
      } else if (tokenInfo.symbol === "RAY") {
        ray = cloneDeep({ ...tokenInfo, key: symbol });
      } else {
        noBalance.push({ ...tokenInfo, key: symbol });
      }
    }

    // no balance sort
    noBalance = noBalance.sort((a, b) => {
      return a.symbol.localeCompare(b.symbol);
    });

    console.log(noBalance, "nobalance");

    if (!desc) {
      tokenList = [...[ray, nativeSol], ...hasBalance, ...noBalance];
    } else {
      tokenList = [...[ray, nativeSol], ...noBalance.reverse(), ...hasBalance];
    }

    if (keyword) {
      tokenList = tokenList.filter(
        (token) =>
          token.symbol.toUpperCase().includes(keyword.toUpperCase()) ||
          token.mintAddress === keyword
      );
    }
    const showTagsList: string[] = [];
    for (const [itemTagsName, itemTagsValue] of Object.entries(TOKENS_TAGS)) {
      if (itemTagsValue.show) {
        showTagsList.push(itemTagsName);
      }
    }

    const showToken = [];
    for (const item of tokenList) {
      const showFlag = item.tags
        ? item.tags.filter((itemTags: string) =>
            showTagsList.includes(itemTags) ? 1 : null
          ).length > 0 || item.mintAddress === keyword
        : false;

      if (showFlag) {
        showToken.push(item);
      }
    }
    tokenList = cloneDeep(showToken);

    tokenList.forEach((v: any) => {
      userBalance.find((x: any) => {
        console.log(v, "v");
        if (v.mintAddress === x.account.data.parsed.info.mint) {
          tokenList.push(
            Object.assign(v, {
              uiAmount: x.account.data.parsed.info.tokenAmount.uiAmount,
            })
          );
        }
      });
    });

    setAllTokens(tokenList);
  };

  let fromCoinAmount = fromCoinBalance;
  let toCoinAmount = "";

  const changeCoinAmountPosition = () => {
    const tempFromCoinAmount = fromCoinAmount;
    const tempToCoinAmount = toCoinAmount;
    fromCoinAmount = tempToCoinAmount;
    toCoinAmount = tempFromCoinAmount;
  };

  const onCoinSelect = (tokenInfo: TokenInfo) => {
    console.log(tokenInfo, "tokenInfo");
    onClose();

    if (tokenInfo !== null) {
      if (selectFromCoin) {
        setFromCoin(cloneDeep(tokenInfo));
        // fromCoin = cloneDeep(tokenInfo);
        if (toCoin?.mintAddress === tokenInfo.mintAddress) {
          // toCoin = null;
          setToCoin(null);
          changeCoinAmountPosition();
        }
      } else {
        setToCoin(cloneDeep(tokenInfo));
        if (fromCoin?.mintAddress === tokenInfo.mintAddress) {
          setFromCoin(null);
          changeCoinAmountPosition();
        }
      }
    } else {
      if (fromCoin !== null) {
        const newFromCoin = Object.values(TOKENS).find(
          (item) => item.mintAddress === fromCoin?.mintAddress
        );
        if (newFromCoin === null || newFromCoin === undefined) {
          setFromCoin(null);
        }
      }
      if (toCoin !== null) {
        const newToCoin = Object.values(TOKENS).find(
          (item) => item.mintAddress === toCoin?.mintAddress
        );
        if (newToCoin === null || newToCoin === undefined) {
          setToCoin(null);
        }
      }
    }
  };

  const getTokenDetail = (balanceNum: number) => {
    dispatch(setTokenBalance(balanceNum));
    // dispatch(setTokenBalance(balance));
  };

  const openFromCoinSelect = () => {
    setSelectFromCoin(true);
    onOpen();
  };

  const openToCoinSelect = () => {
    setSelectFromCoin(false);
    onOpen();
  };

  const getSwapOutAmount = (
    poolInfo: any,
    fromCoinMint: string,
    toCoinMint: string,
    amount: string,
    slippage: number
  ) => {
    console.log(amount, "amount");
    const { coin, pc, fees } = poolInfo;
    const { swapFeeNumerator, swapFeeDenominator } = fees;

    if (fromCoinMint === TOKENS.WSOL.mintAddress)
      fromCoinMint = NATIVE_SOL.mintAddress;
    if (toCoinMint === TOKENS.WSOL.mintAddress)
      toCoinMint = NATIVE_SOL.mintAddress;

    if (fromCoinMint === coin.mintAddress && toCoinMint === pc.mintAddress) {
      // coin2pc
      const fromAmount = new TokenAmount(amount, coin.decimals, false);
      const fromAmountWithFee = fromAmount.wei
        .multipliedBy(swapFeeDenominator - swapFeeNumerator)
        .dividedBy(swapFeeDenominator);

      const denominator = coin.balance.wei.plus(fromAmountWithFee);
      const amountOut = pc.balance.wei
        .multipliedBy(fromAmountWithFee)
        .dividedBy(denominator);
      const amountOutWithSlippage = amountOut.dividedBy(1 + slippage / 100);

      const outBalance = pc.balance.wei.minus(amountOut);
      const beforePrice = new TokenAmount(
        parseFloat(new TokenAmount(pc.balance.wei, pc.decimals).fixed()) /
          parseFloat(new TokenAmount(coin.balance.wei, coin.decimals).fixed()),
        pc.decimals,
        false
      );
      const afterPrice = new TokenAmount(
        parseFloat(new TokenAmount(outBalance, pc.decimals).fixed()) /
          parseFloat(new TokenAmount(denominator, coin.decimals).fixed()),
        pc.decimals,
        false
      );
      const priceImpact =
        Math.abs(
          (parseFloat(beforePrice.fixed()) - parseFloat(afterPrice.fixed())) /
            parseFloat(beforePrice.fixed())
        ) * 100;

      return {
        amountIn: fromAmount,
        amountOut: new TokenAmount(amountOut, pc.decimals),
        amountOutWithSlippage: new TokenAmount(
          amountOutWithSlippage,
          pc.decimals
        ),
        priceImpact,
      };
    } else {
      // pc2coin
      const fromAmount = new TokenAmount(amount, pc.decimals, false);
      const fromAmountWithFee = fromAmount.wei
        .multipliedBy(swapFeeDenominator - swapFeeNumerator)
        .dividedBy(swapFeeDenominator);

      const denominator = pc.balance.wei.plus(fromAmountWithFee);
      const amountOut = coin.balance.wei
        .multipliedBy(fromAmountWithFee)
        .dividedBy(denominator);
      const amountOutWithSlippage = amountOut.dividedBy(1 + slippage / 100);

      const outBalance = coin.balance.wei.minus(amountOut);

      const beforePrice = new TokenAmount(
        parseFloat(new TokenAmount(pc.balance.wei, pc.decimals).fixed()) /
          parseFloat(new TokenAmount(coin.balance.wei, coin.decimals).fixed()),
        pc.decimals,
        false
      );
      const afterPrice = new TokenAmount(
        parseFloat(new TokenAmount(denominator, pc.decimals).fixed()) /
          parseFloat(new TokenAmount(outBalance, coin.decimals).fixed()),
        pc.decimals,
        false
      );
      const priceImpact =
        Math.abs(
          (parseFloat(afterPrice.fixed()) - parseFloat(beforePrice.fixed())) /
            parseFloat(beforePrice.fixed())
        ) * 100;

      return {
        amountIn: fromAmount,
        amountOut: new TokenAmount(amountOut, coin.decimals),
        amountOutWithSlippage: new TokenAmount(
          amountOutWithSlippage,
          coin.decimals
        ),
        priceImpact,
      };
    }
  };

  const createWeb3Instance = (endpoint: string) => {
    const web3 = new Connection(
      "https://rpc-mainnet-fork.dappio.xyz",
      commitment
    );
    return web3;
  };

  const findMarket = () => {
    if (fromCoin && toCoin) {
      amms = (Object.values(infos) as LiquidityPoolInfo[]).filter(
        (p: any) =>
          p.version === 4 &&
          [1, 5].includes(p.status) &&
          ((p.coin.mintAddress === fromCoin?.mintAddress &&
            p.pc.mintAddress === toCoin?.mintAddress) ||
            (p.coin.mintAddress === toCoin?.mintAddress &&
              p.pc.mintAddress === fromCoin?.mintAddress))
      );

      console.log(amms, "infos");

      routeInfos = getSwapRouter(
        Object.values(infos),
        fromCoin.mintAddress,
        toCoin.mintAddress
      );

      const marketAddress: string[] = [];

      // serum
      for (const address of Object.keys(markets)) {
        if (isOfficalMarket(address)) {
          const info = cloneDeep(markets[address]);
          let fromMint = fromCoin.mintAddress;
          let toMint = toCoin.mintAddress;
          if (fromMint === NATIVE_SOL.mintAddress) {
            fromMint = TOKENS.WSOL.mintAddress;
          }
          if (toMint === NATIVE_SOL.mintAddress) {
            toMint = TOKENS.WSOL.mintAddress;
          }
          if (
            (info.baseMint.toBase58() === fromMint &&
              info.quoteMint.toBase58() === toMint) ||
            (info.baseMint.toBase58() === toMint &&
              info.quoteMint.toBase58() === fromMint)
          ) {
            marketAddress.push(address);
          }
        }
      }

      for (const itemLiquidityInfo of LIQUIDITY_POOLS) {
        let fromMint = fromCoin.mintAddress;
        let toMint = toCoin.mintAddress;
        if (fromMint === NATIVE_SOL.mintAddress) {
          fromMint = TOKENS.WSOL.mintAddress;
        }
        if (toMint === NATIVE_SOL.mintAddress) {
          toMint = TOKENS.WSOL.mintAddress;
        }
        if (
          (itemLiquidityInfo.coin.mintAddress === fromMint &&
            itemLiquidityInfo.pc.mintAddress === toMint) ||
          (itemLiquidityInfo.coin.mintAddress === toMint &&
            itemLiquidityInfo.pc.mintAddress === fromMint)
        ) {
          if (
            !marketAddress.find(
              (item) => item === itemLiquidityInfo.serumMarket
            )
          ) {
            marketAddress.push(itemLiquidityInfo.serumMarket);
          }
        }
      }

      // initialized = true;
      // updateUrl();

      for (const itemOldMarket of Object.keys(market)) {
        if (!marketAddress.includes(itemOldMarket)) {
          delete market[itemOldMarket];
        }
      }

      const web3 = createWeb3Instance("https://rpc-mainnet-fork.dappio.xyz");

      Promise.all(
        marketAddress
          .filter((itemMarket) => !Object.keys(market).includes(itemMarket))
          .map((itemMarketAddress) =>
            Market.load(
              web3,
              new PublicKey(itemMarketAddress),
              {},
              new PublicKey(SERUM_PROGRAM_ID_V3)
            )
          )
      ).then((marketList) => {
        marketList.forEach((itemMarket) => {
          market[itemMarket.address.toString()] = { market: itemMarket };
        });
        // getOrderBooks();
      });
    }
    // else {
    //   market = {};
    // }
  };

  const requestInfos = async () => {
    // commit('setLoading', true)
    const web3 = createWeb3Instance("https://rpc-mainnet-fork.dappio.xyz");
    const conn = web3;

    let ammAll: {
      publicKey: PublicKey;
      accountInfo: AccountInfo<Buffer>;
    }[] = [];
    let marketAll: {
      publicKey: PublicKey;
      accountInfo: AccountInfo<Buffer>;
    }[] = [];

    await Promise.all([
      await (async () => {
        ammAll = await getFilteredProgramAccountsAmmOrMarketCache(
          "amm",
          conn,
          new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
          [
            {
              dataSize: AMM_INFO_LAYOUT_V4.span,
            },
          ]
        );
      })(),
      await (async () => {
        marketAll = await getFilteredProgramAccountsAmmOrMarketCache(
          "market",
          conn,
          new PublicKey(SERUM_PROGRAM_ID_V3),
          [
            {
              dataSize: _MARKET_STATE_LAYOUT_V2.span,
            },
          ]
        );
      })(),
    ]);

    const marketToLayout: { [name: string]: any } = {};
    marketAll.forEach((item) => {
      marketToLayout[item.publicKey.toString()] =
        _MARKET_STATE_LAYOUT_V2.decode(item.accountInfo.data);
    });

    const lpMintAddressList: string[] = [];
    ammAll.forEach((item) => {
      const ammLayout = AMM_INFO_LAYOUT_V4.decode(
        Buffer.from(item.accountInfo.data)
      );
      if (
        ammLayout.pcMintAddress.toString() ===
          ammLayout.serumMarket.toString() ||
        ammLayout.lpMintAddress.toString() ===
          "11111111111111111111111111111111"
      ) {
        return;
      }
      lpMintAddressList.push(ammLayout.lpMintAddress.toString());
    });
    const lpMintListDecimls = await getLpMintListDecimals(
      conn,
      lpMintAddressList
    );

    for (
      let indexAmmInfo = 0;
      indexAmmInfo < ammAll.length;
      indexAmmInfo += 1
    ) {
      const ammInfo = AMM_INFO_LAYOUT_V4.decode(
        Buffer.from(ammAll[indexAmmInfo].accountInfo.data)
      );
      if (
        !Object.keys(lpMintListDecimls).includes(
          ammInfo.lpMintAddress.toString()
        ) ||
        ammInfo.pcMintAddress.toString() === ammInfo.serumMarket.toString() ||
        ammInfo.lpMintAddress.toString() ===
          "11111111111111111111111111111111" ||
        !Object.keys(marketToLayout).includes(ammInfo.serumMarket.toString())
      ) {
        continue;
      }
      const fromCoin =
        ammInfo.coinMintAddress.toString() === TOKENS.WSOL.mintAddress
          ? NATIVE_SOL.mintAddress
          : ammInfo.coinMintAddress.toString();
      const toCoin =
        ammInfo.pcMintAddress.toString() === TOKENS.WSOL.mintAddress
          ? NATIVE_SOL.mintAddress
          : ammInfo.pcMintAddress.toString();
      let coin = Object.values(TOKENS).find(
        (item) => item.mintAddress === fromCoin
      );
      if (!coin && fromCoin !== NATIVE_SOL.mintAddress) {
        TOKENS[`unknow-${ammInfo.coinMintAddress.toString()}`] = {
          symbol: "unknown",
          name: "unknown",
          mintAddress: ammInfo.coinMintAddress.toString(),
          decimals: getBigNumber(ammInfo.coinDecimals),
          cache: true,
          tags: [],
        };
        coin = TOKENS[`unknow-${ammInfo.coinMintAddress.toString()}`];
      } else if (fromCoin === NATIVE_SOL.mintAddress) {
        coin = NATIVE_SOL;
      }
      if (!coin.tags.includes("unofficial")) {
        coin.tags.push("unofficial");
      }

      let pc = Object.values(TOKENS).find(
        (item) => item.mintAddress === toCoin
      );
      if (!pc && toCoin !== NATIVE_SOL.mintAddress) {
        TOKENS[`unknow-${ammInfo.pcMintAddress.toString()}`] = {
          symbol: "unknown",
          name: "unknown",
          mintAddress: ammInfo.pcMintAddress.toString(),
          decimals: getBigNumber(ammInfo.pcDecimals),
          cache: true,
          tags: [],
        };
        pc = TOKENS[`unknow-${ammInfo.pcMintAddress.toString()}`];
      } else if (toCoin === NATIVE_SOL.mintAddress) {
        pc = NATIVE_SOL;
      }
      if (!pc.tags.includes("unofficial")) {
        pc.tags.push("unofficial");
      }

      if (coin.mintAddress === TOKENS.WSOL.mintAddress) {
        coin.symbol = "SOL";
        coin.name = "SOL";
        coin.mintAddress = "11111111111111111111111111111111";
      }
      if (pc.mintAddress === TOKENS.WSOL.mintAddress) {
        pc.symbol = "SOL";
        pc.name = "SOL";
        pc.mintAddress = "11111111111111111111111111111111";
      }
      const lp = Object.values(LP_TOKENS).find(
        (item) => item.mintAddress === ammInfo.lpMintAddress
      ) ?? {
        symbol: `${coin.symbol}-${pc.symbol}`,
        name: `${coin.symbol}-${pc.symbol}`,
        coin,
        pc,
        mintAddress: ammInfo.lpMintAddress.toString(),
        decimals: lpMintListDecimls[ammInfo.lpMintAddress],
      };

      const { publicKey } = await createAmmAuthority(
        new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4)
      );

      const market = marketToLayout[ammInfo.serumMarket];

      const serumVaultSigner = await PublicKey.createProgramAddress(
        [
          ammInfo.serumMarket.toBuffer(),
          market.vaultSignerNonce.toArrayLike(Buffer, "le", 8),
        ],
        new PublicKey(SERUM_PROGRAM_ID_V3)
      );

      const itemLiquidity: LiquidityPoolInfo = {
        name: `${coin.symbol}-${pc.symbol}`,
        coin,
        pc,
        lp,
        version: 4,
        programId: LIQUIDITY_POOL_PROGRAM_ID_V4,
        ammId: ammAll[indexAmmInfo].publicKey.toString(),
        ammAuthority: publicKey.toString(),
        ammOpenOrders: ammInfo.ammOpenOrders.toString(),
        ammTargetOrders: ammInfo.ammTargetOrders.toString(),
        ammQuantities: NATIVE_SOL.mintAddress,
        poolCoinTokenAccount: ammInfo.poolCoinTokenAccount.toString(),
        poolPcTokenAccount: ammInfo.poolPcTokenAccount.toString(),
        poolWithdrawQueue: ammInfo.poolWithdrawQueue.toString(),
        poolTempLpTokenAccount: ammInfo.poolTempLpTokenAccount.toString(),
        serumProgramId: SERUM_PROGRAM_ID_V3,
        serumMarket: ammInfo.serumMarket.toString(),
        serumBids: market.bids.toString(),
        serumAsks: market.asks.toString(),
        serumEventQueue: market.eventQueue.toString(),
        serumCoinVaultAccount: market.baseVault.toString(),
        serumPcVaultAccount: market.quoteVault.toString(),
        serumVaultSigner: serumVaultSigner.toString(),
        official: false,
      };
      if (!LIQUIDITY_POOLS.find((item) => item.ammId === itemLiquidity.ammId)) {
        LIQUIDITY_POOLS.push(itemLiquidity);
      } else {
        for (
          let itemIndex = 0;
          itemIndex < LIQUIDITY_POOLS.length;
          itemIndex += 1
        ) {
          if (
            LIQUIDITY_POOLS[itemIndex].ammId === itemLiquidity.ammId &&
            LIQUIDITY_POOLS[itemIndex].name !== itemLiquidity.name &&
            !LIQUIDITY_POOLS[itemIndex].official
          ) {
            LIQUIDITY_POOLS[itemIndex] = itemLiquidity;
          }
        }
      }
    }

    const liquidityPools = {} as any;
    const publicKeys = [] as any;

    LIQUIDITY_POOLS.forEach((pool) => {
      const {
        poolCoinTokenAccount,
        poolPcTokenAccount,
        ammOpenOrders,
        ammId,
        coin,
        pc,
        lp,
      } = pool;

      publicKeys.push(
        new PublicKey(poolCoinTokenAccount),
        new PublicKey(poolPcTokenAccount),
        new PublicKey(ammOpenOrders),
        new PublicKey(ammId),
        new PublicKey(lp.mintAddress)
      );

      const poolInfo = cloneDeep(pool);

      poolInfo.coin.balance = new TokenAmount(0, coin.decimals);
      poolInfo.pc.balance = new TokenAmount(0, pc.decimals);

      liquidityPools[lp.mintAddress] = poolInfo;
    });

    const multipleInfo = await getMultipleAccounts(
      conn,
      publicKeys,
      commitment
    );

    multipleInfo.forEach((info) => {
      if (info) {
        const address = info.publicKey.toBase58();
        const data = Buffer.from(info.account.data);

        const { key, lpMintAddress, version } = getAddressForWhat(address);

        if (key && lpMintAddress) {
          const poolInfo = liquidityPools[lpMintAddress];

          switch (key) {
            case "poolCoinTokenAccount": {
              const parsed = ACCOUNT_LAYOUT.decode(data);
              // quick fix: Number can only safely store up to 53 bits
              poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.plus(
                getBigNumber(parsed.amount)
              );

              break;
            }
            case "poolPcTokenAccount": {
              const parsed = ACCOUNT_LAYOUT.decode(data);

              poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.plus(
                getBigNumber(parsed.amount)
              );

              break;
            }
            case "ammOpenOrders": {
              const OPEN_ORDERS_LAYOUT = OpenOrders.getLayout(
                new PublicKey(poolInfo.serumProgramId)
              );
              const parsed = OPEN_ORDERS_LAYOUT.decode(data);

              const { baseTokenTotal, quoteTokenTotal } = parsed;
              poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.plus(
                getBigNumber(baseTokenTotal)
              );
              poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.plus(
                getBigNumber(quoteTokenTotal)
              );

              break;
            }
            case "ammId": {
              let parsed;
              if (version === 2) {
                parsed = AMM_INFO_LAYOUT.decode(data);
              } else if (version === 3) {
                parsed = AMM_INFO_LAYOUT_V3.decode(data);
              } else {
                if (version === 5) {
                  parsed = AMM_INFO_LAYOUT_STABLE.decode(data);
                  poolInfo.currentK = getBigNumber(parsed.currentK);
                } else parsed = AMM_INFO_LAYOUT_V4.decode(data);

                const { swapFeeNumerator, swapFeeDenominator } = parsed;
                poolInfo.fees = {
                  swapFeeNumerator: getBigNumber(swapFeeNumerator),
                  swapFeeDenominator: getBigNumber(swapFeeDenominator),
                };
              }

              const { status, needTakePnlCoin, needTakePnlPc } = parsed;
              poolInfo.status = getBigNumber(status);
              poolInfo.coin.balance.wei = poolInfo.coin.balance.wei.minus(
                getBigNumber(needTakePnlCoin)
              );
              poolInfo.pc.balance.wei = poolInfo.pc.balance.wei.minus(
                getBigNumber(needTakePnlPc)
              );

              break;
            }
            // getLpSupply
            case "lpMintAddress": {
              const parsed = MINT_LAYOUT.decode(data);

              poolInfo.lp.totalSupply = new TokenAmount(
                getBigNumber(parsed.supply),
                poolInfo.lp.decimals
              );

              break;
            }
          }
        }
      }
    });

    console.log(liquidityPools, "liquidityPools");

    setInfos(liquidityPools);

    // commit('setInfos', liquidityPools)
    // logger('Liquidity pool infomations updated')

    // commit('setInitialized')
    // commit('setLoading', false)
  };

  const updateAmounts = () => {
    findMarket();
    let toCoinAmount = "";
    let toCoinWithSlippage = null;

    let impact = 0;
    let middleCoinAmount;

    let showMarket;
    let _side = null;
    let _worstPrice = null;

    const setting = { slippage: 0.5 };

    if (fromCoin && toCoin) {
      let maxAmountOut = 0;
      if (amms) {
        for (const poolInfo of amms) {
          if (poolInfo.status !== 1) continue;
          const { amountOut, amountOutWithSlippage, priceImpact } =
            getSwapOutAmount(
              poolInfo,
              fromCoin.mintAddress,
              toCoin.mintAddress,
              fromCoinBalance.toString(),
              0
              // setting.slippage
            );
          // console.log(amountOutWithSlippage, "amountOutWithSlippage");

          // const { amountOut, amountOutWithSlippage, priceImpact } = getSwapOutAmount(
          //   poolInfo,
          //   fromCoin.mintAddress,
          //   toCoin.mintAddress,
          //   fromCoinAmount,
          //   setting.slippage
          // )
          const fAmountOut = parseFloat(amountOut.fixed());
          if (fAmountOut > maxAmountOut) {
            maxAmountOut = fAmountOut;
            toCoinAmount = amountOut.fixed();
            toCoinWithSlippage = amountOutWithSlippage;
            impact = priceImpact;
            // price = fAmountOut
            usedAmmId = poolInfo.ammId;
            endpoint = `${fromCoin.symbol} > ${toCoin.symbol}`;
            showMarket = poolInfo.serumMarket;
          }
          console.log(
            "amm -> ",
            fromCoin.symbol,
            ">",
            toCoin.symbol,
            poolInfo.ammId,
            amountOut.fixed(),
            amountOutWithSlippage.fixed(),
            priceImpact / 100
          );
        }
      }

      const slippage = (Math.sqrt(1 + setting.slippage / 100) - 1) * 100;
      // console.log("slippage", setting.slippage, slippage);

      // console.log(routeInfos, "routeInfos");
      if (routeInfos) {
        for (const r of routeInfos) {
          let middleCoint;
          if (r[0].coin.mintAddress === fromCoin.mintAddress) {
            middleCoint = r[0].pc;
          } else {
            middleCoint = r[0].coin;
          }
          const {
            amountOutWithSlippage: amountOutWithSlippageA,
            priceImpact: priceImpactA,
          } = getSwapOutAmount(
            r[0],
            fromCoin.mintAddress,
            middleCoint.mintAddress,
            fromCoinAmount,
            slippage
          );

          const { amountOut, amountOutWithSlippage, priceImpact } =
            getSwapOutAmount(
              r[1],
              middleCoint.mintAddress,
              toCoin.mintAddress,
              amountOutWithSlippageA.fixed(),
              slippage
            );

          console.log(amountOutWithSlippage, "amountOutWithSlippage");
          const fAmountOut = parseFloat(amountOut.fixed());
          if (fAmountOut > maxAmountOut) {
            toCoinAmount = amountOut.fixed();
            maxAmountOut = fAmountOut;
            toCoinWithSlippage = amountOutWithSlippage;
            impact =
              (((priceImpactA + 100) * (priceImpact + 100)) / 10000 - 1) * 100;
            usedRouteInfo = {
              middle_coin: middleCoint.mintAddress,
              route: [
                {
                  type: "amm",
                  id: r[0].ammId,
                  amountA: 0,
                  amountB: 0,
                  mintA: fromCoin.mintAddress,
                  mintB: middleCoint.mintAddress,
                },
                {
                  type: "amm",
                  id: r[1].ammId,
                  amountA: 0,
                  amountB: 0,
                  mintA: middleCoint.mintAddress,
                  mintB: toCoin.mintAddress,
                },
              ],
            };
            usedAmmId = undefined;
            middleCoinAmount = amountOutWithSlippageA.fixed();
            endpoint = `${fromCoin.symbol} > ${middleCoint.symbol} > ${toCoin.symbol}`;
            showMarket = undefined;
          }
          console.log(
            "route -> ",
            `${fromCoin.symbol} > ${middleCoint.symbol} > ${toCoin.symbol}`,
            amountOut.fixed(),
            amountOutWithSlippage.fixed(),
            priceImpact / 100,
            ((priceImpactA + 100) * (priceImpact + 100)) / 10000
          );

          setCoinRoute(
            `${fromCoin.symbol} > ${middleCoint.symbol} > ${toCoin.symbol}`
          );
        }
      }

      if (
        fromCoin &&
        toCoin &&
        market &&
        fromCoinAmount &&
        !asksAndBidsLoading
      ) {
        for (const [marketAddress, marketConfig] of Object.entries(market)) {
          if (!marketConfig.asks || !marketConfig.bids) continue;

          const {
            amountOut,
            amountOutWithSlippage,
            priceImpact,
            side,
            worstPrice,
          } = getOutAmount(
            marketConfig.market,
            marketConfig.asks,
            marketConfig.bids,
            fromCoin.mintAddress,
            toCoin.mintAddress,
            fromCoinAmount,
            setting.slippage
          );
          const out = new TokenAmount(amountOut, toCoin.decimals, false);
          const outWithSlippage = new TokenAmount(
            amountOutWithSlippage,
            toCoin.decimals,
            false
          );

          _side = side;
          _worstPrice = worstPrice;

          console.log("dex -> ", marketAddress, outWithSlippage.fixed());
          if (!out.isNullOrZero()) {
            if (
              !toCoinWithSlippage ||
              toCoinWithSlippage.wei.isLessThan(outWithSlippage.wei)
            ) {
              toCoinAmount = out.fixed();
              toCoinWithSlippage = outWithSlippage;
              impact = priceImpact;
              endpoint = "Serum DEX";
              showMarket = marketAddress;
            }
          }
        }
      }

      usedAmmId = usedAmmId;
      usedRouteInfo = usedRouteInfo;
      middleCoinAmount = middleCoinAmount;

      if (toCoinWithSlippage) {
        toCoinAmount = toCoinAmount;
        toCoinWithSlippage = toCoinWithSlippage.fixed();
        console.log(toCoinWithSlippage, "toCoinWithSlippage");
        outToPirceValue =
          parseFloat(toCoinAmount) /
          parseFloat(parseFloat(fromCoinAmount).toFixed(toCoin.decimals));

        priceImpact = impact;
        endpoint = endpoint;
      } else {
        toCoinAmount = "";
        toCoinWithSlippage = "";
        outToPirceValue = 0;
        priceImpact = 0;
        endpoint = "";
      }
      console.log(
        "end -> ",
        endpoint,
        usedAmmId,
        usedRouteInfo,
        maxAmountOut,
        toCoinWithSlippage?.fixed(),
        impact,
        "outToPirceValue",
        outToPirceValue
      );

      setFinalImpact(impact);

      setToCoinOutputBalance(maxAmountOut);

      setMiniReceived(toCoinWithSlippage);

      setCompareValue(outToPirceValue);

      // let setupFlag = setupFlag
      // let setupFlagWSOL = setupFlagWSOL
      // if (endpoint !== setupLastData) {
      //   setupLastData = endpoint
      //   setupFlag = false
      //   setupFlagWSOL = false
      // }
      // setupFlag = setupFlag || needCreateTokens() || needWrapSol() > 0

      // setupFlagWSOL = setupFlagWSOL || needWrapSol() > 0

      // showMarket = showMarket
      // this.side = _side
      // this.worstPrice = _worstPrice
    }
  };

  const getMarkets = () => {
    const web3 = createWeb3Instance("https://rpc-mainnet-fork.dappio.xyz");
    const conn = web3;

    const filters = [
      {
        dataSize: _MARKET_STATE_LAYOUT_V2.span,
      },
    ];

    startMarkets();

    getFilteredProgramAccountsAmmOrMarketCache(
      "market",
      conn,
      new PublicKey(SERUM_PROGRAM_ID_V3),
      filters
    )
      .then((marketInfos) => {
        const markets: any = {};

        marketInfos.forEach((marketInfo) => {
          const address = marketInfo.publicKey.toBase58();

          const { data } = marketInfo.accountInfo;
          // console.log(address, _MARKET_STATE_LAYOUT_V2.decode(data))
          markets[address] = _MARKET_STATE_LAYOUT_V2.decode(data);
        });

        setMarkets(markets);

        // commit("setMarkets", markets);
        // logger("Markets updated");
      })
      .catch();
  };

  function getUnixTs() {
    return new Date().getTime();
  }

  const sub = ({
    txid,
    description,
  }: {
    txid: string;
    description: string;
  }) => {
    const walletAddress = wallet?.address;
    commit("pushTx", { txid, description, walletAddress });
    // logger('Sub', txid)

    const conn = this.$web3;
    // const notify = this.$notify;

    const listenerId = conn.onSignature(
      txid,
      function (signatureResult: SignatureResult, context: Context) {
        const { slot } = context;

        if (!signatureResult.err) {
          // success
          commit("setTxStatus", {
            txid,
            status: "success",
            block: slot,
            walletAddress,
          });

          // notify.success({
          //   key: txid,
          //   message: 'Transaction has been confirmed',
          //   description
          // })
        } else {
          // fail
          commit("setTxStatus", {
            txid,
            status: "fail",
            block: slot,
            walletAddress,
          });

          // notify.error({
          //   key: txid,
          //   message: 'Transaction failed',
          //   description
          // })
        }
      },
      "single"
    );

    // commit('setListenerId', { txid, listenerId: listenerId + 1, walletAddress })
  };

  const needCreateTokens = () => {
    if (
      endpoint !== "Serum DEX" &&
      !usedAmmId &&
      usedRouteInfo !== undefined &&
      fromCoin !== null &&
      toCoin !== null
    ) {
      let fromMint = fromCoin.mintAddress;
      let midMint = usedRouteInfo.middle_coin;
      let toMint = toCoin.mintAddress;
      if (fromMint === NATIVE_SOL.mintAddress)
        fromMint = TOKENS.WSOL.mintAddress;
      if (midMint === NATIVE_SOL.mintAddress) midMint = TOKENS.WSOL.mintAddress;
      if (toMint === NATIVE_SOL.mintAddress) toMint = TOKENS.WSOL.mintAddress;
      return !(
        get(wallet.tokenAccounts, `${fromMint}.tokenAccountAddress`) &&
        get(wallet.tokenAccounts, `${midMint}.tokenAccountAddress`) &&
        get(wallet.tokenAccounts, `${toMint}.tokenAccountAddress`)
      );
    }
    return false;
  };

  const needWrapSol = () => {
    if (!usedAmmId && usedRouteInfo !== undefined && fromCoin !== null) {
      if (
        [NATIVE_SOL.mintAddress, TOKENS.WSOL.mintAddress].includes(
          fromCoin.mintAddress
        )
      ) {
        let amount = get(
          wallet.tokenAccounts,
          `${TOKENS.WSOL.mintAddress}.balance`
        );
        amount = Math.ceil((amount ? Number(amount.fixed()) : 0) * 10 ** 9);
        const fromCoinAmountData = Math.ceil(Number(fromCoinAmount) * 10 ** 9);
        if (fromCoinAmountData > amount) return fromCoinAmountData - amount;
      }
    }
    return 0;
  };

  const handleChange = (event: any) => {
    console.log(event.target.value, "event.target.value");
    setFromCoinInputBalance(event.target.value);
  };

  useEffect(() => {
    if (connector !== {} && wallet && connectStatus) {
      wallet.on("connect", () => {
        new solanaWeb3.Connection(
          "https://rpc-mainnet-fork.dappio.xyz",
          "confirmed"
        )
          .getParsedTokenAccountsByOwner(wallet.publicKey, {
            programId: TOKEN_PROGRAM_ID,
          })
          .then((data: any) => {
            console.log(data, "value");
            setUserBalance(data.value);
          });
      });
    }
    requestInfos();
    getMarkets();
  }, [connector]);

  useEffect(() => {
    updateAmounts();
  }, [fromCoin, toCoin, fromCoinBalance]);

  useEffect(() => {
    if (markets) {
      findMarket();
    }
  }, [markets]);

  // useEffect(() => {

  // }, []);

  useEffect(() => {
    addTokensSolana();
    createTokenList("", userBalance);
  }, [userBalance]);

  return (
    <div className="container">
      <div className="page-head fs-container">
        <Flex w="100%">
          <Box p="2">
            <span className="title">Swap</span>
          </Box>
          <Spacer />
          <FunctionButtons />
        </Flex>
      </div>

      <div className="card">
        <div className="card-body">
          <div
            className="coin-select"
            style={{ background: "#000829", borderRadius: 4 }}
          >
            <Flex pr="1.5rem" pl="1rem" pt="1rem">
              <Text fontSize="xs" color="#85858d">
                From
              </Text>
              <Spacer />
              <Text fontSize="xs" color="#85858d">
                {fromCoin && (
                  <>
                    Balance:
                    {fromCoin && fromCoin.uiAmount ? (
                      fromCoin && fromCoin.uiAmount
                    ) : (
                      <>{(0).toFixed(6)}</>
                    )}
                  </>
                )}
              </Text>
            </Flex>

            <div className="coin-input">
              <div className="main-input fs-container">
                <InputGroup>
                  <Input
                    pr="4.5rem"
                    pb="1.5rem"
                    border="none"
                    placeholder="0.00"
                    _placeholder={{ color: "grey" }}
                    focusBorderColor="transparent"
                    value={fromCoinBalance ? parseFloat(fromCoinBalance) : 0}
                    onChange={handleChange}
                  />
                  {fromCoin && fromCoin.uiAmount && (
                    <>
                      <button className="input-button">
                        <Text
                          fontSize="xs"
                          color="#5ac4be"
                          onClick={() => {
                            if (fromCoin) {
                              setFromCoinInputBalance(
                                fromCoin && fromCoin.uiAmount / 2
                              );
                            }
                          }}
                        >
                          HALF
                        </Text>
                      </button>
                      <button className="input-button">
                        <Text
                          fontSize="xs"
                          color="#5ac4be"
                          onClick={() => {
                            if (fromCoin) {
                              setFromCoinInputBalance(
                                fromCoin && fromCoin.uiAmount
                              );
                            }
                          }}
                        >
                          MAX
                        </Text>
                      </button>
                    </>
                  )}

                  <button
                    className="select-button fc-container"
                    onClick={openFromCoinSelect}
                  >
                    <Text fontSize="xs" color="#ffff">
                      <div className="fc-container">
                        <CoinImage
                          mintAddress={(fromCoin && fromCoin.mintAddress) || ""}
                        />
                        <span>{fromCoin && fromCoin.symbol}</span>
                      </div>
                    </Text>
                    <i
                      aria-label="icon: caret-down"
                      className="anticon anticon-caret-down"
                    >
                      <svg
                        viewBox="0 0 1024 1024"
                        data-icon="caret-down"
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        aria-hidden="true"
                        focusable="false"
                        className=""
                      >
                        <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
                      </svg>
                    </i>
                  </button>
                </InputGroup>
              </div>
            </div>
          </div>
          <div className="change-side fc-container">
            <div className="fc-container">
              <i aria-label="icon: swap" className="anticon anticon-swap">
                <svg
                  viewBox="64 64 896 896"
                  data-icon="swap"
                  width="1em"
                  height="1em"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                  className=""
                  style={{ transform: `rotate(90deg)` }}
                >
                  <path d="M847.9 592H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h605.2L612.9 851c-4.1 5.2-.4 13 6.3 13h72.5c4.9 0 9.5-2.2 12.6-6.1l168.8-214.1c16.5-21 1.6-51.8-25.2-51.8zM872 356H266.8l144.3-183c4.1-5.2.4-13-6.3-13h-72.5c-4.9 0-9.5 2.2-12.6 6.1L150.9 380.2c-16.5 21-1.6 51.8 25.1 51.8h696c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"></path>
                </svg>
              </i>
            </div>
          </div>
          <div
            className="coin-select"
            style={{ background: "#000829", borderRadius: 4 }}
          >
            <Flex pr="1.5rem" pl="1rem" pt="1rem">
              <Text fontSize="xs" color="#85858d">
                To (Estimate)
              </Text>
              <Spacer />
              <Text fontSize="xs" color="#85858d">
                {toCoin && (
                  <>
                    Balance:
                    {toCoin && toCoin.uiAmount ? (
                      toCoin && toCoin.uiAmount
                    ) : (
                      <>{(0).toFixed(6)}</>
                    )}
                  </>
                )}
              </Text>
            </Flex>

            <div className="coin-input">
              <div className="main-input fs-container">
                <InputGroup>
                  <Input
                    pr="4.5rem"
                    pb="1.5rem"
                    border="none"
                    value={toCoinOutputBalance}
                    placeholder="0.00"
                    _placeholder={{ color: "grey" }}
                    focusBorderColor="transparent"
                  />
                  <button
                    className="select-button fc-container"
                    onClick={openToCoinSelect}
                  >
                    <Text fontSize="xs" color="#ffff">
                      {!toCoin ? (
                        "Select a token"
                      ) : (
                        <div className="fc-container">
                          <CoinImage
                            mintAddress={(toCoin && toCoin.mintAddress) || ""}
                          />
                          <span>{toCoin && toCoin.symbol}</span>
                        </div>
                      )}
                    </Text>
                    <i
                      aria-label="icon: caret-down"
                      className="anticon anticon-caret-down"
                    >
                      <svg
                        viewBox="0 0 1024 1024"
                        data-icon="caret-down"
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        aria-hidden="true"
                        focusable="false"
                        className=""
                      >
                        <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
                      </svg>
                    </i>
                  </button>
                </InputGroup>
              </div>
            </div>
          </div>
          {toCoin && fromCoin && (
            <div className="fc-container">
              <Text fontSize="sm">
                1
                {fromCoin && toCoin
                  ? fromCoin.symbol
                  : fromCoin && fromCoin.symbol}
                ≈{compareValue.toFixed(6)}
                {fromCoin && toCoin
                  ? toCoin.symbol
                  : fromCoin && fromCoin.symbol}
                <i
                  aria-label="icon: swap"
                  className="anticon anticon-swap"
                  style={{
                    display: "inline-block",
                    marginLeft: 10,
                  }}
                >
                  <svg
                    viewBox="64 64 896 896"
                    data-icon="swap"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M847.9 592H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h605.2L612.9 851c-4.1 5.2-.4 13 6.3 13h72.5c4.9 0 9.5-2.2 12.6-6.1l168.8-214.1c16.5-21 1.6-51.8-25.2-51.8zM872 356H266.8l144.3-183c4.1-5.2.4-13-6.3-13h-72.5c-4.9 0-9.5 2.2-12.6 6.1L150.9 380.2c-16.5 21-1.6 51.8 25.1 51.8h696c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z"></path>
                  </svg>
                </i>
              </Text>
            </div>
          )}

          <div className="price-info">
            <div className="fs-container">
              <Text size="sm">
                Slippage Tolerance
                <Icon w="20px" h="20px" mt="0.5rem" ml="0.5rem">
                  <svg
                    viewBox="64 64 896 896"
                    data-icon="question-circle"
                    width="1em"
                    height="1em"
                    fill="currentColor"
                    aria-hidden="true"
                    focusable="false"
                    className=""
                  >
                    <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                    <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0 1 30.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1 0 80 0 40 40 0 1 0-80 0z"></path>
                  </svg>
                </Icon>
              </Text>
              <span> 0.5% </span>
            </div>
            {toCoin && fromCoin && (
              <>
                <div className="fs-container">
                  <Text size="sm">
                    Swapping Through
                    <Icon w="20px" h="20px" mt="0.5rem" ml="0.5rem">
                      <svg
                        viewBox="64 64 896 896"
                        data-icon="question-circle"
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        aria-hidden="true"
                        focusable="false"
                        className=""
                      >
                        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                        <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0 1 30.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1 0 80 0 40 40 0 1 0-80 0z"></path>
                      </svg>
                    </Icon>
                  </Text>
                  <span>{coinRoute}</span>
                </div>
                <div className="fs-container">
                  <Text size="sm">
                    Minimum Received
                    <Icon w="20px" h="20px" mt="0.5rem" ml="0.5rem">
                      <svg
                        viewBox="64 64 896 896"
                        data-icon="question-circle"
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        aria-hidden="true"
                        focusable="false"
                        className=""
                      >
                        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                        <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0 1 30.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1 0 80 0 40 40 0 1 0-80 0z"></path>
                      </svg>
                    </Icon>
                  </Text>
                  <span>
                    {miniReceived}
                    <span style={{ marginLeft: 5 }}>{toCoin.symbol}</span>
                  </span>
                </div>
                <div className="fs-container">
                  <Text size="sm">
                    Price Impact
                    <Icon w="20px" h="20px" mt="0.5rem" ml="0.5rem">
                      <svg
                        viewBox="64 64 896 896"
                        data-icon="question-circle"
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        aria-hidden="true"
                        focusable="false"
                        className=""
                      >
                        <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                        <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0 1 30.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1 0 80 0 40 40 0 1 0-80 0z"></path>
                      </svg>
                    </Icon>
                  </Text>
                  <Text size="sm" color="rgb(49, 208, 170);">
                    {finalImpact.toFixed(2) === "0.00"
                      ? "0.01"
                      : finalImpact.toFixed(2)}
                    %
                  </Text>
                </div>
              </>
            )}
          </div>
          {connector && wallet ? (
            <>
              {toCoin && fromCoin ? (
                <Button
                  _hover={{
                    bg: "transparent",
                    color: "#5ac4be",
                  }}
                >
                  Swap
                </Button>
              ) : (
                <Button
                  _hover={{
                    bg: "transparent",
                    color: "#5ac4be",
                  }}
                >
                  Select Token
                </Button>
              )}
            </>
          ) : (
            <Button
              _hover={{
                bg: "transparent",
                color: "#5ac4be",
              }}
              onClick={() => {
                triggerWalletModalFn(true);
              }}
            >
              Connect Wallet
            </Button>
          )}

          <div className="not-enough-sol-alert">
            <Text fontSize="sm" color="#ffff">
              Caution: Your SOL balance is low
            </Text>
            <Icon w={"1.5em"} h={"1.5em"} mt="0.5rem">
              <svg
                viewBox="64 64 896 896"
                data-icon="question-circle"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path>
                <path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0 1 30.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1 0 80 0 40 40 0 1 0-80 0z"></path>
              </svg>
            </Icon>
          </div>
          <TokenListModal
            onClose={onClose}
            isOpen={isOpen}
            onCoinSelect={onCoinSelect}
            getTokenDetail={getTokenDetail}
            allTokens={allTokens}
          />
        </div>
      </div>
    </div>
  );
}
export default Swap;
