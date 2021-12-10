import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import HeaderLayout from "./Header";
import SwapPage from "../pages/Swap";
const LayoutDefault = () => {
  return (
    <>
      <Router>
        <HeaderLayout />
        <Switch>
          <Route path="/" exact component={SwapPage} />
        </Switch>
      </Router>
    </>
  );
};

export default LayoutDefault;
