import React, {FormEvent, useEffect, useState} from 'react';
import './App.css';
import Button from '@mui/material/Button';
import {lotteryContract} from './crypto/LotteryContract'
import {web3} from "./crypto/web3";

function App() {

    const [contractOwner, setContractOwner] = useState("")
    const [players, setPlayers] = useState([])
    const [balance, setBalance] = useState("")
    const [accounts, setAccounts] = useState([] as string[])
    const [isWalletConnected, setIsWalletConnected] = useState(false)
    const [etherValueToEnter, setEtherValueToEnter] = useState("0")
    const [transactionState, setTransactionState] = useState("")


    useEffect(() => {
        async function getContractOwner() {
            return await lotteryContract.methods.owner().call()
        }

        async function getPlayers() {
            return await lotteryContract.methods.getPlayers().call()
        }

        async function getBalance() {
            return await web3.eth.getBalance(lotteryContract.options.address)
        }

        getContractOwner().then(result => {
            setContractOwner(result)
        })
        getPlayers().then(result => {
            setPlayers(result)
        })
        getBalance().then(result => {
            setBalance(web3.utils.fromWei(result, 'ether'))
        })
    }, [])

    useEffect(() => {
        async function getConnectedAccounts() {
            return web3.eth.getAccounts()
        }

        getConnectedAccounts().then(connectedAccounts => {
            if (connectedAccounts.length !== 0) {
                setIsWalletConnected(true)
            }
            setAccounts(connectedAccounts)
        })
    }, [])


    const ethEnabled = async () => {
        if ((window as any).ethereum) {
            await (window as any).ethereum.send('eth_requestAccounts');
            // (window as any).web3 = new Web3((window as any).ethereum);
            setIsWalletConnected(true)
            setAccounts(await web3.eth.getAccounts())
        }
    }

    const chooseWinner = async () => {
        const accounts = await web3.eth.getAccounts()

        await lotteryContract.methods.chooseWinner().send({
            from: accounts[0]
        })
    }

    async function enterLottery(event: FormEvent) {
        event.preventDefault()

        const accounts = await web3.eth.getAccounts()

        setTransactionState("Waiting for Transaction to finish")
        await lotteryContract.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei(etherValueToEnter, 'ether')
        })
        setTransactionState("Successfully entered the competition!")
    }

    return (
        <div className="App">
            <header className="App-header">
            </header>
            <h2>Lottery Contract</h2>
            <p>
                This Contract is managed by {contractOwner}, with currently {players.length} signed in that are
                competing to win {balance} Ether
            </p>
            <hr/>
            <form onSubmit={enterLottery}>
                <h4>Want to enter?</h4>
                <div>
                    <label>Amount of ether to enter</label>
                    <input value={etherValueToEnter} onChange={event => setEtherValueToEnter(event.target.value)}/>
                </div>
                <button>Enter</button>
            </form>
            {transactionState}
            {
                contractOwner === accounts[0] ?
                    <Button variant="contained" onClick={chooseWinner}>Choose Winner</Button>
                    : null
            }
            {
                isWalletConnected ?
                    null :
                    <Button variant="contained" onClick={ethEnabled} disabled={!(window as any).ethereum}>Connect to
                        Metamask</Button>
            }
        </div>
    );
}

export default App;
