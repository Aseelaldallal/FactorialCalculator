import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import OtherPage from "./OtherPage";
import Fib from "./Fib";

import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <header>
          <Link to="/"> Home </Link>
          <Link to="/otherpage"> OtherPages! </Link>
        </header>
        <hr />
        <div>
          <Route exact path="/" component={Fib} />
          <Route path="/otherpage" component={OtherPage} />
        </div>
      </div>
    </Router>
  );
}

export default App;
