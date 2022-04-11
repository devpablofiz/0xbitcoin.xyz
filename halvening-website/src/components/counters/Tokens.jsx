import React, { useState, useEffect} from 'react'
import useIntervalFetch from "../../hooks/useIntervalFetch";
import {Spinner,ProgressBar, Stack, ListGroup} from 'react-bootstrap';
import moment from 'moment';

function format(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function addZero(i) {
    if (i < 10) {i = "0" + i}
    return i;
}

const Tokens = () => {
    const dataURL = "https://0xbtc.info/api/stats.json";

    const { data, isPending, error } = useIntervalFetch(dataURL);
    const [maxSupplyInCurrentEra, setMaxSupplyInCurrentEra] = useState(null)
    const [circulatingSupply, setcirculatingSupply] = useState(null);
    const [tokensUntilHalvening, setTokensUntilHalvening] = useState(null);
    const [timeUntilHalvening, setTimeUntilHalvening] = useState(null);
    const [lastRewardAmount, setLastRewardAmount] = useState(null);
    const [progress, setProgress] = useState(null);
    const [time, setTime] = useState("");

    useEffect(() => {
        if (isPending || (data === null && error === null)) {
            return;
        }
        if (data) {
            let formattedEraSupply = data.maxSupplyForEra/Math.pow(10,8)
            let tokensRemaining = formattedEraSupply-data.circulatingSupply;
            let formattedRewardAmount = data.lastRewardAmount/Math.pow(10,8)
            let blocksRemaining = tokensRemaining/formattedRewardAmount;
            let blockTime = (data.secondsPerReward+60*13) / 2;

            setcirculatingSupply(data.circulatingSupply);
            setMaxSupplyInCurrentEra(formattedEraSupply);
            setTokensUntilHalvening(tokensRemaining);
            setProgress(data.circulatingSupply/formattedEraSupply*100);
            setLastRewardAmount(formattedRewardAmount);
            setTimeUntilHalvening(moment.duration(blocksRemaining*blockTime, 'seconds').humanize());
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
                    <Stack direction="vertical" className='mb-1' gap={3}>
                        <ListGroup variant='flush' className='list-group-custom'>
                            <ListGroup.Item className='list-group-custom-item'> 
                            </ListGroup.Item>
                            <ListGroup.Item className='list-group-custom-item'>
                                <h2>Halvening Progress</h2>
                                <h2>
                                    {format(circulatingSupply)+"/"+format(maxSupplyInCurrentEra)}
                                </h2>
                                <ProgressBar animated variant="dark" className='mb-2' now={circulatingSupply} max={maxSupplyInCurrentEra}
                                    label={`${progress.toFixed(2)}%`} style={{height:"4rem"}}
                                />
                            </ListGroup.Item>
                            <ListGroup.Item className='list-group-custom-item'>
                                <h3>There are {format(tokensUntilHalvening)} tokens left to mine </h3>
                                <h5>The reward will drop to {lastRewardAmount/2} 0xBTC in ~{timeUntilHalvening}*</h5>
                            </ListGroup.Item>
                            <ListGroup.Item className='list-group-custom-item'>
                                <h6 style={{color:"gray"}} className='mb-2'>Updated at {time}</h6   >
                            </ListGroup.Item>
                        </ListGroup>
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
