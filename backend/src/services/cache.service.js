import NodeCache from "node-cache";

// TTL de 10 minutos (600 segundos)
const cache = new NodeCache({ stdTTL: 600 });

export default cache;
