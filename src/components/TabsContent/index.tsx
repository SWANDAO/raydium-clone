import { Text, Tab, Tabs, TabList } from "@chakra-ui/react";

export default function TabsContent() {
  return (
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
  );
}
