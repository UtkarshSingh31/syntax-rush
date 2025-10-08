import logging, os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))          # directory of src/logger.py
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))   # adjust if needed
RUN_STAMP = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
LOG_DIR = os.path.join(PROJECT_ROOT, "logs", RUN_STAMP)        # ml/logs/<stamp>
os.makedirs(LOG_DIR, exist_ok=True)

LOG_FILE = f"{RUN_STAMP}.log"
LOG_FILE_PATH = os.path.join(LOG_DIR, LOG_FILE)

logging.basicConfig(
    filename=LOG_FILE_PATH,
    format="[{asctime}] - {levelname} - {name} - {message}",
    style="{",
    level=logging.INFO,
)


if __name__=="__main__":
    logging.info("Logging has started")