import wretch from "wretch";
import fetch from "node-fetch";
const w = wretch().polyfills({ fetch });
const {
  LIQUID_ELECTRS_URL,
  HASURA_SECRET,
  HASURA_URL,
  CLOUDFLARE_TOKEN,
  CLOUDFLARE_ZONE,
  COINOS_URL,
  COINOS_TOKEN,
  HBP_URL,
  IPFS_WEB_URL,
  RPCHOST,
  RPCPORT,
  RPCUSER,
  RPCPASS,
  RPCWALLET,
} = process.env;

// const DELAY = LIQUID_ELECTRS_URL.includes("blockstream") ? 40 : 0;
const DELAY = 0;

const queue = [];

const enqueue = (next) => (url, opts) =>
  new Promise((r) => queue.push(() => r(next(url, opts))) && ddequeue());

let timer;
const dequeue = () => {
  if (queue.length) {
    queue.shift()();
    ddequeue();
  }
};

const ddequeue = () => {
  clearTimeout(timer);
  timer = setTimeout(dequeue, DELAY);
};

export const api = (h) => wretch().url(`${HASURA_URL}/v1/graphql`).headers(h);
export const electrs = wretch().middlewares([enqueue]).url(LIQUID_ELECTRS_URL);
export const registry = wretch().url("https://assets.blockstream.info/");
export const coinos = wretch().url(COINOS_URL).auth(`Bearer ${COINOS_TOKEN}`);
export const ipfs = wretch().url(IPFS_WEB_URL);

export const q = async (
  query,
  variables,
  headers = {
    "x-hasura-admin-secret": HASURA_SECRET,
  }
) => {
  let { data, errors } = await api(headers).post({ query, variables }).json();
  if (errors) {
    for (let index = 0; index < errors.length; index++) {
      const element = errors[index];
    }
    throw new Error(errors[0].message);
  }
  return data;
};

export const cf = wretch()
  .url(
    `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE}/dns_records`
  )
  .auth(`Bearer ${CLOUDFLARE_TOKEN}`);

export const hbp = wretch().url(HBP_URL);

const { APP_URL } = process.env;
export const lnft = wretch().url(APP_URL);

export const lq = new Proxy(
  {},
  {
    get:
      (target, prop) =>
      (...params) =>
        ((method, ...params) =>
          wretch()
            .url(`http://${RPCHOST}:${RPCPORT}/wallet/${RPCWALLET}`)
            .auth(
              `Basic ${Buffer.from(`${RPCUSER}:${RPCPASS}`).toString("base64")}`
            )
            .post({
              method,
              params,
            })
            .json(({ result }) => result))(prop.toLowerCase(), ...params),
  }
);
