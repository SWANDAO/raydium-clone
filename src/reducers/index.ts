import * as actions from "../actions";
import { status } from "../constants/connect";

const initialState = {
  walletModal: false,
  account: "",
  balance: 0,
  balanceArray: [],
  status: status.DISCONNECTED,
  chainId: "",
  symbol: "",
  connector: {},
  netWorkName: "Binance Smart chain",
  tokenApproved: {},
  priceBnb: 0,
  priceBusd: 1,
  priceEth: 0,
  isError: false,
  isCancel: false,
  numberBuyItem: 0,
  totalVolume: 0,
  totalTransaction: 0,
  isShowOnR1: true,
  isShowTimeSkip: true,
  balanceOf: {
    BUSD: 0,
    ETH: 0,
    WBNB: 0,
    BNB: 0,
  },
};

const rootReducer = (state = initialState, action: any) => {
  console.log(action.data, "action.data");
  switch (action.type) {
    case actions.UPDATE_BALANCE:
      return {
        ...state,
        balance: action.data.balance,
      };
    case actions.INIT_WEB3:
      return {
        ...state,
        connector: action.data,
      };
    case actions.UPDATE_MODAL:
      return {
        ...state,
        walletModal: action.data,
      };
    case actions.UPDATE_WEB3:
      return {
        ...state,
        ...action.data,
      };
    case actions.GET_BALANCE:
      return {
        ...state,
        balance: action.balance,
      };
    case "SAVE_TOKEN":
      sessionStorage.setItem(
        "tokenApproved",
        JSON.stringify(action.tokenApproved)
      );
      return {
        ...state,
        tokenApproved: action.tokenApproved,
      };
    case actions.SET_ERROR:
      return {
        ...state,
        ...action.data,
      };
    case actions.SET_CANCEL:
      return {
        ...state,
        ...action.data,
      };
    case actions.SET_BUY_ITEM:
      return {
        ...state,
        numberBuyItem: state.numberBuyItem + 1,
      };
    case "SET_MODAL":
      return {
        ...state,
        [action.data.key]: action.data.value,
      };
    default:
      return state;
  }
};

export default rootReducer;
