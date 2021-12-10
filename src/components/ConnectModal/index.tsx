import {
  Flex,
  Spacer,
  Box,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

interface ConnectModalProps {
  triggerWalletModalFn: Function;
  walletModal: any;
  address: String;
  wallets: any;
  connect: Function;
}

export default function ConnectModal(props: ConnectModalProps) {
  const filterContent = (value: any) => {
    return value.replace(" ", "-").toLowerCase();
  };

  const { triggerWalletModalFn, walletModal, wallets, connect } = props;
  return (
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
              {Object.values(wallets).map((wallet: any) => (
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
                        require(`../../assets/wallets/${filterContent(
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
  );
}
