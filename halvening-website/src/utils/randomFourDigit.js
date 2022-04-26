const randomFourDigit = () => {
    const val = Math.floor(1000 + Math.random() * 9000);
    
    return val;
}

export default randomFourDigit;
