import React, { useState, useEffect} from 'react'
import useIntervalFetch from "../../hooks/useIntervalFetch";
import {Spinner,ProgressBar, Stack, Badge} from 'react-bootstrap'

function format(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function addZero(i) {
    if (i < 10) {i = "0" + i}
    return i;
}

const Tokens = () => {
    const dataURL = "https://0xbtc.info/api/stats.json"
    const { data, isPending, error } = useIntervalFetch(dataURL);
    const [maxSupplyInCurrentEra, setMaxSupplyInCurrentEra] = useState(null)
    const [circulatingSupply, setcirculatingSupply] = useState(null);
    const [tokensUntilHalvening, setTokensUntilHalvening] = useState(null);
    const [lastRewardAmount, setLastRewardAmount] = useState(null);
    const [progress, setProgress] = useState(null);
    const [time, setTime] = useState("")
    
    useEffect(() => {
        if (isPending || (data === null && error === null)) {
            return;
        }
        if (data) {
            setcirculatingSupply(data.circulatingSupply);
            setMaxSupplyInCurrentEra(data.maxSupplyForEra/Math.pow(10,8));
            setTokensUntilHalvening(maxSupplyInCurrentEra-data.circulatingSupply);
            setProgress(data.circulatingSupply/maxSupplyInCurrentEra*100);
            setLastRewardAmount(data.lastRewardAmount/Math.pow(10,8));
        }
        const d = new Date();
        let h = addZero(d.getHours());
        let m = addZero(d.getMinutes());
        let s = addZero(d.getSeconds());
        let formattedTime = h + ":" + m + ":" + s;
        setTime(formattedTime)
    }, [data, isPending, error]);

    return (
        <div>
            {circulatingSupply ? (  
                    <Stack direction="vertical" className='mb-4 mt-4' gap={3}>
                            <h1>The Halvening progress is:</h1>
                            <h2>
                                {format(circulatingSupply)+"/"+format(maxSupplyInCurrentEra)}
                            </h2>
                            <ProgressBar animated variant="success" now={circulatingSupply} max={maxSupplyInCurrentEra}
                                label={`${progress.toFixed(2)}%`} style={{height:"4rem"}}
                            />
                            <h3 className='mt-2'>There are {format(tokensUntilHalvening)} tokens left to mine </h3>
                            <h5>The reward will drop to {lastRewardAmount/2} 0xBTC </h5>
                            <h4 style={{color:"gray"}}>Updated {time}</h4>
                    </Stack>
            ) : (
                <div>
                    <Stack direction="vertical" className='mb-5 mt-4' gap={3}>
                        <h1>The Halvening progress is:</h1>
                        <h2>Loading the countdown...</h2>
                        <div><Spinner animation="grow"/></div>
                    </Stack>
                </div>
            )}
        </div>
    )
}

export default Tokens
