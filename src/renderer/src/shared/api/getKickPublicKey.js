import axios from 'axios';
export async function getKickPublicKey() {
    const { data } = await axios.get(`https://api.kick.com/public/v1/public-key`);
    return data;
}
