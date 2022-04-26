import { Rock } from '../components'

const renderRocks = (rockData) => {
    let divs = [];

    for (const [key] of Object.entries(rockData)) {
        divs.push(
            <Rock key={key} id={key} rockData={rockData}/>
        )
    }

    return divs;
}

export default renderRocks;
