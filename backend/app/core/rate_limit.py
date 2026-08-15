from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request, HTTPException

limiter = Limiter(key_func=get_remote_address)

def rate_limit_exceeded_handler(request: Request, exc: Exception):
    return HTTPException(
        status_code=429,
        detail="Too many requests. Please try again later."
    )