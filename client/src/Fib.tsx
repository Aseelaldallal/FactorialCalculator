import React from "react";
import axios from "axios";

interface IState {
  seenIndexes: Array<number>;
  values: {
    [index: string]: number;
  };
  index: string;
}

class Fib extends React.Component {
  state: IState = {
    seenIndexes: [],
    values: {},
    index: "",
  };

  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();
  }

  async fetchValues() {
    console.log("Fetching Values");
    const values = await axios.get("/api/values/current");
    this.setState({ values: values.data });
  }

  async fetchIndexes() {
    console.log("Fetching Indexes");
    const seenIndexes = await axios.get("/api/values/all");
    console.log("Seen Indexes data", seenIndexes.data);
    this.setState({
      seenIndexes: seenIndexes.data,
    });
  }

  handleSubmit = async (event: React.FormEvent<EventTarget>) => {
    event.preventDefault();
    await axios.post("/api/values", {
      index: this.state.index,
    });
    console.log("Posted");
    this.setState({ index: "" });
  };

  renderSeenIndexes() {
    console.log("Seen indexes:", this.state);
    console.log(this.state);
    // return this.state.seenIndexes.map(({ number }) => number).join(", ");
  }

  renderValues() {
    const entries = [];
    for (let key in this.state.values) {
      entries.push(
        <div key={key}>
          For index {key} I calculated {this.state.values[key]}
        </div>
      );
    }
    return entries;
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>Enter your index:</label>
          <input
            value={this.state.index}
            onChange={(event) => this.setState({ index: event.target.value })}
          />
          <button>Submit</button>
        </form>
        <h3>Indexes I have seen:</h3>
        {this.renderSeenIndexes()}
        <h3>Calculated Values</h3>
        {this.renderValues()}
      </div>
    );
  }
}

export default Fib;
