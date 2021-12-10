import { useState, useEffect } from "react";

import { TOKENS, NATIVE_SOL } from "../../constants/tokens";

interface CoinImageProps {
  mintAddress: string;
}
function CoinImage(props: CoinImageProps) {
  const { mintAddress } = props;
  const [coinPicUrl, setCoinPicUrl] = useState("");
  let errorCount = 0;

  const getCoinPicUrl = () => {
    let token;
    if (mintAddress === NATIVE_SOL.mintAddress) {
      token = NATIVE_SOL;
    } else {
      token = Object.values(TOKENS).find(
        (item) => item.mintAddress === mintAddress
      );
    }
    if (token) {
      //   coinName = token.symbol.toLowerCase();

      if (errorCount === 0) {
        setCoinPicUrl(`https://sdk.raydium.io/icons/${mintAddress}.png`);
      } else if (token.picUrl && errorCount === 1) {
        setCoinPicUrl(token.picUrl);
      } else {
        setCoinPicUrl("https://raydium.io/_nuxt/img/sol.b0aecf8.png");
      }
    }
  };

  useEffect(() => {
    getCoinPicUrl();
  }, [mintAddress]);

  return (
    <>
      {coinPicUrl && (
        <img
          src={coinPicUrl}
          onError={() => {
            errorCount++;
            getCoinPicUrl();
          }}
        />
      )}
    </>
  );
}

export default CoinImage;
