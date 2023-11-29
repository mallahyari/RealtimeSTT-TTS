from pydantic import BaseModel



class UserQuery(BaseModel):
    text: str

