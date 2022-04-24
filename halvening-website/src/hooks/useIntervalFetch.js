import { useState, useEffect } from 'react';

function useFetch(url) {
    const [data, setData] = useState(null);
    const [firstLoad,setFirstLoad] = useState(true);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async() => {
        const abortController = new AbortController();

        fetch(url, { signal: abortController.signal })
            .then(res => {
                if (!res.ok) {
                    throw Error('could not fetch the data for that resource');
                }
                return res.json();
            })
            .then(data => {
                setIsPending(false);
                setData(data);
                setError(null);
            })
            .catch(err => {
                if (err.name === 'AbortError') {
                    console.log('fetch aborted')
                } else {
                    setIsPending(false);
                    setError(err.message);
                }
            })
        return () => abortController.abort();
    }

    useEffect(() => {
        if(firstLoad){
            loadData();
            setFirstLoad(false);
        }else{
            const interval = setInterval(() => {
                loadData();
                console.log("fetching")
            }, 5000)
    
            return () => clearInterval(interval)    
        }
        //eslint-disable-next-line
    },[firstLoad])

    return { data, isPending, error }
}

export default useFetch;