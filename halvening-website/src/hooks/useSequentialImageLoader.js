import { useState, useEffect } from 'react';

function useSequentialImageLoader(url, stableDone) {
    const [imageData, setImageData] = useState(null);
    const [imageIsPending, setImageIsPending] = useState(true);
    const [imageError, setImageError] = useState(null);

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
                return res.blob();
            })
            .then(data => {
                const imageURL = URL.createObjectURL(data);
                setImageData(imageURL);
                setImageError(null);
                setImageIsPending(false);
            })
            .catch(err => {
                if (err.name === 'AbortError') {
                    console.log('fetch aborted');
                } else {
                    setImageError(err.message);
                    setImageIsPending(false);
                }
            })
        return () => abortController.abort();
    }, [url, stableDone])

    return { imageData, imageIsPending, imageError }
}

export default useSequentialImageLoader;