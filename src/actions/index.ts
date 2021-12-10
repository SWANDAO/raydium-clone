import { status } from "../constants/connect";
export const INIT_WEB3 = "INIT_WEB3";
export const UPDATE_MODAL = "UPDATE_MODAL";
export const UPDATE_WEB3 = "UPDATE_WEB3";
export const SET_ERROR = "SET_ERROR";
export const GET_BALANCE = "GET_BALANCE";
export const SET_CONTRACT = "SET_CONTRACT";
export const SET_CANCEL = "SET_CANCEL";
export const SET_BUY_ITEM = "SET_BUY_ITEM";
export const UPDATE_BALANCE = "UPDATE_BALANCE";

let interval: any;

declare let window: any;

export const web3Init = (initWalletData: object) => async (dispatch: any) => {
  dispatch({
    type: UPDATE_WEB3,
    data: {
      connector: initWalletData,
    },
  });
};

export const setTokenBalance =
  (balanceData: number) => async (dispatch: any) => {
    dispatch({
      type: UPDATE_BALANCE,
      data: {
        balance: balanceData,
      },
    });
  };

export const triggerWalletModal =
  (modalStatus: boolean) => async (dispatch: any) => {
    dispatch({
      type: UPDATE_MODAL,
      data: modalStatus,
    });
  };

export const web3Disconnect = () => async (dispatch: any) => {
  if (interval) {
    clearInterval(interval);
  }
  dispatch({
    type: UPDATE_WEB3,
    data: {
      account: "",
      balance: "",
      connector: "",
      status: status.DISCONNECTED,
      chainId: "",
      symbol: "",
    },
  });
};
