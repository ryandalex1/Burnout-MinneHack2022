from . import  main
import uvicorn

uvicorn.run(main.app, host="localhost", port=8000)
