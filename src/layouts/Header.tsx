import React, { useState } from "react";
import {
  Flex,
  Spacer,
  Box,
  Center,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  Icon,
  Tab,
  Tabs,
  TabList,
} from "@chakra-ui/react";
// import logoMain from '../static/images/logo-doragonland.png'
import * as solanaWeb3 from "@solana/web3.js";
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

import { web3Init, triggerWalletModal } from "../actions";
import { useSelector, useDispatch } from "react-redux";

const HeaderComponent = () => {
  const { connector } = useSelector((state: any) => {
    return state;
  });
  const { connectStatus, wallet } = connector;
  let adapter: any = null;
  let keyToDisplay: string = "";
  let connectError: boolean = false;
  const dispatch = useDispatch();
  const toast = useToast();
  const [deconnectedModal, setDeconnectedModal] = useState(false);
  const [connected, setConnected] = useState(false);

  const [address, setAddress] = useState("");
  const { walletModal } = useSelector((state: any) => {
    return state;
  });

  const triggerWalletModalFn = (status: boolean) => {
    dispatch(triggerWalletModal(status));
  };

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

  const wallets: { [key: string]: WalletInfo } = {
    Phantom: {
      name: "Phantom",
      website: "https://phantom.app",
      chromeUrl:
        "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa",
      getAdapter() {
        return new PhantomWalletAdapter();
      },
    },
    "Solflare Extension": {
      name: "Solflare Extension",
      website: "https://solflare.com",
      firefoxUrl:
        "https://addons.mozilla.org/en-US/firefox/addon/solflare-wallet",
      getAdapter() {
        return new SolflareWalletAdapter();
      },
    },
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

  const filterContent = (value: any) => {
    return value.replace(" ", "-").toLowerCase();
  };

  const onConnect = () => {
    setConnected(true);
    let walletPublicKey = adapter.publicKey.toBase58();
    keyToDisplay =
      walletPublicKey.length > 20
        ? `${walletPublicKey.substring(0, 7)}.....${walletPublicKey.substring(
            walletPublicKey.length - 7,
            walletPublicKey.length
          )}`
        : walletPublicKey;
    setAddress(keyToDisplay);

    new solanaWeb3.Connection(
      "https://solana-api.projectserum.com",
      // solanaWeb3.clusterApiUrl("devnet"),
      "confirmed"
    )
      .getBalance(adapter.publicKey)
      .then(function (value) {
        console.log(value);
      });
    triggerWalletModalFn(false);
    toast({
      position: "bottom-left",
      title: "Wallet update",
      description: "Connected to wallet " + keyToDisplay,
      status: "success",
      duration: 9000,
      isClosable: true,
    });
  };

  const disConnect = async () => {
    if (wallet && wallet.publicKey) {
      wallet.on("disconnect", () => {
        setConnected(false);
        dispatch(
          web3Init({
            wallet: null,
            connectStatus: false,
          })
        );
        toast({
          position: "bottom-left",
          title: "Wallet disconnected",
          description: "Deconnected",
          status: "warning",
          duration: 9000,
          isClosable: true,
        });
      });
      wallet.off("connect", onConnect);
      wallet.disconnect();
      setDeconnectedModal(false);
    }
  };

  const connect = async (wallet: any) => {
    const { name, providerUrl } = wallet;
    adapter = wallet.getAdapter(providerUrl);
    dispatch(
      web3Init({
        wallet: adapter,
        connectStatus: true,
      })
    );
    if (adapter) {
      adapter.on("connect", onConnect);
      if (!connectError) {
        try {
          await adapter.connect();
        } catch (error: any) {
          console.log(error.name);

          if (name) {
            const info = wallets[name];

            if (info) {
              const { website, chromeUrl, firefoxUrl } = info;

              if (
                [
                  "WalletNotFoundError",
                  "WalletNotInstalledError",
                  "WalletNotReadyError",
                ].includes(error.name)
              ) {
                const installUrl = /Firefox/.test(navigator.userAgent)
                  ? firefoxUrl
                  : chromeUrl;
                toast({
                  position: "bottom-left",
                  title: error.name,
                  status: "error",
                  description: "Connect wallet failed",
                  duration: 3000,
                  isClosable: true,
                  render: () => (
                    <Box m={3} color="white" p={3} w="384px" bg="#1c274f">
                      <Text size="lg" fontWeight="bold">
                        Wallet not found
                      </Text>
                      Please install and initialize {name} wallet extension
                      first,
                      <a
                        style={{ color: "#5ac4be" }}
                        href={website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        click here to visit official website
                      </a>
                      {(chromeUrl || firefoxUrl) && (
                        <>
                          or
                          <a
                            rel="noreferrer"
                            style={{ color: "#5ac4be" }}
                            href={installUrl}
                            target="_blank"
                          >
                            click here to install extension`
                          </a>
                        </>
                      )}
                    </Box>
                  ),
                });
                setConnected(false);
              }
            }
          }
          adapter.disconnect();
          return error;
        }
      }
    }
  };

  return (
    <Flex p="4" pb="3" borderBottom="2px solid #1c274f">
      <Box ml="8">
        <img
          width="130"
          src="https://raydium.io/_nuxt/img/logo-text.cf5a7a0.svg"
          alt=""
        />
      </Box>
      <Spacer />
      <Box>
        <Tabs>
          <TabList border="0px">
            <Tab
              fontSize="13px"
              color="#F1F1F280"
              _selected={{
                color: "white",
                borderBottom: "2px solid #6a49fe",
              }}
            >
              <Text>Trading</Text>
            </Tab>
            <Tab
              fontSize="13px"
              color="#F1F1F280"
              _selected={{ color: "white", borderBottom: "2px solid #6a49fe" }}
              ml="1.5rem"
            >
              Swap
            </Tab>
            <Tab
              fontSize="13px"
              color="#F1F1F280"
              ml="1.5rem"
              _selected={{ color: "white", borderBottom: "2px solid #6a49fe" }}
            >
              Liquidity
            </Tab>
            <Tab
              fontSize="13px"
              ml="1.5rem"
              color="#F1F1F280"
              _selected={{ color: "white", borderBottom: "2px solid #6a49fe" }}
            >
              Pools
            </Tab>
            <Tab
              fontSize="13px"
              color="#F1F1F280"
              _selected={{ color: "white", borderBottom: "2px solid #6a49fe" }}
              ml="1.5rem"
            >
              Farms
            </Tab>
            <Tab
              fontSize="13px"
              color="#F1F1F280"
              _selected={{ color: "white", borderBottom: "2px solid #6a49fe" }}
              ml="1.5rem"
            >
              Staking
            </Tab>
            <Tab
              fontSize="13px"
              color="#F1F1F280"
              _selected={{ color: "white", borderBottom: "2px solid #6a49fe" }}
              ml="1.5rem"
            >
              AcceleRaytor
            </Tab>
            <Tab
              fontSize="13px"
              color="#F1F1F280"
              _selected={{ color: "white", borderBottom: "2px solid #6a49fe" }}
              ml="1.5rem"
            >
              DropZone
            </Tab>
            <Tab
              fontSize="13px"
              color="#F1F1F280"
              _selected={{ color: "white", borderBottom: "2px solid #6a49fe" }}
              ml="1.5rem"
            >
              NFTs
            </Tab>
            <Tab
              fontSize="13px"
              color="#F1F1F280"
              _selected={{ color: "white", borderBottom: "2px solid #6a49fe" }}
              ml="1.5rem"
            >
              Migrate
            </Tab>
          </TabList>
        </Tabs>
      </Box>
      <Spacer />
      <Box>
        {address && connectStatus ? (
          <Button
            _hover={{
              bg: "transparent",
              color: "#5ac4be",
            }}
            onClick={() => {
              setDeconnectedModal(true);
            }}
            colorScheme="teal"
          >
            <Icon size="xl" mr="0.4rem">
              <svg
                viewBox="64 64 896 896"
                data-icon="wallet"
                width="1.5rem"
                height="1.5rem"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 464H528V448h312v128zm0 264H184V184h656v200H496c-17.7 0-32 14.3-32 32v192c0 17.7 14.3 32 32 32h344v200zM580 512a40 40 0 1 0 80 0 40 40 0 1 0-80 0z"></path>
              </svg>
            </Icon>
            {address}
          </Button>
        ) : (
          <Button
            _hover={{
              bg: "transparent",
              color: "#5ac4be",
            }}
            size="sm"
            onClick={() => {
              triggerWalletModalFn(true);
            }}
            colorScheme="teal"
            mr="1rem"
          >
            <Icon size="xl" mr="0.4rem">
              <svg
                viewBox="64 64 896 896"
                data-icon="wallet"
                width="1.5rem"
                height="1.5rem"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V144c0-17.7-14.3-32-32-32zm-40 464H528V448h312v128zm0 264H184V184h656v200H496c-17.7 0-32 14.3-32 32v192c0 17.7 14.3 32 32 32h344v200zM580 512a40 40 0 1 0 80 0 40 40 0 1 0-80 0z"></path>
              </svg>
            </Icon>
            Connect
          </Button>
        )}
      </Box>

      <Modal
        size="lg"
        onClose={() => {
          setDeconnectedModal(false);
        }}
        isOpen={deconnectedModal}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader borderBottom="1px" borderColor="#e8e8e8" bg="#1c274f">
            <Text fontSize="sm" color="#ffff">
              Your wallet
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody w="100%" bg="#1c274f">
            <Center p={5} shadow="md">
              <Text fontSize="lg" color="#ffff">
                {address}
              </Text>
            </Center>

            <Center p={5} shadow="md" center="center">
              <Button
                size="lg"
                _hover={{
                  bg: "transparent",
                  color: "#5ac4be",
                }}
                onClick={() => {
                  disConnect();
                }}
                colorScheme="teal"
              >
                Disconnect
              </Button>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        size="lg"
        onClose={() => {
          triggerWalletModalFn(false);
        }}
        isOpen={walletModal}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader borderBottom="1px" borderColor="#e8e8e8" bg="#1c274f">
            <Text fontSize="sm" color="#ffff">
              Connect to a Wallet
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody bg="#1c274f">
            <div className="wallet-list">
              <div>
                {Object.values(wallets).map((wallet) => (
                  <Flex
                    border="1px"
                    borderRadius="4px"
                    borderColor="#5ac4be"
                    mb="1rem"
                    mt="1rem"
                    pl="4"
                    pr="4"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      connect(wallet);
                    }}
                  >
                    <Box p="2" bg="transparent">
                      <Text
                        fontSize="sm"
                        mt="0.3rem"
                        fontWeight="bold"
                        color="#ffff"
                      >
                        {wallet.name}
                      </Text>
                    </Box>
                    <Spacer />
                    <Box p="2" bg="transparent">
                      <img
                        width="32px"
                        height="32px"
                        src={
                          require(`../assets/wallets/${filterContent(
                            wallet.name
                          )}.png`).default
                        }
                        alt="walletimage"
                      />
                    </Box>
                  </Flex>
                ))}
                <div></div>
                <span></span>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default HeaderComponent;
