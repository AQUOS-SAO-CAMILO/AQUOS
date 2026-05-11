import logging
from logging.config import dictConfig 
from pathlib import Path

def setup():
    Path("logs").mkdir(exist_ok=True)

    dictConfig({
        "version": 1,                    
        "disable_existing_loggers": False,  

        "formatters": {
            "padrao": {
                "format": "%(levelname)s | %(name)s | %(asctime)s | %(message)s"
            }
        },

        "handlers": {
            "terminal": {
                "class": "logging.StreamHandler",
                "formatter": "padrao",
                "level": "DEBUG",
                "stream": "ext://sys.stdout"
            },
            "arquivo": {
                "class": "logging.handlers.RotatingFileHandler",
                "formatter": "padrao",
                "level": "DEBUG",
                "filename": "logs/app.log",
                "maxBytes": 1024 * 1024 * 5,  
                "backupCount": 3,
                "encoding": "utf-8"
            }
        },

        "root": {
            "level" : "DEBUG",
            "handlers": ["terminal", "arquivo"]
        },

        "loggers": {
            "meuapp": {
                "level": "DEBUG"
            }
        }
    })