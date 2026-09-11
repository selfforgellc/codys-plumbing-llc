import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Resolve path to built frontend static assets
  const staticPath = path.resolve(__dirname, "public");

  app.use(express.static(staticPath));

  // Route all unknown paths to React's index.html
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"), (err) => {
      if (err) {
        // Fallback if public isn't nested
        res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
      }
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);