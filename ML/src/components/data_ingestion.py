import sys
import os
import uuid
import time
from dataclasses import dataclass, field, asdict 
from datetime import datetime
from typing import List,Dict,Union,Optional
from enum import Enum

from src.exception import CustomException
from src.logger import logging

import requests
from pymongo import MongoClient # type: ignore
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry


class Language(str,Enum):
    python="python"
    cpp="cpp"
    javascript="javascript"
    java="java"

LANGUAGES = [lang.value for lang in Language]

class MODE(str, Enum):
    practice = "practice"
    battle = "battle"
    contest = "contest"

MODES = [m.value for m in MODE]

@dataclass
class Submission:

    code :str
    user_id:str
    submission_id:str
    source:str #api or database.
    language:Language
    mode:MODE
    timestamp: str=field(default_factory=lambda:datetime.utcnow().isoformat())
    correlation_id:str=field(default_factory=lambda:str(uuid.uuid4()))
    metadata:Dict=field(default_factory=dict)


    def __post_init__(self):
        if not self.code or self.code.strip():
            raise ValueError("code cannot be empty")
        if len(self.code) >50000:
            raise ValueError(f"Code too large : {len(self.code)}")
        if self.language.lower() not in Language:
            raise ValueError(f"Unsupported language! : {self.language}")
        if self.mode not in MODE:
            raise ValueError(f"Invalid mode!: {self.mode}")

    def to_dict(self):
        "Convert to dictionary"
        return asdict(self)


@dataclass
class IngestionConfig:

    language: Language
    api_timeout_connect: int = 5  # seconds
    api_timeout_read: int = 30
    api_max_retries: int = 3
    api_retry_backoff: float = 0.3

    mongo_timeout: int = 10
    mongo_max_pool_size: int = 10
    mongo_batch_size: int = 10

    max_code_size: int = 50000  # characters
    modes = MODE

    @classmethod
    def from_env(cls):
        return cls(
            api_timeout_connect=int(os.getenv("API_TIMEOUT_CONNECT",5)),
            api_timeout_read=int(os.getenv("API_TIMEOUT_READ",30)),
            max_code_size=int(os.getenv("MAX_CODE_SIZE",50000)),
            language=Language.python
        )
    

class DataIngestion:
    """
    Handles fetching code snippets from different sources:
    - REST API
    - MongoDB Database
    - Local Files (Optional)
    """

    def __init__(self,config:Optional[IngestionConfig]=None):
        self.config=config or IngestionConfig.from_env()
        self._mongo_client=None # only connect when databse is needed.

        self.session=requests.Session()
        retry_strategy=Retry(
            total=self.config.api_max_retries,
            backoff_factor=self.config.api_retry_backoff,
            status_forcelist=[429,500,502,503,504],
            allowed_methods=["GET","POST"]
        )

        adapter=HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://",adapter)
        self.session.mount("https://",adapter)


    def fetch_code_from_api(self, api_url: str, params: Optional[dict] = None, headers: Optional[dict] = None,user_id:str=None,submission_id:str=None,mode:str=MODE) -> Submission:

        correlation_id=str(uuid.uuid4())
        start_time=time.time()

        try:
            logging.info(
                f"{correlation_id} API fetch started",
                extra={
                    "correlation_id":correlation_id,
                    "api_url":api_url,
                    "user_id":user_id,
                    "mode":mode
                }
            )

            # make request with timeouts.
            response = self.session.get(
                api_url,
                params=params,
                headers=headers,
                timeout=(self.config.api_timeout_connect,self.config.api_timeout_read)
            )

            response.raise_for_status() # check http status
            
            try:
                return response.json()
            except Exception:
                data={"code":response.text}

            if isinstance(data,dict):
                code=data.get("code") or data.get("content") or data.get("submission")    
                if not code:
                    raise CustomException("API_INVALID_RESPONSE: No code field found in API response.",sys)
            else:
                code =str(data)

            code=self._validate_normalize_code(code,correlation_id)

            submission=Submission(
                code=code,
                user_id=user_id or data.get("user_id", "unknown"),
                submission_id=submission_id or data.get("submission_id", str(uuid.uuid4())),
                source="api",
                language=data.get(Language),
                mode=mode,
                correlation_id=correlation_id,
                metadata={
                    "api_url": api_url,
                    "latency_ms": int((time.time() - start_time) * 1000),
                    "status_code": response.status_code
                }
            )

            logging.info(
                f"[{correlation_id}] API fetch successful",
                extra={
                    "correlation_id": correlation_id,
                    "user_id": submission.user_id,
                    "code_size": len(code),
                    "latency_ms": submission.metadata["latency_ms"]
                }
            )

            return submission
        
        except requests.exceptions.Timeout as e:
            logging.error(f"[{correlation_id}] API timeout: {e}")
            raise CustomException(f"API_TIMEOUT: {api_url} timed out", sys)
            
        except requests.exceptions.HTTPError as e:
            status = e.response.status_code if e.response else "unknown"
            logging.error(f"[{correlation_id}] API HTTP error {status}: {e}")
            raise CustomException(f"API_HTTP_ERROR: {status} - {str(e)}", sys)
            
        except requests.exceptions.RequestException as e:
            logging.error(f"[{correlation_id}] API request failed: {e}")
            raise CustomException(f"API_REQUEST_ERROR: {str(e)}", sys)
            
        except ValueError as e:
            logging.error(f"[{correlation_id}] Validation error: {e}")
            raise CustomException(f"VALIDATION_ERROR: {str(e)}", sys)
            
        except Exception as e:
            logging.error(f"[{correlation_id}] Unexpected error: {e}")
            raise CustomException(f"API_UNKNOWN_ERROR: {str(e)}", sys)
        

    def fetch_code_from_mongo(self, db_url: str, db_name: str, collection_name: str, query: dict,mode:str=MODE) -> List[Submission]:
        """Fetch code from MongoDB collection."""
        
        correlation_id=str(uuid.uuid4())
        start_time=time.time()

        try:
            logging.info(
                f"[{correlation_id} MongoDB fetch started]",
                extra={
                    "correlation_id":correlation_id,
                    "db_name":db_name,
                    "collection":collection_name,
                    "query":str(query)
                }
            )

            if not self._mongo_client:
                self._mongo_client=MongoClient(
                    db_url,
                    serverSelectionTimeoutMS=self.config.mongo_timeout,
                    maxPoolSize=self.config.mongo_max_pool_size
                )

            db = self._mongo_client[db_name]
            collection = db[collection_name]

            cursor=collection.find(
                query,
                {
                    "code":1,
                    "user_id":1,
                    "submission_id":1,
                    "language":1,
                    "mode":1,
                    "timestamp":1,
                    "_id":0
                }
            ).limit(self.config.mongo_batch_size)

            submissions=[]
            for doc in cursor:
                try:
                    code=doc.get("code")
                    if not code:
                        logging.warning(f"{correlation_id} skipping the file because no code is there.")
                        continue

                    code=self._validate_and_normalize_code(
                        code,
                        correlation_id
                    )

                    submission=Submission(
                        code=code,
                        user_id=doc.get("user_id", "unknown"),
                        submission_id=doc.get("submission_id", str(uuid.uuid4())),
                        source="mongo",
                        language=doc.get(Language),
                        mode=doc.get("mode", mode),
                        timestamp=doc.get("timestamp", datetime.utcnow().isoformat()),
                        correlation_id=correlation_id,
                        metadata={
                            "db_name": db_name,
                            "collection": collection_name
                        }
                    )  
                    submissions.append(submission) 

                except ValueError as e:
                    logging.warning(f"[{correlation_id}] Invalid submission skipped: {e}")
                    continue
            
            latency_ms = int((time.time() - start_time) * 1000)
            logging.info(
                f"[{correlation_id}] MongoDB fetch successful",
                extra={
                    "correlation_id": correlation_id,
                    "count": len(submissions),
                    "latency_ms": latency_ms
                }
            )
            
            return submissions
        
        except Exception as e:
            logging.error(f"MongoDB fetch failed: {e}")
            raise CustomException(f"MongoDB fetch failed: {e}")


    def _validate_and_normalize_code(self,code:str,correlation_id:str)->str:

        if not code or not isinstance(code,str):
            raise ValueError("CODE MUST BE NON EMPTY STRING.")
        
        code=code.strip()

        if not code:
            raise ValueError("Code is empty after removing white space.")
        
        if not isinstance(self.language, Language):
            raise ValueError(f"Invalid language: {self.language}. Must be one of {[lang.value for lang in Language]}")

        # mode validation
        if self.mode not in MODE:
            raise ValueError(f"Invalid mode: {self.mode}. Must be one of {MODE}")

        if len(code) > self.config.max_code_size:
            logging.warning(
                f"[{correlation_id}] Code truncated from {len(code)} to {self.config.max_code_size}"
            )
            code=code[:self.config.max_code_size]

        code=code.replace('\r\n','\n').replace('\r','\n')
        code=code.replace('\x00','')

        try:
            code.encode('utf-8')
        except UnicodeError:
            raise ValueError("code contains invalid UTF-8 characters.")
        
        return code
    
    def close(self):
        
        if self._mongo_client:   # correct spelling "client"
            self._mongo_client.close()
            self._mongo_client = None
        self.session.close()
    
    def __enter__(self):
        
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        
        self.close()

if __name__=="__main__":
    '''Example usage'''

    config=IngestionConfig(
        api_timeout_connect=10,
        max_code_size=100000,
        language=Language.python
    )

    with DataIngestion(config) as ingestor:

        try:
            submission=ingestor.fetch_code_from_api(
                api_url="http://localhost:3000/api/submissions/123",
                user_id="user_101",
                submission_id="sub_101",
                mode="battle"
            )

            print(f"API Submission: {submission.to_dict()}")

        except CustomException as e:
            raise CustomException(e,sys)
        
        try:
            submission=ingestor.fetch_code_from_mongo(
                db_url="mongodb://localhost:27017",
                db_name="coding_database",
                collection_name="submissions",
                query={"user_id": "user_456", "status": "submitted"},
                mode="practice"
            )
            print(f"MongoDB Submissions: {len(submission)}")
            for sub in submission:
                print(f" :- {sub.submission_id}: {len(sub.code)} chars")

        except CustomException as e:
            raise CustomException(e,sys)
    
    