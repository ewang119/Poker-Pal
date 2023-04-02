import React, { useEffect, useState } from 'react';
import './App.css';

function Lobby({socket, name, money, lobby}) {
	const [currentBet, setCurrentBet] = useState(0);
    const [cumulativeCurrentBet, setCumulativeCurrentBet] = useState(0);
	const [betList, setBetList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [moneyList, setMoneyList] = useState([]);
    const [userMoney, setUserMoney] = useState(100);
	
	// don't send empty data, then transmit data to other dude
	const submitBet = async (e) => {
		if (parseInt(e) !== 0 && e !== null && userMoney >= parseInt(e)) {
            setUserMoney(userMoney - parseInt(e));
            var position = userList.indexOf(name);
            var tempArray = moneyList;
            tempArray[position] = userMoney - parseInt(e);
            setMoneyList(tempArray);
            
            setCumulativeCurrentBet(cumulativeCurrentBet + parseInt(e));
			const betData = {
                lobby: lobby,
                name: name,
				bet: parseInt(e),
                cumulative: cumulativeCurrentBet + parseInt(e)
			};

			await socket.emit("submit_bet", {bets: betData, moneys: tempArray});
			setBetList((list) => [...list, betData]); // so we can see our own bets
			setCurrentBet(0);
		}
	};

    const claimDub = async () => {
        setUserMoney(userMoney + sumOfPot());
        var position = userList.indexOf(name);
        var tempArray = moneyList;
        tempArray[position] = userMoney + sumOfPot();
        setMoneyList(tempArray);
        
        setCumulativeCurrentBet(0);

        await socket.emit("dub", {lobby: lobby, moneys:tempArray});
        setBetList([]);
        setCurrentBet(0);
	};

	useEffect (() => {
		socket.on("get_update", (data) => {
			setBetList((list) => [...list, data.bets]);
            setMoneyList(data.moneys);
		})

        socket.on("dub_update", (data) => {
            setMoneyList(data.moneys);
            setBetList([]);
            setCumulativeCurrentBet(0);
        })

        socket.on("user_joined", (data) => {
            setUserList((list) => data.players);
            setMoneyList((list) => data.money);
        });

        socket.on("user_left", (data) => {
            setUserList((list) => data.players);
            setMoneyList((list) => data.money);
        });

		return () => {
            socket.removeListener('get_update');
            socket.removeListener('user_joined');
        }
	}, [socket]);

    const sumOfPot = () => {
        let sum = 0;
        for (const element of betList) {
            sum = sum + element.bet;
        }
        return sum;
    };

    const calcCall = () => {
        if (betList.length > 0) {
            const total = betList[betList.length - 1].cumulative;
            return total - cumulativeCurrentBet;
        }
        return 0;
    };

    const leaveRoom = () => {
        const index = userList.indexOf(name);
        let updatedUserList = userList;
        updatedUserList.splice((index, 1));
        let updatedMoneyList = moneyList;
        updatedMoneyList.splice((index, 1));
        setMoneyList(updatedMoneyList);
        setUserList(updatedUserList);
        socket.emit("leave_room", {lobby: lobby, players: updatedUserList, money: updatedMoneyList});
    }

	return (
		<div className="lobby">
			<div className="header">
				<p>Lobby Name: {lobby}</p>
                <p>Your name: {name}</p>
                <p>Your money: {userMoney}</p>
                <button className="leaveRoom" onClick={leaveRoom}>Leave Room</button>
                <br/><br/><br/>
			</div>

            <div>
                <table>
                    <tr>
                    <th>Players</th>
                    {userList.map((users) => {
                        return (
                            <td>{users}</td>
                        );
                    })}
                    </tr>
                    <tr>
                    <th>Money</th>
                    {moneyList.map((money) => {
                        return (
                            <td>{money}</td>
                        );
                    })}
                    </tr>
                </table>

            </div>

            <div className="body">
                <h3>Total Pot: {sumOfPot()} </h3>
                <button class="dub" onClick={() => {claimDub()}}>Claim Dub</button>

			</div>

			<div className="bets">
                <button className="betsNum" onClick={() => {submitBet(1)}}>1</button>
                <button className="betsNum" onClick={() => {submitBet(2)}}>2</button>
                <button className="betsNum" onClick={() => {submitBet(5)}}>5</button>
                <button className="betsNum" onClick={() => {submitBet(10)}}>10</button>
                <button className="betsNum" onClick={() => {submitBet(15)}}>15</button>
                <button className="betsNum" onClick={() => {submitBet(20)}}>20</button><br/>
                <button className="betsNaN" onClick={() => {submitBet(calcCall())}}>Call</button>
                <button className="betsNaN" onClick={() => {submitBet(userMoney)}}>All In</button><br/>
                <p>or enter a custom bet:</p>
                <br/>
                <input 
                    type="number"
                    placeholder="Enter your bet" 
                    value={currentBet}
                    onChange={(event) => {
                        setCurrentBet(event.target.value);
                    }}
                />
				<button className="submitBet" onClick={() => {submitBet(currentBet)}}>Submit Bet</button>

                {betList.map((betContent) => {
					return (
						<div>
                            <p>{betContent.name} has bet {betContent.bet}. This round, {betContent.name} has bet a total of {betContent.cumulative}.</p>
						</div>
					);
				})}

			</div>
		</div>
	);
}

export default Lobby;