
const apiUrl=process.env.BUILD_MODE === "dev"? "https://localhost/svu/api": "https://ismael.club/svu/api";
const wsUrl=process.env.BUILD_MODE === "dev"? "wss://localhost:18001": "wss://ismael.club:18001";

export default {
    name: 'SVU',
    version: '2.0.0',
    icon: "./assets/images/favicon.png",
    extra: {
        apiUrl: apiUrl,
        wsUrl: wsUrl,
    },
  };