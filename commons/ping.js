import fetch from 'node-fetch';

// calculate hosted server offset with online time API
let timeOffset = 0;
function fetchTime() {
    fetch('http://worldtimeapi.org/api/ip')
    .then(res => res.json())
    .then(({ datetime }) => {
        timeOffset = Date.now() - new Date(datetime);
    }).catch(err => {
        console.trace(err);
    })
}
fetchTime();
setInterval(fetchTime, 2 * 3600 * 1000);

export default function ping(createdTimestamp) {

    // calculate the time taken to process this message
    const timeTaken = Date.now() - createdTimestamp - timeOffset;

    return {
        title: "I'm alive!",
        description: `Ping: ${timeTaken}ms.`
    }
}