import fetch from "node-fetch";

// calculate hosted server offset with online time API
let timeOffset = 0;
function fetchTime() {
  fetch("https://timeapi.io/api/time/current/zone?timeZone=Europe%2FParis")
    .then((res) => res.json())
    .then(({ datetime }) => {
      timeOffset = Date.now() - new Date(datetime);
    })
    .catch((err) => {
      console.log(err);
    });
}
fetchTime();
setInterval(fetchTime, 24 * 3600 * 1000);

export default function ping(createdTimestamp) {
  // calculate the time taken to process this message
  const timeTaken = Date.now() - createdTimestamp - timeOffset;

  return {
    title: "I'm alive!",
    description: `Ping: ${timeTaken}ms.`,
  };
}
