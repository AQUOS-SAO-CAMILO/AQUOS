import os
from dotenv import load_dotenv
from pathlib import Path

root_dir = Path(__file__).parent.parent.parent.parent
env_path = root_dir / '.env'
load_dotenv(dotenv_path=env_path)

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    
    print(f"Procurando .env em: {env_path}")
    print(f"SECRET_KEY carregada: {SECRET_KEY is not None}")