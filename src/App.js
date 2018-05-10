import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import poolLottery from './poolLottery';

class App extends Component {
  state = {
    balance: '',
    lastWinner: '',
    manager: '',
    message: '',
    players: [],
    value: '0.01',
  };


  async componentDidMount() {
    const { balance, lastWinner, manager, players } = await this.getContractData();

    this.setState({ balance, lastWinner, manager, players });
  }


  onSubmit = async (e) => {
    e.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Transaction sent. Waiting for response...' });

    await poolLottery.methods.joinLottery().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether'),
    });

    const { balance, players } = await this.getContractData();

    this.setState({
      balance,
      players,
      message: 'You have joined the lottery!'
    });
  }


  onClick = async () => {
    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Transaction sent. Waiting for response...' });

    await poolLottery.methods.pickWinner().send({
      from: accounts[0]
    });

    const { balance, lastWinner, manager, players } = await this.getContractData();
    const message = `The winner is, ${lastWinner}!`;

    this.setState({ balance, lastWinner, manager, message, players });
  }


  getContractData = async () => {
    const balance = await web3.eth.getBalance(poolLottery.options.address);
    const lastWinner = await poolLottery.methods.lastWinner().call();
    const manager = await poolLottery.methods.manager().call();
    const players = await poolLottery.methods.getPlayers().call();

    return { balance, lastWinner, manager, players };
  }


  render() {
    return (
      <div className="App">
        <h2>Lottery Contract</h2>
        <p>
          This contract is managed by {this.state.manager}.
          There are currently {this.state.players.length} people competing
          to win {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>

        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Ready to try your luck?</h4>
          <div>
            <label htmlFor="etherInput">
              Amount of ether to enter (0.01 ether required)
              <input
                id="etherInput"
                value={this.state.value}
                onChange={e => this.setState({ value: e.target.value })}
              />
            </label>
          </div>
          <button>Enter</button>
        </form>

        <hr />

        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>

        <hr />

        <h4>{this.state.message}</h4>
        {this.state.lastWinner &&
          <h5>Last Winner: {this.state.lastWinner}</h5>
        }
      </div>
    );
  }
}

export default App;
