import React, { useState } from "react";
import {
  Flex,
  Spacer,
  Box,
  Button,
  Text,
  useToast,
  Icon,
} from "@chakra-ui/react";
import * as solanaWeb3 from "@solana/web3.js";
import { wallets } from "../utils/ids";

import { web3Init, triggerWalletModal } from "../actions";
import { useSelector, useDispatch } from "react-redux";

import TabsContent from "../components/TabsContent";
import DisconnectModal from "../components/DisconnectModal";
import ConnectModal from "../components/ConnectModal";

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
        <TabsContent />
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

      <DisconnectModal
        setDeconnectedModal={setDeconnectedModal}
        deconnectedModal={deconnectedModal}
        address={address}
        disConnect={disConnect}
      />

      <ConnectModal
        triggerWalletModalFn={triggerWalletModalFn}
        walletModal={walletModal}
        wallets={wallets}
        connect={connect}
        address={address}
      />
    </Flex>
  );
};

export default HeaderComponent;
