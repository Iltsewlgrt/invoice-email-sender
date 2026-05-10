import { app } from "./app";
import { config } from "./config";

app.listen(config.port, () => {
  console.log(`Invoice service listening on port ${config.port}`);
});
