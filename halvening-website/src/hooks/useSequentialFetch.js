import { useState, useEffect } from 'react';

function useSequentialFetch(url, stableDone) {
    const [data, setData] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(!url || !stableDone) {
            return;
        }
        const abortController = new AbortController();

        fetch(url, { signal: abortController.signal, mode: 'cors' })
            .then(res => {
                if (!res.ok) {
                    throw Error('could not fetch the data for that resource');
                }
                return res.json();
            })
            .then(data => {
                setData(data);
                setError(null);
                setIsPending(false);
            })
            .catch(err => {
                if (err.name === 'AbortError') {
                    console.log('fetch aborted');
                } else {
                    setError(err.message);
                    setIsPending(false);
                }
            })
        return () => abortController.abort();
    }, [url, stableDone])

    return { data, isPending, error }
}

export default useSequentialFetch;