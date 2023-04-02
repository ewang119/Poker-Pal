// add dependencies
import './App.css';
import io from 'socket.io-client';
import { useState } from 'react';
import Lobby from "./Lobby";

const socket = io.connect("http://localhost:3001");

function App() {
  const [name, setName] = useState("");
  const [lobby, setLobby] = useState("");
  const [money, setMoney] = useState(100);
  const [lobbyJoined, setLobbyJoined] = useState(false);

  const joinLobby = () => {
    if (name !== "" && lobby !== "" && money !== 0 && money !== null) {
      socket.emit('join_lobby', { name: name, lobby: lobby, money: money });
      setLobbyJoined(true);
    }
  }

  socket.on("home_screen", () => {
    setLobbyJoined(false);
  });

  return (
    <div className="App">

      { !lobbyJoined ? (

      <div className="notJoined">

        <h1>Poker Pal</h1>
        <p>Who needs real chips anyways?</p>
        <p>Notice: Leaving a lobby by means of X, refresh, etc. will result your data staying in the lobby.</p>
        <br/><br/>

        <h3>Join a lobby:</h3>
        <input 
            type="text"
            placeholder="Display Name" 
            onChange={(event) => {
              setName(event.target.value);
            }}
        /><br/>
        <input 
            type="text"
            placeholder="Lobby Name" 
            onChange={(event) => {
              setLobby(event.target.value);
            }}
        /><br/>
        <input 
            type="number"
            placeholder="Amt of Money" 
            onChange={(event) => {
              setMoney(event.target.value);
            }}
        /><br/>
        <button onClick={joinLobby}>Join</button>

      </div>
      )
      :
      (
      <div className="lobbyJoined">

        <Lobby socket={socket} name={name} lobby={lobby} money={money}/>

      </div>
      )}
      
    </div>
  );
}

export default App;
