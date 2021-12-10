import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
// import reportWebVitals from "./report-web-vitals";
import { Provider } from "react-redux";
import store from "./store";

import theme from "../src/styles/theme";

import { ChakraProvider } from "@chakra-ui/react";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
