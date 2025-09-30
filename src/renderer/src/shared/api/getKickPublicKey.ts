import axios from 'axios'

type TResponse = {
  data: {
    public_key: string
  }
  message: string
}

export async function getKickPublicKey() {
  const { data } = await axios.get<TResponse>(`https://api.kick.com/public/v1/public-key`)
  return data
}
