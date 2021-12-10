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
  NATIVE_SOL,
  TOKENS_TAGS,
  addTokensSolana,
  getTokenBySymbol,
} from "../../constants/tokens";

import * as solanaWeb3 from "@solana/web3.js";

import CoinImage from "./CoinImage";

import { cloneDeep, get } from "lodash-es";

import { useSelector, useDispatch } from "react-redux";
import { TOKEN_PROGRAM_ID } from "../../utils/ids";
import { triggerWalletModal, setTokenBalance } from "../../actions";

//component
import TokenListModal from "./TokenListModal";
import FunctionButtons from "./FunctionButtons";

const RAY = getTokenBySymbol("RAY");

function Swap() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [allTokens, setAllTokens] = useState([] as Array<TokenInfo>);
  const [fromCoin, setFromCoin] = useState(RAY as TokenInfo | null);
  const [toCoin, setToCoin] = useState(null as TokenInfo | null);
  const [selectFromCoin, setSelectFromCoin] = useState(true);
  const [userBalance, setUserBalance] = useState([] as any);
  const [inputBalance, setInputBalance] = useState(0 as number);
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

  let fromCoinAmount: "", toCoinAmount: "";

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

  useEffect(() => {
    if (connector !== {} && wallet && connectStatus) {
      wallet.on("connect", () => {
        new solanaWeb3.Connection(
          "https://solana-api.projectserum.com",
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
  }, [connector]);

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
                    value={inputBalance.toFixed(4)}
                  />
                  {fromCoin && fromCoin.uiAmount && (
                    <>
                      <button className="input-button">
                        <Text
                          fontSize="xs"
                          color="#5ac4be"
                          onClick={() => {
                            if (fromCoin) {
                              setInputBalance(
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
                              setInputBalance(fromCoin && fromCoin.uiAmount);
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
                  <span>
                    {fromCoin && fromCoin.symbol}
                    {">"}
                    {toCoin && toCoin.symbol}
                  </span>
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
                  <span> {fromCoin && fromCoin.uiAmount} </span>
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
                  <span> 0.5% </span>
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
