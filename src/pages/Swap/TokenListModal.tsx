import {
  Center,
  Input,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import CoinImage from "./CoinImage";

interface TokenListModalProps {
  allTokens: any[];
  getTokenDetail: Function;
  onCoinSelect: Function;
  onClose: any;
  isOpen: boolean;
}

const TokenListModal = (props: TokenListModalProps) => {
  const { allTokens, getTokenDetail, onCoinSelect, onClose, isOpen } = props;

  return (
    <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader borderBottom="1px" borderColor="#e8e8e8" bg="#1c274f">
          <Text fontSize="sm" color="#ffff">
            Select a token
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody bg="#1c274f">
          <Input
            size="lg"
            borderColor="#5ac4be"
            placeholder="Search name or mint address"
            _placeholder={{ color: "grey" }}
            mt="1rem"
            mb="1rem"
            p="1.8rem"
            pl="1rem"
          />
          <div className="token-list">
            {allTokens.map((token) => {
              return (
                <div
                  className="token-info"
                  onClick={() => {
                    getTokenDetail(token.uiAmount);
                    onCoinSelect(token);
                  }}
                >
                  <CoinImage mintAddress={token.mintAddress} />
                  <div>
                    <span>{token.symbol}</span>
                  </div>
                  <span></span>
                  <div className="balance">
                    <div>{token.uiAmount}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </ModalBody>
        <ModalFooter bg="#1c274f" center borderTop="1px" borderColor="#e8e8e8">
          <Center bg="transparent" w="100%" h="10px">
            View Token Lists
          </Center>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TokenListModal;
