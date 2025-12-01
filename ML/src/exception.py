import sys
import traceback
from typing import Optional
from src.logger import logging


def format_error_message(error: BaseException) -> str:
    exc_type, exc_value, exc_tb = sys.exc_info()

    if exc_tb is None:
        # No active traceback; just return the stringified error
        return str(error)

    file_name = exc_tb.tb_frame.f_code.co_filename
    line_no = exc_tb.tb_lineno

    return "Error in [{0}] line [{1}]: {2}".format(
        file_name,
        line_no,
        str(error),
    )

class CustomException(Exception):
    """
    Custom exception that captures a formatted error message and
    optionally stores the original exception and traceback.
    """
    def __init__(self, error: BaseException | str, original_exception: Optional[BaseException] = None):
        # If a string is passed, use it directly; if an exception is passed, format it
        if isinstance(error, BaseException):
            message = format_error_message(error)
            orig = error
        else:
            message = str(error)
            orig = original_exception

        super().__init__(message)
        self.error_message = message
        self.original_exception = orig
        self.traceback = traceback.format_exc()

    def __str__(self) -> str:
        return self.error_message
