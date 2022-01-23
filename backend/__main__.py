import backend.main
import uvicorn

import os

uvicorn.run(backend.main.app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))