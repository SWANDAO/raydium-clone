import {
  Center,
  Button,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";

interface DisconnectModalProps {
  setDeconnectedModal: Function;
  deconnectedModal: any;
  address: String;
  disConnect: Function;
}

export default function DisconnectModal(props: DisconnectModalProps) {
  const { setDeconnectedModal, deconnectedModal, address, disConnect } = props;
  return (
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
  );
}
